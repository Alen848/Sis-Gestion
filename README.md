# Sistema de Gestión - Empresa de Sistemas de Riego

Sistema completo de gestión con dos paneles: uno para administradores y otro para clientes.

## Características

### Panel de Administrador
- Ver clientes activos
- Gestionar proyectos (ver y cambiar estados: Sin empezar/En Proceso/Terminado)
- Ver y actualizar stock
- Crear y ver facturas

### Panel de Cliente
- Ver proyectos propios
- Crear nuevos proyectos
- Ver materiales disponibles
- Ver y pagar facturas
- Centro de soporte (Email y WhatsApp)

## Tecnologías

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite
- **Base de Datos**: SQLite
- **Autenticación**: JWT

## Estructura del Proyecto

```
├── backend/
│   ├── src/
│   │   ├── config/        # Configuración (base de datos)
│   │   ├── controllers/   # Controladores (lógica de negocio)
│   │   ├── models/        # Modelos de datos
│   │   ├── routes/        # Rutas de la API
│   │   ├── middleware/    # Middleware (autenticación)
│   │   └── server.ts      # Servidor principal
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas principales
│   │   ├── controllers/   # Controladores (lógica de estado)
│   │   ├── models/        # Tipos e interfaces
│   │   ├── services/      # Servicios API
│   │   └── App.tsx        # Componente principal
│   └── package.json
└── package.json
```

## Instalación

1. Instalar dependencias:
```bash
npm run install:all
```

2. Configurar variables de entorno:
```bash
cd backend
cp .env.example .env
```

Editar `backend/.env`:
```
PORT=5000
JWT_SECRET=tu_secreto_jwt_aqui
DB_PATH=./database.sqlite
```

3. Inicializar usuario administrador:
```bash
cd backend
npm run init:admin
```

Credenciales por defecto:
- Email: `admin@riego.com`
- Password: `admin123`

## Ejecución

### Desarrollo (ambos servidores)
```bash
npm run dev
```

### Solo Backend
```bash
npm run dev:backend
```

### Solo Frontend
```bash
npm run dev:frontend
```

El backend estará en `http://localhost:5000` y el frontend en `http://localhost:3000`.

## Uso

1. **Como Administrador:**
   - Inicia sesión con `admin@riego.com` / `admin123`
   - Accede al panel de administrador
   - Puedes ver clientes, proyectos, stock y crear facturas

2. **Como Cliente:**
   - Regístrate con un nuevo usuario
   - Crea proyectos
   - Ve materiales disponibles
   - Paga facturas pendientes
   - Accede al soporte

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/registro` - Registrar nuevo cliente
- `GET /api/auth/perfil` - Obtener perfil (requiere auth)

### Admin (requiere rol admin)
- `GET /api/admin/clientes` - Listar clientes
- `GET /api/admin/proyectos` - Listar todos los proyectos
- `PATCH /api/admin/proyectos/:id/estado` - Actualizar estado
- `GET /api/admin/stock` - Listar stock
- `PATCH /api/admin/stock/:id` - Actualizar stock
- `POST /api/admin/facturas` - Crear factura
- `GET /api/admin/facturas` - Listar facturas

### Cliente (requiere auth)
- `GET /api/cliente/proyectos` - Listar proyectos del cliente
- `POST /api/cliente/proyectos` - Crear proyecto
- `GET /api/cliente/materiales` - Listar materiales
- `GET /api/cliente/facturas` - Listar facturas del cliente
- `POST /api/cliente/facturas/:id/pagar` - Pagar factura

## Notas

- La base de datos SQLite se crea automáticamente al iniciar el servidor
- El sistema usa JWT para autenticación
- Los roles están separados: `admin` y `cliente`
- El proyecto está estructurado con MVC para facilitar el crecimiento futuro








