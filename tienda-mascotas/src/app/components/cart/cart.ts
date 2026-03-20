import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartComponent {
  cartService = inject(CartService);

  confirmarPedido(): void {
    // Simula confirmacion de compra y limpia el carrito.
    alert('✅ ¡Pedido confirmado! Gracias por tu compra en PetShop 🐾');
    this.cartService.vaciarCarrito();
  }
}
