import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CartPage } from './pages/cart-page/cart-page';

export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'catalogo', component: Home },
	{ path: 'carrito', component: CartPage },
	{ path: '**', redirectTo: '' }
];
