import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

function initTables(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          nombre TEXT NOT NULL,
          rol TEXT NOT NULL CHECK(rol IN ('admin', 'cliente')),
          activo INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS proyectos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cliente_id INTEGER NOT NULL,
          nombre TEXT NOT NULL,
          descripcion TEXT,
          estado TEXT NOT NULL CHECK(estado IN ('Sin empezar', 'En Proceso', 'Terminado')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS stock (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          descripcion TEXT,
          cantidad INTEGER NOT NULL DEFAULT 0,
          unidad TEXT DEFAULT 'unidad',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS facturas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cliente_id INTEGER NOT NULL,
          proyecto_id INTEGER,
          monto REAL NOT NULL,
          descripcion TEXT,
          estado TEXT NOT NULL CHECK(estado IN ('Pendiente', 'Pagada', 'Cancelada')),
          fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
          fecha_pago DATETIME,
          numero_factura TEXT UNIQUE,
          FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
          FOREIGN KEY (proyecto_id) REFERENCES proyectos(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS materiales_proyecto (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          proyecto_id INTEGER NOT NULL,
          stock_id INTEGER NOT NULL,
          cantidad INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (proyecto_id) REFERENCES proyectos(id),
          FOREIGN KEY (stock_id) REFERENCES stock(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

function runQuery(db: sqlite3.Database, sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(db: sqlite3.Database, sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function initAdmin() {
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      process.exit(1);
    } else {
      console.log('Conectado a SQLite');
    }
  });

  try {
    // Inicializar tablas primero
    await initTables(db);
    console.log('Tablas inicializadas');

    // Verificar si ya existe el admin
    const adminExistente = await getQuery(db, 'SELECT * FROM usuarios WHERE email = ?', ['admin@riego.com']);
    
    if (adminExistente) {
      console.log('\n⚠️  Usuario admin ya existe. Eliminando y recreando...');
      await runQuery(db, 'DELETE FROM usuarios WHERE email = ?', ['admin@riego.com']);
    }

    // Crear usuario admin
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await runQuery(
      db,
      `INSERT INTO usuarios (email, password, nombre, rol, activo)
       VALUES (?, ?, ?, ?, ?)`,
      ['admin@riego.com', hashedPassword, 'Administrador', 'admin', 1]
    );
    
    // Verificar que se creó correctamente
    const adminCreado = await getQuery(db, 'SELECT * FROM usuarios WHERE email = ?', ['admin@riego.com']);
    
    if (adminCreado) {
      // Probar la contraseña
      const passwordValido = await bcrypt.compare(password, adminCreado.password);
      
      console.log('\n✅ Usuario admin creado exitosamente:');
      console.log('   Email: admin@riego.com');
      console.log('   Password: admin123');
      console.log('   ID:', adminCreado.id);
      console.log('   Rol:', adminCreado.rol);
      console.log('   Activo:', adminCreado.activo);
      console.log('   Password verificado:', passwordValido ? '✅' : '❌');
    } else {
      console.error('❌ Error: No se pudo verificar la creación del usuario');
    }
    
    console.log('\n✅ Inicialización completada');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

initAdmin();

