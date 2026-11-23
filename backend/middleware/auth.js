const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ mensaje: 'No autorizado. Debes iniciar sesión.' });
        }
        const token = authorization.slice(7).trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Consultar el rol vigente evita confiar en permisos antiguos incluidos en el token.
        const user = await User.findById(decoded.id).select('_id role');
        if (!user) return res.status(401).json({ mensaje: 'La sesión ya no es válida.' });
        req.user = { id: user._id.toString(), role: user.role };
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
};

module.exports = auth;
