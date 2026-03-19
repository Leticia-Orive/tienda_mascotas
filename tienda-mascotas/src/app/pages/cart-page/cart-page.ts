import { Component } from '@angular/core';
import { CartComponent } from '../../components/cart/cart';

@Component({
  selector: 'app-cart-page',
  imports: [CartComponent],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {}
