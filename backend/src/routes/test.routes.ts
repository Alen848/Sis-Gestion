import { Router } from 'express';
import { Usuario } from '../models/Usuario.js';
import bcrypt from 'bcryptjs';

const router = Router();

// Ruta de prueba para verificar autenticación
router.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const usuario = await Usuario.buscarPorEmail(email);
    
    if (!usuario) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        debug: { email, usuariosEnDB: 'Verificar base de datos' }
      });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password!);
    
    res.json({
      usuarioEncontrado: true,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      activo: usuario.activo,
      passwordValido,
      passwordHash: usuario.password?.substring(0, 20) + '...'
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Error en test', 
      message: error.message,
      stack: error.stack 
    });
  }
});

export default router;






