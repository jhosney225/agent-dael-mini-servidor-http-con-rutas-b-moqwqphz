```javascript
const http = require('http');
const url = require('url');

// Define las rutas disponibles
const routes = {
  '/': {
    method: 'GET',
    handler: (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Mini Servidor HTTP</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
              h1 { color: #333; }
              .ruta { background: white; padding: 10px; margin: 10px 0; border-left: 4px solid #007bff; }
              .metodo { color: #007bff; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Bienvenido al Mini Servidor HTTP</h1>
            <p>Servidor ejecutándose correctamente</p>
            <h2>Rutas disponibles:</h2>
            <div class="ruta">
              <span class="metodo">GET</span> /api/usuarios - Lista de usuarios
            </div>
            <div class="ruta">
              <span class="metodo">GET</span> /api/usuarios/:id - Usuario específico
            </div>
            <div class="ruta">
              <span class="metodo">POST</span> /api/usuarios - Crear usuario
            </div>
            <div class="ruta">
              <span class="metodo">GET</span> /api/productos - Lista de productos
            </div>
            <div class="ruta">
              <span class="metodo">GET</span> /health - Estado del servidor
            </div>
            <div class="ruta">
              <span class="metodo">GET</span> /api/* - Cualquier otra ruta API devuelve 404
            </div>
          </body>
        </html>
      `);
    }
  },
  '/health': {
    method: 'GET',
    handler: (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }));
    }
  },
  '/api/usuarios': {
    method: 'GET',
    handler: (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: [
          { id: 1, nombre: 'Juan', email: 'juan@example.com' },
          { id: 2, nombre: 'María', email: 'maria@example.com' },
          { id: 3, nombre: 'Carlos', email: 'carlos@example.com' }
        ]
      }));
    }
  },
  '/api/productos': {
    method: 'GET',
    handler: (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: [
          { id: 1, nombre: 'Laptop', precio: 999.99 },
          { id: 2, nombre: 'Mouse', precio: 29.99 },
          { id: 3, nombre: 'Teclado', precio: 79.99 }
        ]
      }));
    }
  }
};

// Datos en memoria para usuarios
const usuariosDB = [
  { id: 1, nombre: 'Juan', email: 'juan@example.com' },
  { id: 2, nombre: 'María', email: 'maria@example.com' },
  { id: 3, nombre: 'Carlos', email: 'carlos@example.com' }
];

let proximoUsuarioId = 4;

// Función para manejar POST en /api/usuarios
const crearUsuario = (req, res) => {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const nuevoUsuario = JSON.parse(body);
      
      if (!nuevoUsuario.nombre || !nuevoUsuario.email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'El nombre y email son requeridos'
        }));
        return;
      }
      
      const usuario = {
        id: proximoUsuarioId++,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email
      };
      
      usuariosDB.push(usuario);
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuario
      }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'JSON inválido'
      }));
    }
  });
};

// Función para obtener usuario por ID
const obtenerUsuarioPorId = (id, res) => {
  const usuario = usuariosDB.find(u => u.id === parseInt(id));
  
  if (!usuario) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({