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

export type MetodoPago = 'tarjeta' | 'bizum' | 'efectivo';
export type PuntoRecogida = 'tienda' | 'domicilio';

export interface PedidoItem {
  productId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

export interface Pedido {
  id: string;
  fechaIso: string;
  metodoPago: MetodoPago;
  puntoRecogida: PuntoRecogida;
  subtotal: number;
  descuento: number;
  totalFinal: number;
  items: PedidoItem[];
}
