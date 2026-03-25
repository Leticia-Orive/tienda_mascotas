import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { MetodoPago } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, RouterLink, FormsModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartComponent {
  cartService = inject(CartService);
  // authService se usa para saber si el cliente tiene descuento de bienvenida activo
  // y para consumir un uso del descuento al confirmar la compra.
  authService = inject(AuthService);

  metodoPagoSeleccionado: MetodoPago | null = null;
  mostrarErrorMetodoPago = false;

  numeroTarjeta = '';
  mostrarErrorTarjeta = false;

  telefonoBizum = '';
  prefijoBizum = '+34';
  mostrarErrorBizum = false;

  readonly prefijos = [
    { codigo: '+34',  pais: 'España (+34)' },
    { codigo: '+351', pais: 'Portugal (+351)' },
    { codigo: '+33',  pais: 'Francia (+33)' },
    { codigo: '+49',  pais: 'Alemania (+49)' },
    { codigo: '+39',  pais: 'Italia (+39)' },
    { codigo: '+44',  pais: 'Reino Unido (+44)' },
    { codigo: '+32',  pais: 'Bélgica (+32)' },
    { codigo: '+31',  pais: 'Países Bajos (+31)' },
    { codigo: '+41',  pais: 'Suiza (+41)' },
    { codigo: '+43',  pais: 'Austria (+43)' },
    { codigo: '+352', pais: 'Luxemburgo (+352)' },
    { codigo: '+212', pais: 'Marruecos (+212)' },
    { codigo: '+1',   pais: 'EEUU / Canadá (+1)' },
    { codigo: '+52',  pais: 'México (+52)' },
    { codigo: '+54',  pais: 'Argentina (+54)' },
    { codigo: '+57',  pais: 'Colombia (+57)' },
    { codigo: '+56',  pais: 'Chile (+56)' },
  ];

  get telefonoBizumLimpio(): string {
    return this.telefonoBizum.replace(/\s/g, '');
  }

  onTelefonoBizumInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 15);
    this.telefonoBizum = value;
    input.value = value;
    this.mostrarErrorBizum = false;
  }

  get numeroTarjetaLimpio(): string {
    return this.numeroTarjeta.replace(/\s/g, '');
  }

  onNumeroTarjetaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 16);
    value = value.replace(/(.{4})/g, '$1 ').trim();
    this.numeroTarjeta = value;
    input.value = value;
    this.mostrarErrorTarjeta = false;
  }

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

  seleccionarMetodoPago(metodo: MetodoPago): void {
    this.metodoPagoSeleccionado = metodo;
    this.mostrarErrorMetodoPago = false;
    if (metodo !== 'tarjeta') {
      this.numeroTarjeta = '';
      this.mostrarErrorTarjeta = false;
    }
    if (metodo !== 'bizum') {
      this.telefonoBizum = '';
      this.prefijoBizum = '+34';
      this.mostrarErrorBizum = false;
    }
  }

  confirmarPedido(): void {
    if (!this.metodoPagoSeleccionado) {
      this.mostrarErrorMetodoPago = true;
      return;
    }

    const metodoPago = this.metodoPagoSeleccionado;

    if (metodoPago === 'tarjeta' && this.numeroTarjetaLimpio.length !== 16) {
      this.mostrarErrorTarjeta = true;
      return;
    }

    if (metodoPago === 'bizum' && !/^\d{4,15}$/.test(this.telefonoBizumLimpio)) {
      this.mostrarErrorBizum = true;
      return;
    }

    const descuentoActual = this.discountAmount;

    this.cartService.registrarPedido(metodoPago, descuentoActual);

    // Si hay descuento activo, lo consume (resta 1 uso) antes de vaciar el carrito.
    // Informa al cliente cuantos usos le quedan o si ya los agoto todos.
    if (descuentoActual > 0) {
      this.authService.consumirDescuentoBienvenida();
      const restantes = this.authService.welcomeDiscountRemaining();
      const detalle = restantes > 0
        ? `Te quedan ${restantes} compra(s) con 10% de descuento.`
        : 'Ya usaste todo tu descuento de bienvenida.';
      alert(`✅ ¡Pedido confirmado! Metodo de pago: ${metodoPago}. Se aplicó tu 10% de bienvenida. ${detalle} Gracias por tu compra en PetShop 🐾`);
    } else {
      alert(`✅ ¡Pedido confirmado! Metodo de pago: ${metodoPago}. Gracias por tu compra en PetShop 🐾`);
    }

    this.cartService.vaciarCarrito();
    this.metodoPagoSeleccionado = null;
    this.mostrarErrorMetodoPago = false;
    this.numeroTarjeta = '';
    this.mostrarErrorTarjeta = false;
    this.telefonoBizum = '';
    this.prefijoBizum = '+34';
    this.mostrarErrorBizum = false;
  }
}
