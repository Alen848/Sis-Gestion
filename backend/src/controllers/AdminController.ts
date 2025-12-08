import { Response } from 'express';
import { Usuario } from '../models/Usuario.js';
import { Proyecto } from '../models/Proyecto.js';
import { Stock } from '../models/Stock.js';
import { Factura } from '../models/Factura.js';
import { MaterialProyecto } from '../models/MaterialProyecto.js';
import { AuthRequest } from '../middleware/auth.js';

export class AdminController {
  static async listarClientes(req: AuthRequest, res: Response) {
    try {
      const clientes = await Usuario.listarActivos();
      res.json(clientes);
    } catch (error) {
      console.error('Error al listar clientes:', error);
      res.status(500).json({ error: 'Error al listar clientes' });
    }
  }

  static async listarProyectos(req: AuthRequest, res: Response) {
    try {
      const proyectos = await Proyecto.listarTodos();
      res.json(proyectos);
    } catch (error) {
      console.error('Error al listar proyectos:', error);
      res.status(500).json({ error: 'Error al listar proyectos' });
    }
  }

  static async actualizarEstadoProyecto(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['Sin empezar', 'En Proceso', 'Terminado'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }

      await Proyecto.actualizarEstado(Number(id), estado);
      res.json({ message: 'Estado actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({ error: 'Error al actualizar estado' });
    }
  }

  static async listarStock(req: AuthRequest, res: Response) {
    try {
      const stock = await Stock.listar();
      res.json(stock);
    } catch (error) {
      console.error('Error al listar stock:', error);
      res.status(500).json({ error: 'Error al listar stock' });
    }
  }

  static async crearStock(req: AuthRequest, res: Response) {
    try {
      const { nombre, descripcion, cantidad, unidad } = req.body;

      if (!nombre || cantidad === undefined) {
        return res.status(400).json({ error: 'Nombre y cantidad son requeridos' });
      }

      const stockId = await Stock.crear({
        nombre,
        descripcion,
        cantidad: Number(cantidad),
        unidad: unidad || 'unidad',
      });

      res.status(201).json({ id: stockId, message: 'Item de stock creado correctamente' });
    } catch (error) {
      console.error('Error al crear stock:', error);
      res.status(500).json({ error: 'Error al crear stock' });
    }
  }

  static async actualizarStock(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, cantidad, unidad } = req.body;

      if (cantidad !== undefined && (typeof cantidad !== 'number' || cantidad < 0)) {
        return res.status(400).json({ error: 'Cantidad inválida' });
      }

      await Stock.actualizarCompleto(Number(id), { nombre, descripcion, cantidad, unidad });
      res.json({ message: 'Stock actualizado correctamente' });
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      res.status(500).json({ error: 'Error al actualizar stock' });
    }
  }

  static async eliminarStock(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await Stock.eliminar(Number(id));
      res.json({ message: 'Item de stock eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar stock:', error);
      res.status(500).json({ error: 'Error al eliminar stock' });
    }
  }

  static async crearFactura(req: AuthRequest, res: Response) {
    try {
      const { cliente_id, proyecto_id, monto, descripcion } = req.body;

      if (!cliente_id || !monto) {
        return res.status(400).json({ error: 'Cliente y monto son requeridos' });
      }

      const facturaId = await Factura.crear({
        cliente_id,
        proyecto_id,
        monto,
        descripcion,
        estado: 'Pendiente',
      });

      res.status(201).json({ id: facturaId, message: 'Factura creada correctamente' });
    } catch (error) {
      console.error('Error al crear factura:', error);
      res.status(500).json({ error: 'Error al crear factura' });
    }
  }

  static async listarFacturas(req: AuthRequest, res: Response) {
    try {
      const facturas = await Factura.listarTodas();
      res.json(facturas);
    } catch (error) {
      console.error('Error al listar facturas:', error);
      res.status(500).json({ error: 'Error al listar facturas' });
    }
  }

  static async listarMaterialesProyecto(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const materiales = await MaterialProyecto.listarPorProyecto(Number(id));
      res.json(materiales);
    } catch (error) {
      console.error('Error al listar materiales del proyecto:', error);
      res.status(500).json({ error: 'Error al listar materiales del proyecto' });
    }
  }

  static async agregarMaterialProyecto(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { stock_id, cantidad } = req.body;

      if (!stock_id || cantidad === undefined) {
        return res.status(400).json({ error: 'Stock y cantidad son requeridos' });
      }

      const materialId = await MaterialProyecto.crear({
        proyecto_id: Number(id),
        stock_id,
        cantidad: Number(cantidad),
      });

      res.status(201).json({ id: materialId, message: 'Material agregado al proyecto' });
    } catch (error) {
      console.error('Error al agregar material:', error);
      res.status(500).json({ error: 'Error al agregar material al proyecto' });
    }
  }

  static async eliminarMaterialProyecto(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await MaterialProyecto.eliminar(Number(id));
      res.json({ message: 'Material eliminado del proyecto' });
    } catch (error) {
      console.error('Error al eliminar material:', error);
      res.status(500).json({ error: 'Error al eliminar material del proyecto' });
    }
  }
}

