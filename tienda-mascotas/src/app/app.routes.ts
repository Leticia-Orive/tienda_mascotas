import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CartPage } from './pages/cart-page/cart-page';

// Rutas principales de la tienda.
export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'catalogo', component: Home },
	{ path: 'carrito', component: CartPage },
	// Cualquier URL no valida redirige al inicio.
	{ path: '**', redirectTo: '' }
];
