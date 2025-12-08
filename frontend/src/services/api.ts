import axios from 'axios';
import type { Usuario, Proyecto, Stock, Factura } from '../models/types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; usuario: Usuario }>('/auth/login', { email, password }),
  registro: (email: string, password: string, nombre: string) =>
    api.post<{ token: string; usuario: Usuario }>('/auth/registro', { email, password, nombre }),
  perfil: () => api.get<Usuario>('/auth/perfil'),
};

// Admin
export const adminApi = {
  listarClientes: () => api.get<Usuario[]>('/admin/clientes'),
  listarProyectos: () => api.get<Proyecto[]>('/admin/proyectos'),
  actualizarEstadoProyecto: (id: number, estado: Proyecto['estado']) =>
    api.patch(`/admin/proyectos/${id}/estado`, { estado }),
  listarStock: () => api.get<Stock[]>('/admin/stock'),
  crearStock: (data: { nombre: string; descripcion?: string; cantidad: number; unidad?: string }) =>
    api.post('/admin/stock', data),
  actualizarStock: (id: number, data: { nombre?: string; descripcion?: string; cantidad?: number; unidad?: string }) =>
    api.patch(`/admin/stock/${id}`, data),
  eliminarStock: (id: number) => api.delete(`/admin/stock/${id}`),
  listarMaterialesProyecto: (proyectoId: number) => api.get(`/admin/proyectos/${proyectoId}/materiales`),
  agregarMaterialProyecto: (proyectoId: number, data: { stock_id: number; cantidad: number }) =>
    api.post(`/admin/proyectos/${proyectoId}/materiales`, data),
  eliminarMaterialProyecto: (proyectoId: number, materialId: number) =>
    api.delete(`/admin/proyectos/${proyectoId}/materiales/${materialId}`),
  crearFactura: (data: { cliente_id: number; proyecto_id?: number; monto: number; descripcion?: string }) =>
    api.post('/admin/facturas', data),
  listarFacturas: () => api.get<Factura[]>('/admin/facturas'),
  descargarFacturaPDF: (id: number) => api.get(`/admin/facturas/${id}/pdf`, { responseType: 'blob' }),
};

// Cliente
export const clienteApi = {
  listarProyectos: () => api.get<Proyecto[]>('/cliente/proyectos'),
  obtenerProyectoDetalle: (id: number) => api.get(`/cliente/proyectos/${id}`),
  crearProyecto: (nombre: string, descripcion?: string) =>
    api.post('/cliente/proyectos', { nombre, descripcion }),
  listarMateriales: () => api.get<Stock[]>('/cliente/materiales'),
  listarFacturas: () => api.get<Factura[]>('/cliente/facturas'),
  pagarFactura: (id: number) => api.post(`/cliente/facturas/${id}/pagar`),
  descargarFacturaPDF: (id: number) => api.get(`/cliente/facturas/${id}/pdf`, { responseType: 'blob' }),
};

