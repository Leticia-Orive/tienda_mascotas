import { Component, inject } from '@angular/core';
import { ProductList } from '../../components/product-list/product-list';
import { UpcomingProductsService } from '../../services/upcoming-products';

@Component({
  selector: 'app-home',
  imports: [ProductList],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private upcomingProductsService = inject(UpcomingProductsService);
  proximosProductos = this.upcomingProductsService.proximosProductos;
}
