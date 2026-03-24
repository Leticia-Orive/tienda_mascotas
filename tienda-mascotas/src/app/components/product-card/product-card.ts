import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { QuickCheckoutModal } from '../quick-checkout-modal/quick-checkout-modal';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, QuickCheckoutModal],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  // Producto recibido desde el componente padre (product-list) para pintar la tarjeta.
  @Input({ required: true }) product!: Product;

  // Eventos que sube al padre cuando el admin pulsa Ver, Editar o Borrar.
  // El padre (product-list) es quien ejecuta la logica real de cada accion.
  @Output() viewRequested = new EventEmitter<Product>();
  @Output() editRequested = new EventEmitter<Product>();
  @Output() deleteRequested = new EventEmitter<number>();

  // Signal que controla si el modal de compra directa esta visible.
  // Null cuando esta cerrado; contiene el producto cuando se abre.
  checkoutModalVisible = signal<Product | null>(null);

  cartService = inject(CartService);
  // authService se usa para saber si el usuario es admin o cliente
  // y mostrar botones distintos segun su rol.
  authService = inject(AuthService);
  router = inject(Router);

  agregar(): void {
    // Envia el producto al servicio para sumarlo al carrito.
    this.cartService.agregarAlCarrito(this.product);
  }

  // Notifica al padre que se quiere ver el detalle de este producto.
  verProducto(): void {
    this.viewRequested.emit(this.product);
  }

  // Notifica al padre que se quiere editar este producto (solo admin).
  editarProducto(): void {
    this.editRequested.emit(this.product);
  }

  // Notifica al padre que se quiere borrar este producto (solo admin).
  borrarProducto(): void {
    this.deleteRequested.emit(this.product.id);
  }

  // Permite comprar un producto directamente sin pasar por el catalogo.
  // Abre un modal donde se puede seleccionar cantidad y decidir si registrarse
  // para obtener descuento (si el usuario es invitado).
  compraInmediata(): void {
    if (this.product.stock < 1) {
      return;
    }

    // Abre el modal de checkout
    this.checkoutModalVisible.set(this.product);
  }

  // Maneja el resultado del modal de compra directa.
  // Si el usuario confirma, agrega el producto al carrito con la cantidad seleccionada.
  // Si es invitado y quiere registrarse, lo redirige a login con mode=register.
  onCheckoutConfirmed(result: { cantidad: number; wantsRegister: boolean }): void {
    // Agrega el producto al carrito (CartService suma multiples llamadas por cantidad).
    for (let i = 0; i < result.cantidad; i++) {
      this.cartService.agregarAlCarrito(this.product);
    }

    // Cierra el modal
    this.checkoutModalVisible.set(null);

    if (result.wantsRegister) {
      // Redirige a login en modo registro con opcion de volver a carrito.
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/carrito', mode: 'register' }
      });
    } else {
      // Va directamente al carrito
      this.router.navigate(['/carrito']);
    }
  }

  // Cierra el modal sin confirmar
  onCheckoutClosed(): void {
    this.checkoutModalVisible.set(null);
  }
}
