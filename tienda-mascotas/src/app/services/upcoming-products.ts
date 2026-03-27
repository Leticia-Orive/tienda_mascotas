import { PLATFORM_ID, Injectable, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UPCOMING_PRODUCTS } from '../data/upcoming-products.data';
import { Categoria, UpcomingProduct } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class UpcomingProductsService {
  private readonly storageKey = 'petshop.upcoming-products';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private _proximosProductos = signal<UpcomingProduct[]>(this.loadProducts());
  readonly proximosProductos = this._proximosProductos.asReadonly();

  anadirProducto(input: Omit<UpcomingProduct, 'id'>): void {
    const nextId = this._proximosProductos().length > 0
      ? Math.max(...this._proximosProductos().map(item => item.id)) + 1
      : 1;

    this._proximosProductos.update(items => [
      ...items,
      {
        id: nextId,
        ...input,
      },
    ]);

    this.saveProducts(this._proximosProductos());
  }

  editarProducto(id: number, input: Omit<UpcomingProduct, 'id'>): void {
    this._proximosProductos.update(items =>
      items.map(item =>
        item.id === id
          ? { id, ...input }
          : item
      )
    );

    this.saveProducts(this._proximosProductos());
  }

  borrarProducto(id: number): void {
    this._proximosProductos.update(items => items.filter(item => item.id !== id));
    this.saveProducts(this._proximosProductos());
  }

  private loadProducts(): UpcomingProduct[] {
    if (!this.isBrowser) {
      return [...UPCOMING_PRODUCTS];
    }

    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return [...UPCOMING_PRODUCTS];
      }

      const parsed = JSON.parse(raw) as UpcomingProduct[];
      if (!Array.isArray(parsed)) {
        return [...UPCOMING_PRODUCTS];
      }

      return parsed.filter(item =>
        typeof item.id === 'number' &&
        typeof item.nombre === 'string' &&
        typeof item.descripcion === 'string' &&
        typeof item.lanzamiento === 'string' &&
        typeof item.precioEstimado === 'number' &&
        typeof item.imagen === 'string' &&
        ['alimento', 'juguetes', 'accesorios', 'cuidado'].includes(item.categoria)
      ) as UpcomingProduct[];
    } catch {
      return [...UPCOMING_PRODUCTS];
    }
  }

  private saveProducts(products: UpcomingProduct[]): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(products));
  }

  categoriasValidas(): Categoria[] {
    return ['alimento', 'juguetes', 'accesorios', 'cuidado'];
  }
}
