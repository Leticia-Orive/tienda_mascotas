import { Component, signal, computed } from '@angular/core';
import { PRODUCTS } from '../../data/products.data';
import { Categoria } from '../../models/product.model';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-list',
  imports: [ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList {
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
    let items = PRODUCTS;
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
}
