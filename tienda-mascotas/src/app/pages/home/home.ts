import { Component, inject } from '@angular/core';
import { ProductList } from '../../components/product-list/product-list';
import { UpcomingProductsService } from '../../services/upcoming-products';

/**
 * Componente de página principal (Home)
 *
 * QUÉ ES:
 * Componente raíz de la página de inicio de PetShop que muestra:
 * 1. Un hero/banner de bienvenida
 * 2. Sección "Nuestros Productos" con el catálogo completo
 * 3. Sección "Próximos productos en tienda" con lanzamientos futuros
 *
 * PARA QUÉ SIRVE:
 * - Ser la landing page de la tienda
 * - Mostrar productos disponibles y próximos
 * - Permitir búsqueda y filtrado de catálogo
 * - Enlazar a otras secciones (carrito, login, etc)
 *
 * FUNCIONALIDAD:
 * - Inyecta UpcomingProductsService para acceder a signal proximosProductos
 * - Expone proximosProductos al template para renderizar tarjetas
 * - Importa ProductList para mostrar catálogo filtrable
 * - Reactivo: cambios en localStorage se reflejan automáticamente en la vista
 */
@Component({
  selector: 'app-home',
  imports: [ProductList],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  // Inyecta el servicio de próximos productos
  private upcomingProductsService = inject(UpcomingProductsService);
  // Expone la signal de próximos productos al template
  proximosProductos = this.upcomingProductsService.proximosProductos;
}
