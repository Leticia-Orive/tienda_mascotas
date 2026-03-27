import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { ProductList } from '../../components/product-list/product-list';
import { Categoria, UpcomingProduct } from '../../models/product.model';
import { UpcomingProductsService } from '../../services/upcoming-products';

/**
 * Componente de panel administrador
 *
 * QUÉ ES:
 * Panel de control exclusivo para administradores de PetShop.
 * Permite:
 * 1. Ver resumen de usuarios y admins registrados
 * 2. Gestionar catálogo principal (ver, editar, borrar productos)
 * 3. Gestionar próximos productos (crear, editar, borrar lanzamientos futuros)
 *
 * PARA QUÉ SIRVE:
 * - Centralizar todas las funciones administrativas
 * - Proporcionar interfaz para CRUD de próximos productos
 * - Mostrar métricas de la tienda
 * - Reemplazar prompts por formulario integrado más usable
 *
 * FUNCIONALIDAD:
 * - Inyecta AuthService para verificar rol admin
 * - Inyecta UpcomingProductsService para gestionar próximos productos
 * - Mantiene estado de formulario (crear/editar)
 * - Valida datos antes de guardar
 * - Formatea precios en EUR
 * - Muestra mensajes de error/éxito
 *
 * MÉTODOS PRINCIPALES:
 * - iniciarAltaProximoProducto(): Abre formulario en modo crear
 * - iniciarEdicionProximoProducto(producto): Carga datos para editar
 * - guardarProximoProducto(): Valida y persiste cambios
 * - cancelarFormularioProximoProducto(): Cierra formulario sin guardar
 * - borrarProximoProducto(id): Elimina con confirmación
 * - formatPrecioEstimado(precio): Formatea a EUR
 */
@Component({
  selector: 'app-admin-page',
  imports: [ProductList, FormsModule],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
})
export class AdminPage {
  // Inyecta servicios necesarios
  authService = inject(AuthService);
  upcomingProductsService = inject(UpcomingProductsService);

  // Datos y señales
  resumen = this.authService.obtenerResumenAdmin();
  proximosProductos = this.upcomingProductsService.proximosProductos;
  categorias = this.upcomingProductsService.categoriasValidas();

  // Estado del formulario de próximos productos
  formularioVisible = false;
  modoFormulario: 'crear' | 'editar' = 'crear';
  upcomingEditId: number | null = null; // ID del producto que se está editando
  upcomingErrorMessage = ''; // Mensaje de error del formulario
  upcomingSuccessMessage = ''; // Mensaje de éxito del formulario

  // Objecto que vincula dos vías (ngModel) con los inputs del formulario
  upcomingForm: {
    nombre: string;
    descripcion: string;
    lanzamiento: string;
    precioEstimado: string; // String para facilitar ngModel en input type="number"
    categoria: Categoria;
    imagen: string;
  } = this.getEmptyUpcomingForm();

  /**
   * Prepara el formulario para crear un nuevo próximo producto.
   * Limpia campos y abre el formulario en modo "crear".
   */
  iniciarAltaProximoProducto(): void {
    this.modoFormulario = 'crear';
    this.upcomingEditId = null;
    this.upcomingErrorMessage = '';
    this.upcomingSuccessMessage = '';
    this.upcomingForm = this.getEmptyUpcomingForm();
    this.formularioVisible = true;
  }

  /**
   * Prepara el formulario para editar un próximo producto existente.
   * Carga los datos actuales en los campos para permitir edición.
   * @param producto Próximo producto a editar
   */
  iniciarEdicionProximoProducto(producto: UpcomingProduct): void {
    this.modoFormulario = 'editar';
    this.upcomingEditId = producto.id;
    this.upcomingErrorMessage = '';
    this.upcomingSuccessMessage = '';
    this.upcomingForm = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      lanzamiento: producto.lanzamiento,
      precioEstimado: String(producto.precioEstimado), // Convierte a string para input
      categoria: producto.categoria,
      imagen: producto.imagen,
    };
    this.formularioVisible = true;
  }

  /**
   * Cierra el formulario sin guardar cambios.
   * Limpia todos los campos y mensajes.
   */
  cancelarFormularioProximoProducto(): void {
    this.formularioVisible = false;
    this.modoFormulario = 'crear';
    this.upcomingEditId = null;
    this.upcomingErrorMessage = '';
    this.upcomingSuccessMessage = '';
    this.upcomingForm = this.getEmptyUpcomingForm();
  }

  /**
   * Valida y guarda el próximo producto (crear o editar).
   *
   * FLUJO:
   * 1. Limpia mensajes previos
   * 2. Valida datos del formulario
   * 3. Si modo es editar: llama editarProducto() con ID
   * 4. Si modo es crear: llama anadirProducto()
   * 5. Muestra mensaje de éxito
   * 6. Limpia formulario para siguiente operación
   */
  guardarProximoProducto(): void {
    this.upcomingErrorMessage = '';
    this.upcomingSuccessMessage = '';

    const payload = this.buildUpcomingFromForm();
    if (!payload) {
      return; // buildUpcomingFromForm setea upcomingErrorMessage
    }

    if (this.modoFormulario === 'editar' && this.upcomingEditId !== null) {
      this.upcomingProductsService.editarProducto(this.upcomingEditId, payload);
      this.upcomingSuccessMessage = 'Proximo producto actualizado.';
    } else {
      this.upcomingProductsService.anadirProducto(payload);
      this.upcomingSuccessMessage = 'Proximo producto anadido.';
    }

    // Reset para siguiente operación
    this.upcomingForm = this.getEmptyUpcomingForm();
    this.modoFormulario = 'crear';
    this.upcomingEditId = null;
  }

  /**
   * Elimina un próximo producto previa confirmación del usuario.
   * @param id ID del próximo producto a borrar
   */
  borrarProximoProducto(id: number): void {
    const confirmar = window.confirm('¿Deseas borrar este proximo producto?');
    if (!confirmar) {
      return;
    }

    this.upcomingProductsService.borrarProducto(id);
  }

  /**
   * Formatea un precio a string en formato EUR con locale español.
   * Usado en el listado para mostrar precios estimados consistentemente.
   * @param precio Número a formatear
   * @returns String formateado (ej: "49,90 €")
   */
  formatPrecioEstimado(precio: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(precio);
  }

  /**
   * Valida datos del formulario y construye objeto UpcomingProduct sin ID.
   *
   * VALIDACIONES:
   * - Campos no vacíos
   * - Precio es número válido >= 0
   * - Categoría es válida
   *
   * Si hay error, setea upcomingErrorMessage y retorna null.
   * Si todo es válido, genera imagen automática si no se proporcionó URL.
   *
   * @returns Objeto UpcomingProduct (sin id) o null si validación falla
   */
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

  /**
   * Genera un objeto de formulario vacío/limpio.
   * Se usa al abrir el formulario para crear (no editar) o cancelar cambios.
   * @returns Objeto con todos los campos vacíos (categoría por defecto: accesorios)
   */
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
      categoria: 'accesorios', // Categoría por defecto
      imagen: '',
    };
  }
}
