import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mostrarMensajeCierre = false;
  mostrarMensajeCuentaEliminada = false;
  modo: 'login' | 'register' = 'login';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  constructor() {
    // Mensajes contextuales mostrados despues de cerrar sesion o eliminar cuenta.
    this.mostrarMensajeCierre = this.route.snapshot.queryParamMap.get('logout') === '1';
    this.mostrarMensajeCuentaEliminada = this.route.snapshot.queryParamMap.get('deleted') === '1';
  }

  // Alterna entre flujo de login y registro.
  cambiarModo(mode: 'login' | 'register'): void {
    this.modo = mode;
    this.errorMessage = '';
    this.successMessage = '';
    this.confirmPassword = '';
  }

  // Valida campos y ejecuta login/registro segun el modo actual.
  async enviarFormulario(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Debes completar correo y contrasena.';
      return;
    }

    if (this.modo === 'register') {
      if (this.password.length < 6) {
        this.errorMessage = 'La contrasena debe tener al menos 6 caracteres.';
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Las contrasenas no coinciden.';
        return;
      }

      const registerResult = await this.authService.registrarUsuario(this.email, this.password);
      if (!registerResult.ok) {
        this.errorMessage = registerResult.message;
        return;
      }

      this.successMessage = 'Registro completado. Bienvenida a tu cuenta.';
      this.goToReturnUrl();
      return;
    }

    const loginResult = await this.authService.iniciarSesion(this.email, this.password);
    if (!loginResult.ok) {
      this.errorMessage = loginResult.message;
      return;
    }

    this.successMessage = 'Sesion iniciada correctamente.';
    this.goToReturnUrl();
  }

  // Vuelve a la ruta solicitada originalmente o al inicio.
  private goToReturnUrl(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.router.navigateByUrl(returnUrl);
  }
}
