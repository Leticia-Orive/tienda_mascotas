import { Product } from '../models/product.model';

export const PRODUCTS: Product[] = [
  // Alimentos
  {
    id: 1,
    nombre: 'Pienso Premium para Perro Adulto',
    descripcion: 'Fórmula balanceada con pollo y arroz para perros adultos de todas las razas. Rico en proteínas y vitaminas.',
    precio: 49.99,
    imagen: 'https://placehold.co/340x220/e8f5e9/2e7d32?text=🐕+Pienso+Perro',
    categoria: 'alimento',
    stock: 30
  },
  {
    id: 2,
    nombre: 'Croquetas Gato Adulto Salmón',
    descripcion: 'Alimento completo para gatos adultos con salmón fresco y omega-3 para un pelaje brillante.',
    precio: 39.95,
    imagen: 'https://placehold.co/340x220/e3f2fd/1565c0?text=🐈+Croquetas+Gato',
    categoria: 'alimento',
    stock: 25
  },
  {
    id: 3,
    nombre: 'Snacks Naturales para Perro',
    descripcion: 'Golosinas 100% naturales hechas de pollo deshidratado. Sin conservantes ni colorantes artificiales.',
    precio: 12.50,
    imagen: 'https://placehold.co/340x220/fff8e1/f57f17?text=🦴+Snacks+Perro',
    categoria: 'alimento',
    stock: 50
  },
  {
    id: 4,
    nombre: 'Leche Especial para Cachorros',
    descripcion: 'Sustituto de leche materna enriquecido con vitaminas y minerales, ideal para cachorros recién nacidos.',
    precio: 18.75,
    imagen: 'https://placehold.co/340x220/fce4ec/880e4f?text=🍼+Leche+Cachorros',
    categoria: 'alimento',
    stock: 20
  },

  // Juguetes
  {
    id: 5,
    nombre: 'Pelota Kong de Caucho',
    descripcion: 'Resistente pelota de caucho natural para perros mordedores. Se puede rellenar con premios para mayor diversión.',
    precio: 16.99,
    imagen: 'https://placehold.co/340x220/ffebee/c62828?text=🔴+Pelota+Kong',
    categoria: 'juguetes',
    stock: 40
  },
  {
    id: 6,
    nombre: 'Caña con Plumas para Gato',
    descripcion: 'Juguete interactivo con plumas de colores para estimular el instinto cazador de tu gato.',
    precio: 8.99,
    imagen: 'https://placehold.co/340x220/f3e5f5/6a1b9a?text=🪶+Caña+Gato',
    categoria: 'juguetes',
    stock: 35
  },
  {
    id: 7,
    nombre: 'Rascador Torre para Gato',
    descripcion: 'Torre de rascado de 3 niveles con cuerda de sisal, plataformas y juguete colgante. Ideal para gatitos activos.',
    precio: 54.90,
    imagen: 'https://placehold.co/340x220/e8eaf6/283593?text=🗼+Rascador+Torre',
    categoria: 'juguetes',
    stock: 15
  },
  {
    id: 8,
    nombre: 'Set 5 Juguetes para Conejo',
    descripcion: 'Variado set de juguetes masticables de madera natural para conejos y roedores. Cuida la salud dental.',
    precio: 14.50,
    imagen: 'https://placehold.co/340x220/f1f8e9/33691e?text=🐰+Juguetes+Conejo',
    categoria: 'juguetes',
    stock: 28
  },

  // Accesorios
  {
    id: 9,
    nombre: 'Collar con GPS Integrado',
    descripcion: 'Collar inteligente con localización GPS en tiempo real, historial de rutas y resistente al agua.',
    precio: 89.95,
    imagen: 'https://placehold.co/340x220/e0f7fa/006064?text=📡+Collar+GPS',
    categoria: 'accesorios',
    stock: 10
  },
  {
    id: 10,
    nombre: 'Cama Ortopédica para Perro',
    descripcion: 'Cama con espuma de memoria de alta densidad para el máximo confort. Funda lavable. Varios tamaños disponibles.',
    precio: 69.99,
    imagen: 'https://placehold.co/340x220/eceff1/37474f?text=🛏️+Cama+Ortopédica',
    categoria: 'accesorios',
    stock: 12
  },
  {
    id: 11,
    nombre: 'Transportín de Lujo',
    descripcion: 'Transportín rígido con ventilación extra, puerta de seguridad y base acolchada. Homologado para vuelos.',
    precio: 79.00,
    imagen: 'https://placehold.co/340x220/fff3e0/e65100?text=🧳+Transportín',
    categoria: 'accesorios',
    stock: 8
  },

  // Cuidado
  {
    id: 12,
    nombre: 'Champú Natural Perro & Gato',
    descripcion: 'Champú hipoalergénico con aloe vera y avena. Fórmula suave para pieles sensibles. Sin sulfatos ni parabenos.',
    precio: 15.99,
    imagen: 'https://placehold.co/340x220/e8f5e9/1b5e20?text=🛁+Champú+Natural',
    categoria: 'cuidado',
    stock: 45
  },
  {
    id: 13,
    nombre: 'Antiparasitario Pipeta 3 meses',
    descripcion: 'Protección completa contra pulgas, garrapatas y mosquitos durante 3 meses. Aplicación tópica sencilla.',
    precio: 24.99,
    imagen: 'https://placehold.co/340x220/e8eaf6/1a237e?text=💧+Antiparasitario',
    categoria: 'cuidado',
    stock: 60
  },
  {
    id: 14,
    nombre: 'Kit Dental para Mascotas',
    descripcion: 'Set completo con cepillo y pasta dental de sabor pollo para la higiene bucal de tu mascota.',
    precio: 11.50,
    imagen: 'https://placehold.co/340x220/fce4ec/4a148c?text=🦷+Kit+Dental',
    categoria: 'cuidado',
    stock: 30
  },
  {
    id: 15,
    nombre: 'Cortaúñas Profesional',
    descripcion: 'Cortaúñas ergonómico con sensor de seguridad y limas incluidas. Acero inoxidable de grado veterinario.',
    precio: 19.95,
    imagen: 'https://placehold.co/340x220/f9fbe7/827717?text=✂️+Cortaúñas',
    categoria: 'cuidado',
    stock: 22
  }
];
