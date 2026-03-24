import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth';
import { ProductList } from '../../components/product-list/product-list';

@Component({
  selector: 'app-admin-page',
  imports: [ProductList],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
})
export class AdminPage {
  authService = inject(AuthService);

  resumen = this.authService.obtenerResumenAdmin();
}
