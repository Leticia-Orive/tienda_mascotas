import { Injectable, computed, signal } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Signal interno con los items actuales del carrito.
  private _items = signal<CartItem[]>([]);

  // Exponemos el carrito en modo solo lectura para no mutarlo fuera del servicio.
  readonly items = this._items.asReadonly();

  // Cantidad total de productos (sumando unidades repetidas).
  readonly totalItems = computed(() =>
    this._items().reduce((sum, item) => sum + item.cantidad, 0)
  );

  // Precio total del carrito en base a precio x cantidad.
  readonly totalPrice = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.precio * item.cantidad, 0)
  );

  agregarAlCarrito(product: Product): void {
    const items = this._items();
    const existing = items.find(i => i.product.id === product.id);
    if (existing) {
      // Si ya existe el producto, incrementa su cantidad.
      this._items.set(
        items.map(i =>
          i.product.id === product.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      );
    } else {
      // Si no existe, lo agrega con cantidad inicial 1.
      this._items.set([...items, { product, cantidad: 1 }]);
    }
  }

  eliminarDelCarrito(productId: number): void {
    this._items.set(this._items().filter(i => i.product.id !== productId));
  }

  actualizarCantidad(productId: number, cantidad: number): void {
    if (cantidad < 1) {
      // Evita cantidades invalidas; elimina el item si llega a 0.
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
    // Reinicia el carrito despues de la compra o por accion del usuario.
    this._items.set([]);
  }
}

