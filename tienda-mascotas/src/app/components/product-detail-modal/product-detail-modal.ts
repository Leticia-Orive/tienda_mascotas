import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './product-detail-modal.html',
  styleUrl: './product-detail-modal.scss',
})
export class ProductDetailModal {
  // Producto a mostrar en el modal. Viene del componente padre.
  @Input() product: Product | null = null;
  // Evento que emite cuando se cierra el modal (al hacer clic en X o en el fondo).
  @Output() closed = new EventEmitter<void>();

  // Cierra el modal.
  cerrar(): void {
    this.closed.emit();
  }

  // Cierra el modal solo si se hace clic en el fondo (no en el contenido).
  cerrarPorFondo(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar();
    }
  }
}
