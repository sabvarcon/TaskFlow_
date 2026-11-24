require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares generales
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(value => value.trim()) : false }));
app.use(express.json({ limit: '20kb' }));

// Servir la compilación React cuando exista; mantener el frontend anterior como respaldo.
const reactDist = path.join(__dirname, '../frontend-react/dist');
const legacyFrontend = path.join(__dirname, '../frontend');
app.use(express.static(fs.existsSync(reactDist) ? reactDist : legacyFrontend));

// Ruta principal de la API
app.get('/api', (req, res) => {
    res.status(200).json({
        mensaje: 'API TaskFlow funcionando correctamente'
    });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/admin', adminRoutes);

// Rutas del cliente React: cualquier ruta no-API devuelve index.html.
if (fs.existsSync(path.join(reactDist, 'index.html'))) {
    app.get(/^(?!\/api).*/, (req, res) => res.sendFile(path.join(reactDist, 'index.html')));
}

// Ruta para direcciones inexistentes
app.use((req, res) => {
    res.status(404).json({
        mensaje: 'Ruta no encontrada'
    });
});

// Middleware global de errores
app.use((err, req, res, next) => {
    console.error(err);

    if (err.code === 11000) {
        return res.status(409).json({ mensaje: 'Ya existe un registro con esos datos.' });
    }

    if (res.headersSent) {
        return next(err);
    }

    const status = err.status || 500;
    res.status(status).json({
        mensaje: status >= 500 ? 'Error interno del servidor' : err.message
    });
});

// Iniciar servidor después de conectar MongoDB
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Servidor funcionando en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('No fue posible iniciar TaskFlow');
        process.exit(1);
    }
};

startServer();
