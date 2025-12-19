import db from '../config/database.js';

export interface MaterialProyectoData {
  id?: number;
  proyecto_id: number;
  stock_id: number;
  cantidad: number;
  created_at?: string;
}

export interface MaterialProyectoConStock extends MaterialProyectoData {
  stock_nombre?: string;
  stock_unidad?: string;
  stock_descripcion?: string;
}

export class MaterialProyecto {
  static async crear(data: Omit<MaterialProyectoData, 'id' | 'created_at'>): Promise<number> {
    const result = await db.run(
      'INSERT INTO materiales_proyecto (proyecto_id, stock_id, cantidad) VALUES (?, ?, ?)',
      [data.proyecto_id, data.stock_id, data.cantidad]
    );
    return result.lastID!;
  }

  static async listarPorProyecto(proyectoId: number): Promise<MaterialProyectoConStock[]> {
    return await db.all(`
      SELECT mp.*, s.nombre as stock_nombre, s.unidad as stock_unidad, s.descripcion as stock_descripcion
      FROM materiales_proyecto mp
      JOIN stock s ON mp.stock_id = s.id
      WHERE mp.proyecto_id = ?
      ORDER BY s.nombre
    `, [proyectoId]);
  }

  static async actualizar(id: number, cantidad: number): Promise<void> {
    await db.run('UPDATE materiales_proyecto SET cantidad = ? WHERE id = ?', [cantidad, id]);
  }

  static async eliminar(id: number): Promise<void> {
    await db.run('DELETE FROM materiales_proyecto WHERE id = ?', [id]);
  }

  static async buscarPorId(id: number): Promise<MaterialProyectoData | null> {
    return await db.get('SELECT * FROM materiales_proyecto WHERE id = ?', [id]);
  }
}








