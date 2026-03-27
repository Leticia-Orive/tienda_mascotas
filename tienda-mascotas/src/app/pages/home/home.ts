import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductList } from '../../components/product-list/product-list';
import { UpcomingProductsService } from '../../services/upcoming-products';

/**
 * Componente de pagina principal (Home)
 *
 * QUE ES:
 * Componente raiz de la pagina de inicio de PetShop que muestra:
 * 1. Un hero/banner de bienvenida
 * 2. Seccion "Nuestros Productos" con el catalogo completo
 * 3. Seccion "Proximos productos en tienda" con lanzamientos futuros
 * 4. Seccion de contacto para que cualquier visitante pueda escribir a la tienda
 */
@Component({
  selector: 'app-home',
  imports: [ProductList, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private upcomingProductsService = inject(UpcomingProductsService);

  proximosProductos = this.upcomingProductsService.proximosProductos;

  contacto = {
    email: 'contacto@petshop.com',
    telefono: '+34 912 345 678',
    direccion: 'Calle Huellas 24, Madrid',
    horario: 'Lunes a Sabado de 10:00 a 20:00',
  };

  formularioContacto = {
    nombre: '',
    email: '',
    mensaje: '',
  };

  contactoErrorMessage = '';
  contactoSuccessMessage = '';

  enviarMensajeContacto(): void {
    const nombre = this.formularioContacto.nombre.trim();
    const email = this.formularioContacto.email.trim();
    const mensaje = this.formularioContacto.mensaje.trim();

    this.contactoErrorMessage = '';
    this.contactoSuccessMessage = '';

    if (!nombre || !email || !mensaje) {
      this.contactoErrorMessage = 'Completa nombre, correo y mensaje para contactar con la tienda.';
      return;
    }

    const asunto = `Consulta PetShop - ${nombre}`;
    const cuerpo = [
      `Nombre: ${nombre}`,
      `Correo: ${email}`,
      '',
      'Mensaje:',
      mensaje,
    ].join('\n');

    if (typeof window !== 'undefined') {
      window.location.href = `mailto:${this.contacto.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    }

    this.contactoSuccessMessage = 'Hemos preparado tu mensaje para enviarlo a la tienda.';
    this.formularioContacto = {
      nombre: '',
      email: '',
      mensaje: '',
    };
  }
}
