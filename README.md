# TaskFlow

Aplicación web full stack para la gestión de tareas personales. Permite registrar usuarios, iniciar sesión y administrar tareas mediante operaciones CRUD. Esta versión amplía el avance original con autorización por roles, filtros, paginación, validación, pruebas automatizadas e integración REST de clima.

## Tecnologías

- Backend: Node.js 18 o superior y Express.
- Base de datos: MongoDB Atlas y Mongoose.
- Autenticación: JSON Web Tokens (JWT).
- Seguridad de contraseñas: bcryptjs.
- Frontend principal: React, React Router y Vite.
- Frontend original: HTML, CSS y JavaScript (se conserva como respaldo en `frontend/`).
- API externa: OpenWeather REST API.
- Pruebas: Node.js Test Runner (`node:test`).

## Funcionalidades

- Registro e inicio de sesión.
- Contraseñas cifradas con bcryptjs y acceso a rutas mediante JWT.
- Roles `user` y `admin`. El registro público asigna siempre `user`; no se puede solicitar el rol administrativo desde el formulario.
- CRUD de tareas aislado por propietario.
- Filtro por estado (`completed=true|false`), búsqueda por título (`search`) y paginación (`page`, `limit`, máximo 50).
- Ruta administrativa de consulta de usuarios, protegida para `admin`.
- Consulta de clima por ciudad mediante OpenWeather, con la clave almacenada en el backend.
- Validación de entradas y manejo centralizado de errores.

## Instalación

Requisitos: Node.js 18+ y una base de datos MongoDB.

```bash
npm install
cp .env.example .env
```

Edita `.env` y configura valores propios:

```env
PORT=3000
MONGO_URI=tu_uri_de_mongodb
JWT_SECRET=un_secreto_aleatorio_largo
JWT_EXPIRES_IN=1d
OPENWEATHER_API_KEY=tu_api_key
CORS_ORIGIN=http://localhost:3000
```

No publiques `.env`, claves API, contraseñas ni cadenas de conexión. `.env.example` contiene únicamente marcadores.

## Ejecución

```bash
npm run dev
# o
npm start
```

Abre `http://localhost:3000`.

## Pruebas

```bash
npm test
```

Las pruebas actuales verifican la validación de tareas y la autorización por roles. Para completar la cobertura del reto, agrega pruebas de integración HTTP con una base MongoDB de pruebas para registro, login y operaciones CRUD.

## Endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registrar usuario estándar |
| POST | `/api/auth/login` | Público | Iniciar sesión y obtener JWT |
| GET | `/api/tasks?page=1&limit=8` | JWT | Listar tareas con paginación |
| GET | `/api/tasks?completed=false` | JWT | Filtrar pendientes |
| GET | `/api/tasks?search=reporte` | JWT | Buscar por título |
| POST | `/api/tasks` | JWT | Crear tarea |
| GET | `/api/tasks/:id` | JWT | Consultar tarea propia |
| PUT | `/api/tasks/:id` | JWT | Actualizar tarea propia |
| DELETE | `/api/tasks/:id` | JWT | Eliminar tarea propia |
| GET | `/api/weather?city=Durango` | JWT | Consultar clima externo |
| GET | `/api/admin/users?page=1&limit=20` | JWT + admin | Listar usuarios |

Para las rutas protegidas, envía `Authorization: Bearer TU_TOKEN`.

## Roles

Todos los registros nuevos reciben el rol `user`. Para habilitar un administrador de forma controlada, actualiza el campo `role` de una cuenta directamente en MongoDB Atlas o mediante una herramienta administrativa segura. Nunca expongas una ruta pública que permita elevar privilegios.

## Despliegue

Configura en el proveedor de hosting las mismas variables de entorno utilizadas localmente (`MONGO_URI`, `JWT_SECRET`, `OPENWEATHER_API_KEY`, `CORS_ORIGIN` y `PORT` si el proveedor lo requiere). No subas el archivo `.env`. Verifica en producción registro, login, CRUD, filtros, paginación y la ruta de clima. Si frontend y backend se alojan en dominios distintos, limita `CORS_ORIGIN` al dominio real del frontend.

## Seguridad y limitaciones conocidas

- El frontend de esta versión conserva el JWT en `localStorage`. Para producción se recomienda migrar a cookies `HttpOnly`, `Secure` y `SameSite`, junto con protección CSRF y una política CORS específica.
- La clave de OpenWeather es opcional en desarrollo; sin ella, el endpoint responde `503` con un mensaje de configuración.
- Los tests incluidos son pruebas unitarias de middleware, no sustituyen una suite de integración ni una auditoría de seguridad.
- El frontend React utiliza JWT en `localStorage`; para producción se recomienda migrar a cookies `HttpOnly`, `Secure` y `SameSite`, junto con protección CSRF.
- La compilación de React debe verificarse con `npm run build` antes de publicar.
- Los tests incluidos son pruebas unitarias de middleware, no sustituyen una suite de integración ni una auditoría de seguridad.

## Autor

Proyecto académico TaskFlow.

## Frontend React (migración)

El proyecto conserva el frontend original en `frontend/` como respaldo y añade la nueva aplicación React en `frontend-react/`.

### Desarrollo

1. Instala las dependencias del backend y frontend desde la raíz: `npm install`.
2. Inicia MongoDB y configura las variables de `.env` a partir de `.env.example`.
3. En una terminal ejecuta `npm run dev` para iniciar Express.
4. En otra terminal ejecuta `npm run dev:frontend` para iniciar Vite en `http://localhost:5173`.

Vite reenvía las solicitudes `/api` a Express en `http://localhost:3000`.

### Compilar para producción

Ejecuta `npm run build`. Vite genera los archivos compilados en `frontend/dist/`; Express sirve esa carpeta automáticamente. En Render, configura el comando de construcción como `npm install && npm run build` y el comando de inicio como `npm start`.

La aplicación React conserva las rutas existentes de autenticación, tareas, clima y administración. Para que la consulta del clima funcione, configura `OPENWEATHER_API_KEY` en las variables de entorno del servidor.

### Despliegue guiado en Render

Se incluye `render.yaml` como punto de partida para crear un servicio web. Al conectar el repositorio en Render, revisa el archivo y proporciona `MONGO_URI`, `OPENWEATHER_API_KEY` y `CORS_ORIGIN` en el panel de variables de entorno. `JWT_SECRET` se genera automáticamente por la configuración declarativa. `CORS_ORIGIN` debe contener el origen público real del frontend; si la misma aplicación sirve React y la API desde un solo dominio, usa ese origen. Después del despliegue, comprueba `GET /api` y realiza pruebas manuales de registro, login, tareas y clima.

La presencia de `render.yaml` no significa que el servicio ya esté publicado. El despliegue requiere conectar el repositorio y configurar una base MongoDB accesible desde Render.
