import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';

export interface CheckoutResult {
  cantidad: number;
  wantsRegister: boolean;
}

@Component({
  selector: 'app-quick-checkout-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './quick-checkout-modal.html',
  styleUrl: './quick-checkout-modal.scss',
})
export class QuickCheckoutModal {
  // Producto a comprar. Si es null, el modal no se muestra.
  @Input() product: Product | null = null;

  // true si el usuario NO está registrado (mostrar opción de registro).
  @Input() isGuest: boolean = false;

  // Emite cuando el usuario confirma la compra.
  @Output() confirmed = new EventEmitter<CheckoutResult>();

  // Emite cuando el usuario cierra el modal sin confirmar.
  @Output() closed = new EventEmitter<void>();

  // Cantidad seleccionada para comprar.
  cantidad = 1;

  incrementarCantidad(): void {
    if (this.product && this.cantidad < this.product.stock) {
      this.cantidad++;
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  confirmarCompra(wantsRegister: boolean = false): void {
    this.confirmed.emit({
      cantidad: this.cantidad,
      wantsRegister
    });
  }

  cerrar(): void {
    this.closed.emit();
  }

  cerrarPorFondo(event: MouseEvent): void {
    // Solo cierra si se hace clic en el overlay (fondo), no en el contenido.
    if ((event.target as HTMLElement).classList.contains('modal-overlay-checkout')) {
      this.cerrar();
    }
  }

  get subtotal(): number {
    if (!this.product) return 0;
    return this.product.precio * this.cantidad;
  }
}
