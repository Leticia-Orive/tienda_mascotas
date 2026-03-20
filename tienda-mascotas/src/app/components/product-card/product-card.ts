import { Component, Input, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  // Producto recibido desde el listado para pintar la tarjeta.
  @Input({ required: true }) product!: Product;

  cartService = inject(CartService);

  agregar(): void {
    // Envia el producto al servicio para sumarlo al carrito.
    this.cartService.agregarAlCarrito(this.product);
  }
}
