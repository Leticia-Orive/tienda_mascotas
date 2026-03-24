import { Component, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PRODUCTS } from '../../data/products.data';
import { Categoria, Product } from '../../models/product.model';
import { ProductCard } from '../product-card/product-card';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-product-list',
  imports: [ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
  // Clave usada en localStorage para guardar el catalogo modificado por el admin.
  // Esto permite que los cambios (anadir, editar, borrar) persistan al recargar la pagina.
  private readonly productStorageKey = 'petshop.products';
  private readonly platformId = inject(PLATFORM_ID);
  // isBrowser evita errores en server-side rendering (Angular Universal),
  // ya que localStorage solo existe en el navegador.
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  // Al arrancar, carga primero del localStorage; si no hay datos, usa el catalogo inicial.
  private readonly productos = signal<Product[]>(this.loadProducts());
  // authService se usa para mostrar boton "Anadir producto" solo si el usuario es admin.
  authService = inject(AuthService);

  // Opciones para filtrar por tipo de producto.
  categorias: { key: string; label: string }[] = [
    { key: 'todas', label: 'Todas' },
    { key: 'alimento', label: 'Alimento' },
    { key: 'juguetes', label: 'Juguetes' },
    { key: 'accesorios', label: 'Accesorios' },
    { key: 'cuidado', label: 'Cuidado' },
  ];

  // Estado reactivo de filtros de UI.
  categoriaActiva = signal<string>('todas');
  searchTerm = signal<string>('');

  // Lista derivada que se recalcula automaticamente al cambiar filtros.
  productosFiltrados = computed(() => {
    let items = this.productos();
    const cat = this.categoriaActiva();
    const term = this.searchTerm().toLowerCase().trim();
    if (cat !== 'todas') {
      items = items.filter(p => p.categoria === (cat as Categoria));
    }
    if (term) {
      items = items.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term)
      );
    }
    return items;
  });

  setCategoria(key: string): void {
    // Actualiza la categoria activa al pulsar una pestana.
    this.categoriaActiva.set(key);
  }

  onSearch(event: Event): void {
    // Guarda el texto del buscador para filtrar por nombre o descripcion.
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  // Muestra en un alert el detalle completo del producto: nombre, descripcion, precio y stock.
  // Disponible tanto para admin como para clientes (boton "Ver producto" en la tarjeta).
  verProducto(product: Product): void {
    window.alert(
      `${product.nombre}\n\n${product.descripcion}\n\nPrecio: €${product.precio.toFixed(2)}\nStock: ${product.stock}`
    );
  }

  // Permite al admin modificar nombre, precio y stock de un producto existente.
  // Valida que los datos ingresados sean correctos antes de aplicar el cambio.
  // Guarda el catalogo actualizado en localStorage para que persista.
  editarProducto(product: Product): void {
    const nombre = window.prompt('Nuevo nombre del producto:', product.nombre);
    if (nombre === null) {
      return;
    }

    const precioInput = window.prompt('Nuevo precio:', String(product.precio));
    if (precioInput === null) {
      return;
    }

    const stockInput = window.prompt('Nuevo stock:', String(product.stock));
    if (stockInput === null) {
      return;
    }

    const precio = Number(precioInput);
    const stock = Number(stockInput);

    if (!nombre.trim() || Number.isNaN(precio) || precio < 0 || Number.isNaN(stock) || stock < 0) {
      window.alert('Datos invalidos. Verifica nombre, precio y stock.');
      return;
    }

    this.productos.update(items =>
      items.map(item =>
        item.id === product.id
          ? { ...item, nombre: nombre.trim(), precio, stock: Math.floor(stock) }
          : item
      )
    );
    this.saveProducts(this.productos());
  }

  // Elimina un producto del catalogo tras pedir confirmacion al admin.
  // Solo visible para administradores. El cambio se persiste en localStorage.
  borrarProducto(productId: number): void {
    const confirmar = window.confirm('¿Deseas borrar este producto del catalogo?');
    if (!confirmar) {
      return;
    }

    this.productos.update(items => items.filter(item => item.id !== productId));
    this.saveProducts(this.productos());
  }

  // Permite al admin crear un nuevo producto rellenando nombre, descripcion,
  // precio, stock, categoria e imagen (opcional) mediante prompts del navegador.
  // Si no se indica imagen, genera automaticamente un placeholder con el nombre del producto.
  // El nuevo producto se guarda en localStorage para que persista al recargar.
  anadirProducto(): void {
    const nombre = window.prompt('Nombre del producto:');
    if (nombre === null) {
      return;
    }

    const descripcion = window.prompt('Descripcion del producto:');
    if (descripcion === null) {
      return;
    }

    const precioInput = window.prompt('Precio del producto (ej: 19.99):');
    if (precioInput === null) {
      return;
    }

    const stockInput = window.prompt('Stock inicial:');
    if (stockInput === null) {
      return;
    }

    const categoriaInput = window.prompt('Categoria (alimento, juguetes, accesorios, cuidado):', 'accesorios');
    if (categoriaInput === null) {
      return;
    }

    const imagenInput = window.prompt('URL de imagen (opcional):', '');
    if (imagenInput === null) {
      return;
    }

    const precio = Number(precioInput);
    const stock = Number(stockInput);
    const categoria = categoriaInput.trim().toLowerCase() as Categoria;
    const categoriasValidas: Categoria[] = ['alimento', 'juguetes', 'accesorios', 'cuidado'];

    if (!nombre.trim() || !descripcion.trim() || Number.isNaN(precio) || precio < 0 || Number.isNaN(stock) || stock < 0) {
      window.alert('Datos invalidos. Verifica nombre, descripcion, precio y stock.');
      return;
    }

    if (!categoriasValidas.includes(categoria)) {
      window.alert('Categoria invalida. Usa: alimento, juguetes, accesorios o cuidado.');
      return;
    }

    const nextId = this.productos().length > 0
      ? Math.max(...this.productos().map(item => item.id)) + 1
      : 1;

    const productoNuevo: Product = {
      id: nextId,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio,
      stock: Math.floor(stock),
      categoria,
      imagen: imagenInput.trim() || `https://placehold.co/340x220/e2e8f0/334155?text=${encodeURIComponent(nombre.trim())}`
    };

    this.productos.update(items => [...items, productoNuevo]);
    this.saveProducts(this.productos());
    window.alert('Producto anadido correctamente.');
  }

  // Lee el catalogo desde localStorage al iniciar el componente.
  // Si no hay datos guardados o el JSON es invalido, usa el catalogo por defecto (products.data.ts).
  private loadProducts(): Product[] {
    if (!this.isBrowser) {
      return [...PRODUCTS];
    }

    const raw = localStorage.getItem(this.productStorageKey);
    if (!raw) {
      return [...PRODUCTS];
    }

    try {
      const parsed = JSON.parse(raw) as Product[];
      if (!Array.isArray(parsed) || parsed.length < 1) {
        return [...PRODUCTS];
      }

      return parsed;
    } catch {
      return [...PRODUCTS];
    }
  }

  // Serializa el catalogo actual a JSON y lo guarda en localStorage.
  // Se llama despues de cada operacion de anadir, editar o borrar un producto.
  private saveProducts(items: Product[]): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.productStorageKey, JSON.stringify(items));
  }
}
