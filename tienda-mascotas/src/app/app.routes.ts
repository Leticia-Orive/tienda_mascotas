import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CartPage } from './pages/cart-page/cart-page';
import { LoginPage } from './pages/login-page/login-page';
import { AdminPage } from './pages/admin-page/admin-page';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

// Rutas principales de la tienda.
export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'login', component: LoginPage },
	{ path: 'admin', component: AdminPage, canActivate: [adminGuard] },
	{ path: 'catalogo', component: Home, canActivate: [authGuard] },
	{ path: 'carrito', component: CartPage },
	// Cualquier URL no valida redirige al inicio.
	{ path: '**', redirectTo: '' }
];
