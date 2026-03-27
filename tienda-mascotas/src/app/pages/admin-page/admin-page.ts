import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { ProductList } from '../../components/product-list/product-list';
import { Categoria, UpcomingProduct } from '../../models/product.model';
import { UpcomingProductsService } from '../../services/upcoming-products';

@Component({
  selector: 'app-admin-page',
  imports: [ProductList, FormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
})
export class AdminPage {
  authService = inject(AuthService);
  upcomingProductsService = inject(UpcomingProductsService);

  resumen = this.authService.obtenerResumenAdmin();
  proximosProductos = this.upcomingProductsService.proximosProductos;
  categorias = this.upcomingProductsService.categoriasValidas();

  formularioVisible = false;
  modoFormulario: 'crear' | 'editar' = 'crear';
  upcomingEditId: number | null = null;
  upcomingErrorMessage = '';
  upcomingSuccessMessage = '';

  upcomingForm: {
    nombre: string;
    descripcion: string;
    lanzamiento: string;
    precioEstimado: string;
    categoria: Categoria;
    imagen: string;
  } = this.getEmptyUpcomingForm();

  iniciarAltaProximoProducto(): void {
    this.modoFormulario = 'crear';
    this.upcomingEditId = null;
    this.upcomingErrorMessage = '';
    this.upcomingSuccessMessage = '';
    this.upcomingForm = this.getEmptyUpcomingForm();
    this.formularioVisible = true;
  }

  iniciarEdicionProximoProducto(producto: UpcomingProduct): void {
    this.modoFormulario = 'editar';
    this.upcomingEditId = producto.id;
    this.upcomingErrorMessage = '';
    this.upcomingSuccessMessage = '';
    this.upcomingForm = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      lanzamiento: producto.lanzamiento,
      precioEstimado: String(producto.precioEstimado),
      categoria: producto.categoria,
      imagen: producto.imagen,
    };
    this.formularioVisible = true;
  }

  cancelarFormularioProximoProducto(): void {
    this.formularioVisible = false;
    this.modoFormulario = 'crear';
    this.upcomingEditId = null;
    this.upcomingErrorMessage = '';
    this.upcomingSuccessMessage = '';
    this.upcomingForm = this.getEmptyUpcomingForm();
  }

  guardarProximoProducto(): void {
    this.upcomingErrorMessage = '';
    this.upcomingSuccessMessage = '';

    const payload = this.buildUpcomingFromForm();
    if (!payload) {
      return;
    }

    if (this.modoFormulario === 'editar' && this.upcomingEditId !== null) {
      this.upcomingProductsService.editarProducto(this.upcomingEditId, payload);
      this.upcomingSuccessMessage = 'Proximo producto actualizado.';
    } else {
      this.upcomingProductsService.anadirProducto(payload);
      this.upcomingSuccessMessage = 'Proximo producto anadido.';
    }

    this.upcomingForm = this.getEmptyUpcomingForm();
    this.modoFormulario = 'crear';
    this.upcomingEditId = null;
  }

  borrarProximoProducto(id: number): void {
    const confirmar = window.confirm('¿Deseas borrar este proximo producto?');
    if (!confirmar) {
      return;
    }

    this.upcomingProductsService.borrarProducto(id);
  }

  formatPrecioEstimado(precio: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(precio);
  }

  private buildUpcomingFromForm(): Omit<UpcomingProduct, 'id'> | null {
    const nombre = this.upcomingForm.nombre.trim();
    const descripcion = this.upcomingForm.descripcion.trim();
    const lanzamiento = this.upcomingForm.lanzamiento.trim();
    const precioEstimado = Number(this.upcomingForm.precioEstimado);
    const categoria = this.upcomingForm.categoria;
    const imagenInput = this.upcomingForm.imagen;
    const categoriasValidas = this.upcomingProductsService.categoriasValidas();

    if (!nombre || !descripcion || !lanzamiento || Number.isNaN(precioEstimado) || precioEstimado < 0) {
      this.upcomingErrorMessage = 'Datos invalidos. Revisa nombre, descripcion, lanzamiento y precio estimado.';
      return null;
    }

    if (!categoriasValidas.includes(categoria)) {
      this.upcomingErrorMessage = 'Categoria invalida. Usa: alimento, juguetes, accesorios o cuidado.';
      return null;
    }

    const imagen = imagenInput.trim() || `https://placehold.co/340x220/f5f5f5/424242?text=${encodeURIComponent(nombre)}`;

    return {
      nombre,
      descripcion,
      lanzamiento,
      precioEstimado,
      categoria,
      imagen,
    };
  }

  private getEmptyUpcomingForm(): {
    nombre: string;
    descripcion: string;
    lanzamiento: string;
    precioEstimado: string;
    categoria: Categoria;
    imagen: string;
  } {
    return {
      nombre: '',
      descripcion: '',
      lanzamiento: '',
      precioEstimado: '',
      categoria: 'accesorios',
      imagen: '',
    };
  }
}
