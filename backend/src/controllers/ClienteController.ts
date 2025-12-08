import { Response } from 'express';
import { Proyecto } from '../models/Proyecto.js';
import { Stock } from '../models/Stock.js';
import { Factura } from '../models/Factura.js';
import { MaterialProyecto } from '../models/MaterialProyecto.js';
import { AuthRequest } from '../middleware/auth.js';

export class ClienteController {
  static async listarProyectos(req: AuthRequest, res: Response) {
    try {
      const proyectos = await Proyecto.listarPorCliente(req.userId!);
      res.json(proyectos);
    } catch (error) {
      console.error('Error al listar proyectos:', error);
      res.status(500).json({ error: 'Error al listar proyectos' });
    }
  }

  static async crearProyecto(req: AuthRequest, res: Response) {
    try {
      const { nombre, descripcion } = req.body;

      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es requerido' });
      }

      const proyectoId = await Proyecto.crear({
        cliente_id: req.userId!,
        nombre,
        descripcion,
        estado: 'Sin empezar',
      });

      res.status(201).json({ id: proyectoId, message: 'Proyecto creado correctamente' });
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      res.status(500).json({ error: 'Error al crear proyecto' });
    }
  }

  static async listarMateriales(req: AuthRequest, res: Response) {
    try {
      const materiales = await Stock.listar();
      res.json(materiales);
    } catch (error) {
      console.error('Error al listar materiales:', error);
      res.status(500).json({ error: 'Error al listar materiales' });
    }
  }

  static async listarFacturas(req: AuthRequest, res: Response) {
    try {
      const facturas = await Factura.listarPorCliente(req.userId!);
      res.json(facturas);
    } catch (error) {
      console.error('Error al listar facturas:', error);
      res.status(500).json({ error: 'Error al listar facturas' });
    }
  }

  static async obtenerProyectoDetalle(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const proyecto = await Proyecto.buscarPorId(Number(id));

      if (!proyecto) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }

      if (proyecto.cliente_id !== req.userId) {
        return res.status(403).json({ error: 'No tienes permiso para ver este proyecto' });
      }

      const materiales = await MaterialProyecto.listarPorProyecto(Number(id));
      const facturas = await Factura.listarPorCliente(req.userId!);
      const facturasProyecto = facturas.filter(f => f.proyecto_id === Number(id));

      res.json({
        proyecto,
        materiales,
        facturas: facturasProyecto,
      });
    } catch (error) {
      console.error('Error al obtener detalle del proyecto:', error);
      res.status(500).json({ error: 'Error al obtener detalle del proyecto' });
    }
  }

  static async pagarFactura(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const factura = await Factura.buscarPorId(Number(id));

      if (!factura) {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }

      if (factura.cliente_id !== req.userId) {
        return res.status(403).json({ error: 'No tienes permiso para pagar esta factura' });
      }

      if (factura.estado !== 'Pendiente') {
        return res.status(400).json({ error: 'La factura ya fue procesada' });
      }

      await Factura.pagar(Number(id));
      res.json({ message: 'Factura pagada correctamente' });
    } catch (error) {
      console.error('Error al pagar factura:', error);
      res.status(500).json({ error: 'Error al pagar factura' });
    }
  }
}

