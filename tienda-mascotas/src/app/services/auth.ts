import { PLATFORM_ID, Injectable, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface AuthUser {
  email: string;
  password: string;
  role: 'admin' | 'customer';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Lista de usuarios guardados localmente para un flujo de autenticacion basico.
  // Clave bajo la que se guardan todos los usuarios en localStorage.
  private readonly usersKey = 'petshop.users';
  // Prefijo de clave para guardar cuantas compras con descuento le quedan a cada usuario.
  // Se combina con el email: petshop.welcomeDiscount.<email>
  private readonly discountKeyPrefix = 'petshop.welcomeDiscount';
  // Numero total de compras con 10% de descuento que recibe un usuario al registrarse.
  private readonly welcomeDiscountPurchases = 3;
  private readonly defaultAdminEmail = 'admin@petshop.com';
  // Hash SHA-256 de la password del admin por defecto para no guardarla en texto plano.
  private readonly defaultAdminPasswordHash = 'sha256:240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private _isLoggedIn = signal(false);
  private _currentUserEmail = signal<string | null>(null);
  private _currentUserRole = signal<'admin' | 'customer' | null>(null);
  private _welcomeDiscountRemaining = signal(0);

  // Signals publicos de solo lectura para que otros componentes
  // lean el estado de sesion sin poder modificarlo directamente.
  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly currentUserEmail = this._currentUserEmail.asReadonly();
  readonly currentUserRole = this._currentUserRole.asReadonly();
  // Compras con descuento que le quedan al usuario activo (disminuye con cada pedido confirmado).
  readonly welcomeDiscountRemaining = this._welcomeDiscountRemaining.asReadonly();
  // Total de compras con descuento que se otorga al registrarse (siempre 3).
  // Se usa en el carrito para calcular el progreso de la barra (X de 3).
  readonly welcomeDiscountTotal = this.welcomeDiscountPurchases;
  // Devuelve true si el usuario activo es administrador.
  // Se usa en templates para mostrar u ocultar controles exclusivos del admin.
  readonly isAdmin = computed(() => this._currentUserRole() === 'admin');
  // Tasa de descuento activa: 0.10 si el cliente tiene compras pendientes, 0 en caso contrario.
  // El carrito lo lee para calcular el importe del descuento y el total a pagar.
  readonly welcomeDiscountRate = computed(() => {
    if (this._currentUserRole() !== 'customer' || this._welcomeDiscountRemaining() < 1) {
      return 0;
    }

    return 0.10;
  });
  readonly sessionLabel = computed(() => this._isLoggedIn() ? 'Cerrar sesión' : 'Iniciar sesión');

  constructor() {
    this.ensureAdminUser();
  }

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
    this._currentUserRole.set(existingUser.role);
    this._welcomeDiscountRemaining.set(this.getWelcomeDiscountRemaining(existingUser.email));
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
    users.push({ email: normalizedEmail, password: hashedPassword, role: 'customer' });
    this.saveUsers(users);
    this.setWelcomeDiscountRemaining(normalizedEmail, this.welcomeDiscountPurchases);

    this._isLoggedIn.set(true);
    this._currentUserEmail.set(normalizedEmail);
    this._currentUserRole.set('customer');
    this._welcomeDiscountRemaining.set(this.welcomeDiscountPurchases);
    return { ok: true, message: 'Usuario registrado correctamente.' };
  }

  cerrarSesion(): void {
    this._isLoggedIn.set(false);
    this._currentUserEmail.set(null);
    this._currentUserRole.set(null);
    this._welcomeDiscountRemaining.set(0);
  }

  // Descuenta 1 uso del beneficio de bienvenida al confirmar un pedido.
  // Se llama desde el carrito cada vez que se finaliza una compra con descuento activo.
  // Persiste el nuevo contador en localStorage para que sobreviva recargas de pagina.
  consumirDescuentoBienvenida(): void {
    const email = this._currentUserEmail();
    const remaining = this._welcomeDiscountRemaining();
    if (!email || remaining < 1) {
      return;
    }

    const nextRemaining = remaining - 1;
    this.setWelcomeDiscountRemaining(email, nextRemaining);
    this._welcomeDiscountRemaining.set(nextRemaining);
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
    if (currentUser.role === 'admin') {
      return { ok: false, message: 'La cuenta administradora principal no se puede eliminar.' };
    }

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

  // Devuelve metricas simples para mostrar en el panel administrador.
  obtenerResumenAdmin(): { totalUsuarios: number; totalAdmins: number; totalClientes: number } {
    const users = this.getUsers();
    const totalAdmins = users.filter(user => user.role === 'admin').length;

    return {
      totalUsuarios: users.length,
      totalAdmins,
      totalClientes: users.length - totalAdmins,
    };
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
      const parsedUsers = JSON.parse(rawUsers) as Array<AuthUser | (Omit<AuthUser, 'role'> & { role?: 'admin' | 'customer' })>;
      const normalizedUsers = parsedUsers.map(user => ({
        ...user,
        role: user.role ?? 'customer'
      })) as AuthUser[];

      if (normalizedUsers.some((user, index) => parsedUsers[index].role == null)) {
        this.saveUsers(normalizedUsers);
      }

      return normalizedUsers;
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

  private getWelcomeDiscountRemaining(email: string): number {
    if (!this.isBrowser) {
      return 0;
    }

    const value = localStorage.getItem(`${this.discountKeyPrefix}.${email}`);
    const remaining = Number(value);
    if (Number.isNaN(remaining) || remaining < 0) {
      return 0;
    }

    return Math.floor(remaining);
  }

  private setWelcomeDiscountRemaining(email: string, remaining: number): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(`${this.discountKeyPrefix}.${email}`, String(Math.max(0, Math.floor(remaining))));
  }

  private ensureAdminUser(): void {
    if (!this.isBrowser) {
      return;
    }

    const users = this.getUsers();
    const hasAdmin = users.some(user => user.email === this.defaultAdminEmail);
    if (hasAdmin) {
      return;
    }

    users.push({
      email: this.defaultAdminEmail,
      password: this.defaultAdminPasswordHash,
      role: 'admin'
    });
    this.saveUsers(users);
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
