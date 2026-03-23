import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  cartService = inject(CartService);
  authService = inject(AuthService);
  router = inject(Router);

  // Si hay sesion activa, cierra sesion y redirige al login con mensaje.
  onSesionClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.authService.isLoggedIn()) {
      this.authService.cerrarSesion();
      this.router.navigate(['/login'], { queryParams: { logout: '1' } });
      return;
    }

    this.router.navigate(['/login']);
  }

  // Pide confirmacion + password actual antes de eliminar la cuenta.
  async onEliminarCuenta(): Promise<void> {
    const confirmed = window.confirm('Esta accion eliminara tu cuenta. Deseas continuar?');
    if (!confirmed) {
      return;
    }

    const password = window.prompt('Para confirmar, ingresa tu contrasena actual:') ?? '';
    const result = await this.authService.eliminarCuentaActual(password);

    if (result.ok) {
      this.router.navigate(['/login'], { queryParams: { deleted: '1' } });
      return;
    }

    window.alert(result.message);
  }
}
