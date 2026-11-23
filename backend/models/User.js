const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'El nombre es obligatorio'], trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: [true, 'El correo es obligatorio'], unique: true, lowercase: true, trim: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El correo no es válido'] },
    password: { type: String, required: [true, 'La contraseña es obligatoria'], minlength: 8, select: false },
    // El registro público nunca permite asignar el rol: siempre se crea como user.
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
