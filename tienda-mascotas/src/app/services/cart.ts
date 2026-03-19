import { Injectable, computed, signal } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();

  readonly totalItems = computed(() =>
    this._items().reduce((sum, item) => sum + item.cantidad, 0)
  );

  readonly totalPrice = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.precio * item.cantidad, 0)
  );

  agregarAlCarrito(product: Product): void {
    const items = this._items();
    const existing = items.find(i => i.product.id === product.id);
    if (existing) {
      this._items.set(
        items.map(i =>
          i.product.id === product.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      );
    } else {
      this._items.set([...items, { product, cantidad: 1 }]);
    }
  }

  eliminarDelCarrito(productId: number): void {
    this._items.set(this._items().filter(i => i.product.id !== productId));
  }

  actualizarCantidad(productId: number, cantidad: number): void {
    if (cantidad < 1) {
      this.eliminarDelCarrito(productId);
      return;
    }
    this._items.set(
      this._items().map(i =>
        i.product.id === productId ? { ...i, cantidad } : i
      )
    );
  }

  vaciarCarrito(): void {
    this._items.set([]);
  }
}

