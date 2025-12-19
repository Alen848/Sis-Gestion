import db from '../config/database.js';
import bcrypt from 'bcryptjs';

export interface UsuarioData {
  id?: number;
  email: string;
  password?: string;
  nombre: string;
  rol: 'admin' | 'cliente';
  activo?: number;
  created_at?: string;
}

export class Usuario {
  static async crear(data: Omit<UsuarioData, 'id' | 'created_at'>): Promise<number> {
    const hashedPassword = await bcrypt.hash(data.password || '', 10);
    const result = await db.run(
      'INSERT INTO usuarios (email, password, nombre, rol, activo) VALUES (?, ?, ?, ?, ?)',
      [data.email, hashedPassword, data.nombre, data.rol, data.activo ?? 1]
    );
    return result.lastID!;
  }

  static async buscarPorEmail(email: string): Promise<UsuarioData | null> {
    return await db.get('SELECT * FROM usuarios WHERE email = ?', [email]);
  }

  static async buscarPorId(id: number): Promise<UsuarioData | null> {
    return await db.get('SELECT * FROM usuarios WHERE id = ?', [id]);
  }

  static async listarActivos(): Promise<UsuarioData[]> {
    return await db.all('SELECT id, email, nombre, rol, activo, created_at FROM usuarios WHERE activo = 1 AND rol = ?', ['cliente']);
  }

  static async verificarPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}








