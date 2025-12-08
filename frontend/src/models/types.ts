export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: 'admin' | 'cliente';
}

export interface Proyecto {
  id: number;
  cliente_id: number;
  nombre: string;
  descripcion?: string;
  estado: 'Sin empezar' | 'En Proceso' | 'Terminado';
  created_at?: string;
  updated_at?: string;
  cliente_nombre?: string;
  cliente_email?: string;
}

export interface Stock {
  id: number;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad: string;
  created_at?: string;
  updated_at?: string;
}

export interface Factura {
  id: number;
  cliente_id: number;
  proyecto_id?: number;
  monto: number;
  descripcion?: string;
  estado: 'Pendiente' | 'Pagada' | 'Cancelada';
  fecha_emision?: string;
  fecha_pago?: string;
  cliente_nombre?: string;
  proyecto_nombre?: string;
  numero_factura?: string;
}

export interface MaterialProyecto {
  id: number;
  proyecto_id: number;
  stock_id: number;
  cantidad: number;
  stock_nombre?: string;
  stock_unidad?: string;
  stock_descripcion?: string;
}

export interface ProyectoDetalle {
  proyecto: Proyecto;
  materiales: MaterialProyecto[];
  facturas: Factura[];
}

