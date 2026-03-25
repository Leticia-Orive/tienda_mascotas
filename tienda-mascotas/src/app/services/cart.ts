import { Injectable, computed, signal } from '@angular/core';
import { CartItem, MetodoPago, Pedido, PuntoRecogida, Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly pedidosStorageKey = 'petshop_pedidos';

  // Signal interno con los items actuales del carrito.
  private _items = signal<CartItem[]>([]);
  private _pedidos = signal<Pedido[]>(this.cargarPedidos());

  // Exponemos el carrito en modo solo lectura para no mutarlo fuera del servicio.
  readonly items = this._items.asReadonly();
  readonly pedidos = this._pedidos.asReadonly();

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

  registrarPedido(metodoPago: MetodoPago, puntoRecogida: PuntoRecogida, direccionDomicilio: string, descuentoAplicado: number): void {
    const subtotal = this.totalPrice();
    const descuento = Math.max(0, descuentoAplicado);
    const totalFinal = Math.max(0, subtotal - descuento);

    const nuevoPedido: Pedido = {
      id: `PED-${Date.now()}`,
      fechaIso: new Date().toISOString(),
      metodoPago,
      puntoRecogida,
      ...(puntoRecogida === 'domicilio' && { direccionDomicilio }),
      subtotal,
      descuento,
      totalFinal,
      items: this._items().map(item => ({
        productId: item.product.id,
        nombre: item.product.nombre,
        precioUnitario: item.product.precio,
        cantidad: item.cantidad,
      })),
    };

    this._pedidos.set([nuevoPedido, ...this._pedidos()]);
    this.guardarPedidos();
  }

  private cargarPedidos(): Pedido[] {
    try {
      const raw = localStorage.getItem(this.pedidosStorageKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as Pedido[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private guardarPedidos(): void {
    try {
      localStorage.setItem(this.pedidosStorageKey, JSON.stringify(this._pedidos()));
    } catch {
      // Si localStorage falla, el flujo de compra no debe romperse.
    }
  }
}

