/**
 * Servicio de gestión para próximos productos
 *
 * QUÉ ES:
 * Servicio Angular injectable que gestiona el lifecycle completo de productos próximos:
 * lectura, almacenamiento, validación y CRUD (crear, leer, actualizar, borrar).
 *
 * PARA QUÉ SIRVE:
 * - Centralizar la lógica de próximos productos (evita código duplicado)
 * - Persistir datos en localStorage para que sobrevivan recargas de página
 * - Proporcionar una signal reactiva para que componentes se suscriban a cambios
 * - Validar categorías y datos antes de guardar
 *
 * FUNCIONALIDAD PRINCIPAL:
 * - Carga datos del localStorage al iniciar; si no hay, usa UPCOMING_PRODUCTS por defecto
 * - Expone proximosProductos como signal de solo lectura para reactividad
 * - Permite añadir, editar y borrar productos con persistencia automática
 * - Valida que los datos guardados sean correctos (tipado)
 * - Compatible con server-side rendering (detecta si es navegador)
 *
 * MÉTODOS PÚBLICOS:
 * - anadirProducto(): Crea nuevo próximo producto
 * - editarProducto(): Actualiza próximo producto existente
 * - borrarProducto(): Elimina próximo producto
 * - categoriasValidas(): Retorna array de categorías válidas
 */
import { PLATFORM_ID, Injectable, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UPCOMING_PRODUCTS } from '../data/upcoming-products.data';
import { Categoria, UpcomingProduct } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class UpcomingProductsService {
  // Clave bajo la cual se persisten los próximos productos en localStorage
  private readonly storageKey = 'petshop.upcoming-products';
  // Detecta si estamos en navegador (no server-side rendering) para usar localStorage
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signal reactiva privada que contiene los próximos productos actuales
  private _proximosProductos = signal<UpcomingProduct[]>(this.loadProducts());
  // Signal pública de solo lectura: otros componentes pueden suscribirse a cambios
  readonly proximosProductos = this._proximosProductos.asReadonly();

  /**
   * Añade un nuevo próximo producto.
   * Calcula automáticamente el siguiente ID disponible y persiste en localStorage.
   * @param input Datos del nuevo producto (sin id, que se genera automáticamente)
   */
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

  /**
   * Actualiza un próximo producto existente.
   * Reemplaza los datos del producto con ID coincidente.
   * @param id ID del próximo producto a editar
   * @param input Nuevos datos del producto
   */
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

  /**
   * Elimina un próximo producto por su ID.
   * @param id ID del próximo producto a borrar
   */
  borrarProducto(id: number): void {
    this._proximosProductos.update(items => items.filter(item => item.id !== id));
    this.saveProducts(this._proximosProductos());
  }

  /**
   * Carga los próximos productos desde localStorage (o datos por defecto si vacío).
   *
   * FLUJO:
   * 1. Si no es navegador (SSR), retorna UPCOMING_PRODUCTS por defecto
   * 2. Intenta leer de localStorage con clave 'petshop.upcoming-products'
   * 3. Si no hay datos, retorna UPCOMING_PRODUCTS por defecto
   * 4. Si hay datos, valida que sean UpcomingProduct válidos (tipado)
   * 5. Si hay error, retorna UPCOMING_PRODUCTS por seguridad
   *
   * @returns Array de próximos productos (local o por defecto)
   */
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

      // Valida cada producto guardado para evitar corrupción de datos
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
      // Si hay error al parsear, retorna datos por defecto
      return [...UPCOMING_PRODUCTS];
    }
  }

  /**
   * Persiste los próximos productos en localStorage.
   * Se ignora en servidor (SSR) ya que localStorage no existe allí.
   * @param products Array de próximos productos a guardar
   */
  private saveProducts(products: UpcomingProduct[]): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(products));
  }

  /**
   * Retorna array de categorías válidas.
   * Se usa en formularios admin para validación y select options.
   * @returns Array de categorías permitidas
   */
  categoriasValidas(): Categoria[] {
    return ['alimento', 'juguetes', 'accesorios', 'cuidado'];
  }
}
