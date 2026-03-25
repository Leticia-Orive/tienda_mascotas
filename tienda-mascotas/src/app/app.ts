import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { AuthService } from './services/auth';
import { CartService } from './services/cart';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  constructor() {
    // Si la app arranca sin sesion activa, el carrito visible debe quedar vacio.
    if (!this.authService.isLoggedIn()) {
      this.cartService.inicializarInvitado();
    }
  }
}
