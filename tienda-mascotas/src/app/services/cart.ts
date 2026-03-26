import { Injectable, computed, signal } from '@angular/core';
import { PRODUCTS } from '../data/products.data';
import { CartItem, MetodoPago, Pedido, PuntoRecogida, Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly pedidosStorageKeyPrefix = 'petshop.pedidos';
  private readonly cartStorageKeyPrefix = 'petshop.cart';
  private readonly productStorageKey = 'petshop.products';
  private activeCartOwnerEmail: string | null = null;
  private activePedidosOwnerEmail: string | null = null;

  // Signal interno con los items actuales del carrito.
  private _items = signal<CartItem[]>([]);
  private _pedidos = signal<Pedido[]>([]);

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
      if (existing.cantidad >= product.stock) {
        return;
      }

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

    this.persistirCarritoActivo();
  }

  eliminarDelCarrito(productId: number): void {
    this._items.set(this._items().filter(i => i.product.id !== productId));
    this.persistirCarritoActivo();
  }

  actualizarCantidad(productId: number, cantidad: number): void {
    const item = this._items().find(i => i.product.id === productId);
    if (!item) {
      return;
    }

    if (cantidad < 1) {
      // Evita cantidades invalidas; elimina el item si llega a 0.
      this.eliminarDelCarrito(productId);
      return;
    }

    const cantidadAjustada = Math.min(cantidad, item.product.stock);
    if (cantidadAjustada < 1) {
      this.eliminarDelCarrito(productId);
      return;
    }

    this._items.set(
      this._items().map(i =>
        i.product.id === productId ? { ...i, cantidad: cantidadAjustada } : i
      )
    );

    this.persistirCarritoActivo();
  }

  vaciarCarrito(): void {
    // Reinicia el carrito despues de la compra o por accion del usuario.
    this._items.set([]);
    this.persistirCarritoActivo();
  }

  activarCarritoUsuario(email: string): void {
    this.activeCartOwnerEmail = email;
    this.activePedidosOwnerEmail = email;
    this._items.set(this.cargarCarritoUsuario(email));
    this._pedidos.set(this.cargarPedidosUsuario(email));
  }

  desactivarCarritoUsuario(): void {
    this.persistirCarritoActivo();
    this.activeCartOwnerEmail = null;
    this.activePedidosOwnerEmail = null;
    this._items.set([]);
    this._pedidos.set([]);
  }

  inicializarInvitado(): void {
    this.activeCartOwnerEmail = null;
    this.activePedidosOwnerEmail = null;
    this._items.set([]);
    this._pedidos.set([]);
  }

  eliminarCarritoUsuario(email: string): void {
    try {
      localStorage.removeItem(this.getCartStorageKey(email));
    } catch {
      // Si localStorage falla, no debe bloquear la app.
    }

    if (this.activeCartOwnerEmail === email) {
      this.activeCartOwnerEmail = null;
      this._items.set([]);
    }

    try {
      localStorage.removeItem(this.getPedidosStorageKey(email));
    } catch {
      // Si localStorage falla, no debe bloquear la app.
    }

    if (this.activePedidosOwnerEmail === email) {
      this.activePedidosOwnerEmail = null;
      this._pedidos.set([]);
    }
  }

  registrarPedido(metodoPago: MetodoPago, puntoRecogida: PuntoRecogida, direccionDomicilio: string, descuentoAplicado: number): boolean {
    const catalogoActual = this.cargarCatalogoProductos();
    const stockPorProducto = new Map<number, number>(catalogoActual.map(producto => [producto.id, producto.stock]));

    const hayStockInsuficiente = this._items().some(item => {
      const stockDisponible = stockPorProducto.get(item.product.id) ?? item.product.stock;
      return item.cantidad > stockDisponible;
    });

    if (hayStockInsuficiente) {
      return false;
    }

    if (!this.activePedidosOwnerEmail) {
      this._items.set([]);
      return true;
    }

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

    this.descontarStockCatalogo(catalogoActual);
    return true;
  }

  private cargarPedidosUsuario(email: string): Pedido[] {
    try {
      const raw = localStorage.getItem(this.getPedidosStorageKey(email));
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
    if (!this.activePedidosOwnerEmail) {
      return;
    }

    try {
      localStorage.setItem(this.getPedidosStorageKey(this.activePedidosOwnerEmail), JSON.stringify(this._pedidos()));
    } catch {
      // Si localStorage falla, el flujo de compra no debe romperse.
    }
  }

  private cargarCarritoUsuario(email: string): CartItem[] {
    try {
      const raw = localStorage.getItem(this.getCartStorageKey(email));
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persistirCarritoActivo(): void {
    if (!this.activeCartOwnerEmail) {
      return;
    }

    try {
      localStorage.setItem(this.getCartStorageKey(this.activeCartOwnerEmail), JSON.stringify(this._items()));
    } catch {
      // Si localStorage falla, no debe bloquear la app.
    }
  }

  private getCartStorageKey(email: string): string {
    return `${this.cartStorageKeyPrefix}.${email}`;
  }

  private getPedidosStorageKey(email: string): string {
    return `${this.pedidosStorageKeyPrefix}.${email}`;
  }

  private cargarCatalogoProductos(): Product[] {
    try {
      const raw = localStorage.getItem(this.productStorageKey);
      if (!raw) {
        return [...PRODUCTS];
      }

      const parsed = JSON.parse(raw) as Product[];
      if (!Array.isArray(parsed)) {
        return [...PRODUCTS];
      }

      return parsed;
    } catch {
      return [...PRODUCTS];
    }
  }

  private descontarStockCatalogo(catalogoActual: Product[]): void {
    const stockCompradoPorId = new Map<number, number>();

    for (const item of this._items()) {
      const actual = stockCompradoPorId.get(item.product.id) ?? 0;
      stockCompradoPorId.set(item.product.id, actual + item.cantidad);
    }

    const catalogoActualizado = catalogoActual.map(producto => {
      const comprado = stockCompradoPorId.get(producto.id) ?? 0;
      if (comprado < 1) {
        return producto;
      }

      return {
        ...producto,
        stock: Math.max(0, producto.stock - comprado),
      };
    });

    try {
      localStorage.setItem(this.productStorageKey, JSON.stringify(catalogoActualizado));
    } catch {
      // Si localStorage falla, no debe bloquear la compra.
    }
  }
}

