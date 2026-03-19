import { Component } from '@angular/core';
import { ProductList } from '../../components/product-list/product-list';

@Component({
  selector: 'app-home',
  imports: [ProductList],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
