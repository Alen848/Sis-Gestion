import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';
import { AuthRequest } from '../middleware/auth.js';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      console.log('Intento de login:', { email, passwordProvided: !!password });

      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const usuario = await Usuario.buscarPorEmail(email);
      console.log('Usuario encontrado:', usuario ? { id: usuario.id, email: usuario.email, activo: usuario.activo } : 'No encontrado');

      if (!usuario || !usuario.activo) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const passwordValido = await Usuario.verificarPassword(password, usuario.password!);
      console.log('Password válido:', passwordValido);

      if (!passwordValido) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { userId: usuario.id, rol: usuario.rol },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
        },
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }

  static async registrar(req: Request, res: Response) {
    try {
      const { email, password, nombre } = req.body;

      if (!email || !password || !nombre) {
        return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
      }

      const usuarioExistente = await Usuario.buscarPorEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      const usuarioId = await Usuario.crear({
        email,
        password,
        nombre,
        rol: 'cliente',
        activo: 1,
      });

      const token = jwt.sign(
        { userId: usuarioId, rol: 'cliente' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        usuario: {
          id: usuarioId,
          email,
          nombre,
          rol: 'cliente',
        },
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }

  static async perfil(req: AuthRequest, res: Response) {
    try {
      const usuario = await Usuario.buscarPorId(req.userId!);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }
}

