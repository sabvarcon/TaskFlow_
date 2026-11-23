const validateTask = (req, res, next) => {
    const { title, description, completed } = req.body || {};
    if (req.method === 'POST' || title !== undefined) {
        if (typeof title !== 'string' || title.trim().length < 1 || title.trim().length > 100) {
            return res.status(400).json({ mensaje: 'El título es obligatorio y debe tener entre 1 y 100 caracteres.' });
        }
    }
    if (description !== undefined && (typeof description !== 'string' || description.length > 500)) {
        return res.status(400).json({ mensaje: 'La descripción debe ser texto y no superar 500 caracteres.' });
    }
    if (completed !== undefined && typeof completed !== 'boolean') {
        return res.status(400).json({ mensaje: 'El estado completed debe ser verdadero o falso.' });
    }
    next();
};
module.exports = validateTask;
