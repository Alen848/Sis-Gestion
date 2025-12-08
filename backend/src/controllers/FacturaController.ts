import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { Factura } from '../models/Factura.js';
import { AuthRequest } from '../middleware/auth.js';

export class FacturaController {
  static async generarPDF(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const factura = await Factura.obtenerCompleta(Number(id));

      if (!factura) {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }

      // Verificar permisos
      if (req.userRol === 'cliente' && factura.cliente_id !== req.userId) {
        return res.status(403).json({ error: 'No tienes permiso para ver esta factura' });
      }

      // Crear PDF
      const doc = new PDFDocument({ margin: 50 });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=factura-${factura.numero_factura || factura.id}.pdf`);

      doc.pipe(res);

      // Encabezado
      doc.fontSize(24).fillColor('#2d8659').text('Tecnica Nomade', 50, 50);
      doc.fontSize(12).fillColor('#666').text('Sistemas de Riego', 50, 80);
      doc.moveDown();

      // Información de la factura
      doc.fontSize(20).fillColor('#000').text('FACTURA', 50, 120);
      doc.fontSize(10).fillColor('#666').text(`Número: ${factura.numero_factura || `FAC-${factura.id}`}`, 400, 120);
      doc.fontSize(10).fillColor('#666').text(`Fecha: ${factura.fecha_emision ? new Date(factura.fecha_emision).toLocaleDateString('es-AR') : 'N/A'}`, 400, 140);

      // Cliente
      doc.moveDown();
      doc.fontSize(12).fillColor('#000').text('Cliente:', 50);
      doc.fontSize(11).fillColor('#333').text(factura.cliente_nombre, 50);
      doc.fontSize(10).fillColor('#666').text(factura.cliente_email, 50);

      // Proyecto si existe
      if (factura.proyecto_nombre) {
        doc.moveDown();
        doc.fontSize(12).fillColor('#000').text('Proyecto:', 50);
        doc.fontSize(11).fillColor('#333').text(factura.proyecto_nombre, 50);
      }

      // Descripción
      if (factura.descripcion) {
        doc.moveDown();
        doc.fontSize(12).fillColor('#000').text('Descripción:', 50);
        doc.fontSize(11).fillColor('#333').text(factura.descripcion, 50);
      }

      // Monto
      doc.moveDown(2);
      doc.fontSize(16).fillColor('#2d8659').text('Total:', 400);
      doc.fontSize(20).fillColor('#2d8659').text(`$${factura.monto.toFixed(2)}`, 400);

      // Estado
      doc.moveDown();
      doc.fontSize(12).fillColor('#000').text(`Estado: ${factura.estado}`, 50);
      if (factura.fecha_pago) {
        doc.fontSize(10).fillColor('#666').text(`Fecha de pago: ${new Date(factura.fecha_pago).toLocaleDateString('es-AR')}`, 50);
      }

      // Pie de página
      doc.fontSize(8).fillColor('#999').text('Tecnica Nomade - Sistemas de Riego', 50, doc.page.height - 50, {
        align: 'center'
      });

      doc.end();
    } catch (error) {
      console.error('Error al generar PDF:', error);
      res.status(500).json({ error: 'Error al generar PDF' });
    }
  }
}






