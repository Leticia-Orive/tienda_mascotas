import { UpcomingProduct } from '../models/product.model';

export const UPCOMING_PRODUCTS: UpcomingProduct[] = [
  {
    id: 101,
    nombre: 'Arenero Inteligente AutoClean X2',
    categoria: 'accesorios',
    descripcion: 'Sistema autolimpiante con filtro antiolor y control desde app para mantener siempre limpio el espacio de tu gato.',
    lanzamiento: 'Abril 2026',
    precioEstimado: 219.90,
    imagen: 'https://placehold.co/340x220/e3f2fd/0d47a1?text=Arenero+AutoClean',
  },
  {
    id: 102,
    nombre: 'Snack Dental Funcional ProBite',
    categoria: 'alimento',
    descripcion: 'Premio diario con probioticos y textura especial para reducir placa y cuidar la salud bucal en perros adultos.',
    lanzamiento: 'Mayo 2026',
    precioEstimado: 14.95,
    imagen: 'https://placehold.co/340x220/fff8e1/f9a825?text=Snack+Dental',
  },
  {
    id: 103,
    nombre: 'Fuente de Agua SmartFlow Mini',
    categoria: 'cuidado',
    descripcion: 'Fuente silenciosa con sensor de movimiento y triple filtrado para incentivar la hidratacion de gatos y perros pequenos.',
    lanzamiento: 'Junio 2026',
    precioEstimado: 64.50,
    imagen: 'https://placehold.co/340x220/e0f7fa/00695c?text=SmartFlow+Mini',
  },
];
