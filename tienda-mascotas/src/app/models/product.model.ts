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

/**
 * Interfaz para productos próximos a lanzar
 *
 * QUÉ ES:
 * Define la estructura de datos para productos que aún no están disponibles en tienda
 * pero que se mostrarán en la sección "Próximos productos" de la home.
 *
 * PARA QUÉ SIRVE:
 * - Tipificar los datos de productos futuros
 * - Diferenciar entre productos actuales (Product) y próximos (UpcomingProduct)
 * - Validar datos en formularios de admin
 *
 * CAMPOS:
 * - id: Identificador único (típicamente 100+)
 * - nombre: Nombre del producto
 * - categoria: Tipo de producto (alimento, juguetes, accesorios, cuidado)
 * - descripcion: Detalles del producto
 * - lanzamiento: Mes/fecha estimada de lanzamiento (ej: "Julio 2026")
 * - precioEstimado: Precio aproximado antes del lanzamiento
 * - imagen: URL de la imagen del producto
 */
export interface UpcomingProduct {
  id: number;
  nombre: string;
  categoria: Categoria;
  descripcion: string;
  lanzamiento: string;
  precioEstimado: number;
  imagen: string;
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
  direccionDomicilio?: string;
  subtotal: number;
  descuento: number;
  totalFinal: number;
  items: PedidoItem[];
}
