export type Categoria = 'alimento' | 'juguetes' | 'accesorios' | 'cuidado';

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: Categoria;
  stock: number;
}

export interface CartItem {
  product: Product;
  cantidad: number;
}
