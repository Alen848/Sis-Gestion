import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { FacturaController } from '../controllers/FacturaController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/clientes', AdminController.listarClientes);
router.get('/proyectos', AdminController.listarProyectos);
router.patch('/proyectos/:id/estado', AdminController.actualizarEstadoProyecto);
router.get('/stock', AdminController.listarStock);
router.post('/stock', AdminController.crearStock);
router.patch('/stock/:id', AdminController.actualizarStock);
router.delete('/stock/:id', AdminController.eliminarStock);
router.get('/proyectos/:id/materiales', AdminController.listarMaterialesProyecto);
router.post('/proyectos/:id/materiales', AdminController.agregarMaterialProyecto);
router.delete('/proyectos/:proyectoId/materiales/:id', AdminController.eliminarMaterialProyecto);
router.post('/facturas', AdminController.crearFactura);
router.get('/facturas', AdminController.listarFacturas);
router.get('/facturas/:id/pdf', FacturaController.generarPDF);

export default router;

