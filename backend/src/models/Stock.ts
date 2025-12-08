import db from '../config/database.js';

export interface StockData {
  id?: number;
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad: string;
  created_at?: string;
  updated_at?: string;
}

export class Stock {
  static async crear(data: Omit<StockData, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const result = await db.run(
      'INSERT INTO stock (nombre, descripcion, cantidad, unidad) VALUES (?, ?, ?, ?)',
      [data.nombre, data.descripcion || null, data.cantidad, data.unidad || 'unidad']
    );
    return result.lastID!;
  }

  static async listar(): Promise<StockData[]> {
    return await db.all('SELECT * FROM stock ORDER BY nombre');
  }

  static async buscarPorId(id: number): Promise<StockData | null> {
    return await db.get('SELECT * FROM stock WHERE id = ?', [id]);
  }

  static async actualizar(id: number, cantidad: number): Promise<void> {
    await db.run('UPDATE stock SET cantidad = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [cantidad, id]);
  }

  static async actualizarCompleto(id: number, data: Partial<Omit<StockData, 'id' | 'created_at'>>): Promise<void> {
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
    if (data.cantidad !== undefined) {
      updates.push('cantidad = ?');
      values.push(data.cantidad);
    }
    if (data.unidad) {
      updates.push('unidad = ?');
      values.push(data.unidad);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(`UPDATE stock SET ${updates.join(', ')} WHERE id = ?`, values);
  }

  static async eliminar(id: number): Promise<void> {
    await db.run('DELETE FROM stock WHERE id = ?', [id]);
  }
}

