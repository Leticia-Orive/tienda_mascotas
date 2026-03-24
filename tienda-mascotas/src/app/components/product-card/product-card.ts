import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
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
  // Si el usuario no esta registrado, le ofrece registrarse para obtener
  // el 10% de descuento en sus primeras 3 compras. Si rechaza el registro,
  // puede igualmente comprar como invitado.
  compraInmediata(): void {
    if (this.product.stock < 1) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      const quiereRegistro = window.confirm(
        'Puedes comprar como invitada o registrarte para obtener 10% de descuento en tus primeras 3 compras.\n\nAceptar: Registrarme\nCancelar: Continuar como invitada.'
      );

      if (quiereRegistro) {
        // Redirige al login en modo registro y, tras completarlo,
        // devuelve al usuario directamente al carrito (returnUrl).
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: '/carrito', mode: 'register' }
        });
        return;
      }
    }

    // Agrega el producto al carrito y navega directamente a el.
    this.cartService.agregarAlCarrito(this.product);
    this.router.navigate(['/carrito']);
  }
}
