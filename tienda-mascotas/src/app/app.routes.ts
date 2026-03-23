import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CartPage } from './pages/cart-page/cart-page';
import { LoginPage } from './pages/login-page/login-page';
import { authGuard } from './guards/auth.guard';

// Rutas principales de la tienda.
export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'login', component: LoginPage },
	{ path: 'catalogo', component: Home, canActivate: [authGuard] },
	{ path: 'carrito', component: CartPage, canActivate: [authGuard] },
	// Cualquier URL no valida redirige al inicio.
	{ path: '**', redirectTo: '' }
];
