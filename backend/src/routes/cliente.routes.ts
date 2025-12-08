import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController.js';
import { FacturaController } from '../controllers/FacturaController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/proyectos', ClienteController.listarProyectos);
router.get('/proyectos/:id', ClienteController.obtenerProyectoDetalle);
router.post('/proyectos', ClienteController.crearProyecto);
router.get('/materiales', ClienteController.listarMateriales);
router.get('/facturas', ClienteController.listarFacturas);
router.post('/facturas/:id/pagar', ClienteController.pagarFactura);
router.get('/facturas/:id/pdf', FacturaController.generarPDF);

export default router;

