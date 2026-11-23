// Uso: authorizeRoles('admin') o authorizeRoles('admin', 'user').
module.exports = (...allowedRoles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ mensaje: 'Autenticación requerida.' });
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción.' });
    }
    next();
};
