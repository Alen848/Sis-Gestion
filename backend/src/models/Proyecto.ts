import db from '../config/database.js';

export interface ProyectoData {
  id?: number;
  cliente_id: number;
  nombre: string;
  descripcion?: string;
  estado: 'Sin empezar' | 'En Proceso' | 'Terminado';
  created_at?: string;
  updated_at?: string;
}

export class Proyecto {
  static async crear(data: Omit<ProyectoData, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await db.run(
      'INSERT INTO proyectos (cliente_id, nombre, descripcion, estado) VALUES (?, ?, ?, ?)',
      [data.cliente_id, data.nombre, data.descripcion || null, data.estado]
    );
    return result.lastID!;
  }

  static async buscarPorId(id: number): Promise<ProyectoData | null> {
    return await db.get('SELECT * FROM proyectos WHERE id = ?', [id]);
  }

  static async listarPorCliente(clienteId: number): Promise<ProyectoData[]> {
    return await db.all('SELECT * FROM proyectos WHERE cliente_id = ? ORDER BY created_at DESC', [clienteId]);
  }

  static async listarTodos(): Promise<(ProyectoData & { cliente_nombre: string; cliente_email: string })[]> {
    return await db.all(`
      SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email
      FROM proyectos p
      JOIN usuarios u ON p.cliente_id = u.id
      ORDER BY p.created_at DESC
    `);
  }

  static async actualizarEstado(id: number, estado: ProyectoData['estado']): Promise<void> {
    await db.run('UPDATE proyectos SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [estado, id]);
  }

  static async actualizar(id: number, data: Partial<Omit<ProyectoData, 'id' | 'created_at'>>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.nombre) {
      updates.push('nombre = ?');
      values.push(data.nombre);
    }
    if (data.descripcion !== undefined) {
      updates.push('descripcion = ?');
      values.push(data.descripcion);
    }
    if (data.estado) {
      updates.push('estado = ?');
      values.push(data.estado);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(`UPDATE proyectos SET ${updates.join(', ')} WHERE id = ?`, values);
  }
}






