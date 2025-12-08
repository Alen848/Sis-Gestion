import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error al conectar a la base de datos:', err);
      } else {
        console.log('Conectado a SQLite');
        this.initTables();
      }
    });
  }

  private initTables() {
    // Tabla de usuarios
    this.db.run(`
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

    // Tabla de proyectos
    this.db.run(`
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

    // Tabla de stock
    this.db.run(`
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

    // Tabla de facturas
    this.db.run(`
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

    // Tabla de materiales por proyecto
    this.db.run(`
      CREATE TABLE IF NOT EXISTS materiales_proyecto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        proyecto_id INTEGER NOT NULL,
        stock_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id),
        FOREIGN KEY (stock_id) REFERENCES stock(id)
      )
    `);

    // El admin se crea con el script initAdmin.ts
  }

  getDb() {
    return this.db;
  }

  run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

export default new Database();

