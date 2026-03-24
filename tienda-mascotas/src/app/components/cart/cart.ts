import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartComponent {
  cartService = inject(CartService);
  // authService se usa para saber si el cliente tiene descuento de bienvenida activo
  // y para consumir un uso del descuento al confirmar la compra.
  authService = inject(AuthService);

  // Calcula el importe que se descuenta al cliente nuevo (10% del total bruto).
  // Si el cliente no tiene descuento activo, devuelve 0.
  get discountAmount(): number {
    return this.cartService.totalPrice() * this.authService.welcomeDiscountRate();
  }

  // Total final que paga el cliente despues de aplicar el descuento de bienvenida.
  get totalConDescuento(): number {
    return this.cartService.totalPrice() - this.discountAmount;
  }

  // Texto que indica en que compra con descuento esta el cliente, ej: "Compra 2 de 3".
  // Se usa junto a la barra de progreso para que el cliente sepa cuantos usos le quedan.
  get progresoDescuento(): string {
    const total = this.authService.welcomeDiscountTotal;
    const usadas = total - this.authService.welcomeDiscountRemaining();
    const compraActual = Math.min(total, usadas + 1);
    return `Compra ${compraActual} de ${total}`;
  }

  // Porcentaje de progreso del beneficio (0-100) para pintar el ancho de la barra visual.
  // Cuando se completan las 3 compras, devuelve 100 y la barra se pone dorada.
  get progresoDescuentoPorcentaje(): number {
    const total = this.authService.welcomeDiscountTotal;
    if (total < 1) {
      return 0;
    }

    const usadas = total - this.authService.welcomeDiscountRemaining();
    return Math.max(0, Math.min(100, (usadas / total) * 100));
  }

  // Indica si el cliente ya agoto todas sus compras con descuento.
  // Cuando es true, la barra cambia a color dorado y aparece el mensaje de beneficio completado.
  get descuentoCompletado(): boolean {
    return this.authService.currentUserRole() === 'customer' && this.authService.welcomeDiscountRemaining() === 0;
  }

  confirmarPedido(): void {
    // Si hay descuento activo, lo consume (resta 1 uso) antes de vaciar el carrito.
    // Informa al cliente cuantos usos le quedan o si ya los agoto todos.
    if (this.discountAmount > 0) {
      this.authService.consumirDescuentoBienvenida();
      const restantes = this.authService.welcomeDiscountRemaining();
      const detalle = restantes > 0
        ? `Te quedan ${restantes} compra(s) con 10% de descuento.`
        : 'Ya usaste todo tu descuento de bienvenida.';
      alert(`✅ ¡Pedido confirmado! Se aplicó tu 10% de bienvenida. ${detalle} Gracias por tu compra en PetShop 🐾`);
    } else {
      alert('✅ ¡Pedido confirmado! Gracias por tu compra en PetShop 🐾');
    }

    this.cartService.vaciarCarrito();
  }
}
