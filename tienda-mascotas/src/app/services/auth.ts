import { PLATFORM_ID, Injectable, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface AuthUser {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Lista de usuarios guardados localmente para un flujo de autenticacion basico.
  private readonly usersKey = 'petshop.users';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private _isLoggedIn = signal(false);
  private _currentUserEmail = signal<string | null>(null);

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly currentUserEmail = this._currentUserEmail.asReadonly();
  readonly sessionLabel = computed(() => this._isLoggedIn() ? 'Cerrar sesión' : 'Iniciar sesión');

  // Valida credenciales y abre sesion si coinciden.
  async iniciarSesion(email: string, password: string): Promise<{ ok: boolean; message: string }> {
    const users = this.getUsers();
    const normalizedEmail = this.normalizeEmail(email);
    const userIndex = users.findIndex(user => user.email === normalizedEmail);
    const existingUser = userIndex >= 0 ? users[userIndex] : null;

    if (!existingUser) {
      return { ok: false, message: 'Correo o contrasena incorrectos.' };
    }

    // Compatibilidad con usuarios antiguos (password plano) y nuevos (password hasheado).
    const hashedPassword = await this.hashPassword(password);
    const isHashedMatch = existingUser.password === hashedPassword;
    const isLegacyPlainMatch = existingUser.password === password;

    if (!isHashedMatch && !isLegacyPlainMatch) {
      return { ok: false, message: 'Correo o contrasena incorrectos.' };
    }

    // Migra usuarios antiguos guardados en texto plano al formato hash.
    if (isLegacyPlainMatch && !isHashedMatch && userIndex >= 0) {
      users[userIndex] = { ...existingUser, password: hashedPassword };
      this.saveUsers(users);
    }

    this._isLoggedIn.set(true);
    this._currentUserEmail.set(existingUser.email);
    return { ok: true, message: 'Sesion iniciada.' };
  }

  async registrarUsuario(email: string, password: string): Promise<{ ok: boolean; message: string }> {
    const normalizedEmail = this.normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return { ok: false, message: 'Completa correo y contrasena.' };
    }

    const users = this.getUsers();
    const alreadyExists = users.some(user => user.email === normalizedEmail);
    if (alreadyExists) {
      return { ok: false, message: 'Ese correo ya esta registrado.' };
    }

    // Guarda password con hash para no persistirla en texto plano.
    const hashedPassword = await this.hashPassword(password);
    users.push({ email: normalizedEmail, password: hashedPassword });
    this.saveUsers(users);

    this._isLoggedIn.set(true);
    this._currentUserEmail.set(normalizedEmail);
    return { ok: true, message: 'Usuario registrado correctamente.' };
  }

  cerrarSesion(): void {
    this._isLoggedIn.set(false);
    this._currentUserEmail.set(null);
  }

  // Elimina la cuenta activa solo si la password actual es correcta.
  async eliminarCuentaActual(password: string): Promise<{ ok: boolean; message: string }> {
    const email = this._currentUserEmail();
    if (!email) {
      return { ok: false, message: 'No hay una sesion activa.' };
    }

    if (!password.trim()) {
      return { ok: false, message: 'Debes ingresar tu contrasena actual.' };
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex < 0) {
      return { ok: false, message: 'No se encontro la cuenta activa.' };
    }

    const currentUser = users[userIndex];
    const hashedPassword = await this.hashPassword(password);
    const isValidPassword = currentUser.password === hashedPassword || currentUser.password === password;

    if (!isValidPassword) {
      return { ok: false, message: 'Contrasena incorrecta. No se elimino la cuenta.' };
    }

    const filteredUsers = users.filter(user => user.email !== email);
    this.saveUsers(filteredUsers);
    this.cerrarSesion();

    return { ok: true, message: 'Tu cuenta fue eliminada.' };
  }

  private getUsers(): AuthUser[] {
    if (!this.isBrowser) {
      return [];
    }

    const rawUsers = localStorage.getItem(this.usersKey);
    if (!rawUsers) {
      return [];
    }

    try {
      return JSON.parse(rawUsers) as AuthUser[];
    } catch {
      return [];
    }
  }

  private saveUsers(users: AuthUser[]): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  // Genera hash SHA-256 en navegador para almacenar una version no legible de la password.
  private async hashPassword(password: string): Promise<string> {
    if (!this.isBrowser || !crypto?.subtle) {
      return password;
    }

    const data = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(digest));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `sha256:${hashHex}`;
  }
}
