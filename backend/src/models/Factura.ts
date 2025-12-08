import db from '../config/database.js';

export interface FacturaData {
  id?: number;
  cliente_id: number;
  proyecto_id?: number;
  monto: number;
  descripcion?: string;
  estado: 'Pendiente' | 'Pagada' | 'Cancelada';
  fecha_emision?: string;
  fecha_pago?: string;
  numero_factura?: string;
}

export class Factura {
  static async crear(data: Omit<FacturaData, 'id' | 'fecha_emision' | 'fecha_pago' | 'numero_factura'>): Promise<number> {
    // Generar número de factura
    const year = new Date().getFullYear();
    const count = await db.get('SELECT COUNT(*) as count FROM facturas WHERE strftime("%Y", fecha_emision) = ?', [year.toString()]);
    const numero = `FAC-${year}-${String((count?.count || 0) + 1).padStart(5, '0')}`;
    
    const result = await db.run(
      'INSERT INTO facturas (cliente_id, proyecto_id, monto, descripcion, estado, numero_factura) VALUES (?, ?, ?, ?, ?, ?)',
      [data.cliente_id, data.proyecto_id || null, data.monto, data.descripcion || null, data.estado, numero]
    );
    return result.lastID!;
  }

  static async buscarPorNumero(numero: string): Promise<FacturaData | null> {
    return await db.get('SELECT * FROM facturas WHERE numero_factura = ?', [numero]);
  }

  static async obtenerCompleta(id: number): Promise<(FacturaData & { cliente_nombre: string; cliente_email: string; proyecto_nombre?: string }) | null> {
    return await db.get(`
      SELECT f.*, u.nombre as cliente_nombre, u.email as cliente_email, p.nombre as proyecto_nombre
      FROM facturas f
      JOIN usuarios u ON f.cliente_id = u.id
      LEFT JOIN proyectos p ON f.proyecto_id = p.id
      WHERE f.id = ?
    `, [id]);
  }

  static async buscarPorId(id: number): Promise<FacturaData | null> {
    return await db.get('SELECT * FROM facturas WHERE id = ?', [id]);
  }

  static async listarPorCliente(clienteId: number): Promise<FacturaData[]> {
    return await db.all('SELECT * FROM facturas WHERE cliente_id = ? ORDER BY fecha_emision DESC', [clienteId]);
  }

  static async listarTodas(): Promise<(FacturaData & { cliente_nombre: string; proyecto_nombre?: string })[]> {
    return await db.all(`
      SELECT f.*, u.nombre as cliente_nombre, p.nombre as proyecto_nombre
      FROM facturas f
      JOIN usuarios u ON f.cliente_id = u.id
      LEFT JOIN proyectos p ON f.proyecto_id = p.id
      ORDER BY f.fecha_emision DESC
    `);
  }

  static async pagar(id: number): Promise<void> {
    await db.run(
      'UPDATE facturas SET estado = ?, fecha_pago = CURRENT_TIMESTAMP WHERE id = ?',
      ['Pagada', id]
    );
  }
}

