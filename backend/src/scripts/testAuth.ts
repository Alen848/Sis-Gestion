import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

function getQuery(db: sqlite3.Database, sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function testAuth() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error al conectar:', err);
      process.exit(1);
    }
  });

  try {
    // Verificar si existe el usuario admin
    const admin = await getQuery(db, 'SELECT * FROM usuarios WHERE email = ?', ['admin@riego.com']);
    
    if (admin) {
      console.log('Usuario admin encontrado:');
      console.log('- ID:', admin.id);
      console.log('- Email:', admin.email);
      console.log('- Nombre:', admin.nombre);
      console.log('- Rol:', admin.rol);
      console.log('- Activo:', admin.activo);
      
      // Probar contraseña
      const testPassword = 'admin123';
      const isValid = await bcrypt.compare(testPassword, admin.password);
      console.log('- Password "admin123" válida:', isValid);
    } else {
      console.log('❌ Usuario admin NO encontrado. Ejecuta: npm run init:admin');
    }

    // Listar todos los usuarios
    db.all('SELECT id, email, nombre, rol, activo FROM usuarios', [], (err, rows) => {
      if (err) {
        console.error('Error al listar usuarios:', err);
      } else {
        console.log('\nTodos los usuarios:');
        console.table(rows);
      }
      db.close();
    });
  } catch (error) {
    console.error('Error:', error);
    db.close();
    process.exit(1);
  }
}

testAuth();






