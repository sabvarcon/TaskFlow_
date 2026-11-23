const Task = require('../models/Task');
const mongoose = require('mongoose');

const createTask = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const task = await Task.create({ title: title.trim(), description: (description || '').trim(), user: req.user.id });
        res.status(201).json({ mensaje: 'Tarea creada correctamente', tarea: task });
    } catch (error) { next(error); }
};

// Filtros: completed=true|false, search=texto, page=1, limit=10.
const getTasks = async (req, res, next) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
        const filter = { user: req.user.id };
        if (req.query.completed === 'true') filter.completed = true;
        if (req.query.completed === 'false') filter.completed = false;
        if (typeof req.query.search === 'string' && req.query.search.trim()) {
            const escaped = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.title = { $regex: escaped, $options: 'i' };
        }
        const [tasks, total] = await Promise.all([
            Task.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            Task.countDocuments(filter)
        ]);
        res.status(200).json({ total, tareas: tasks, pagination: { page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 } });
    } catch (error) { next(error); }
};

const getTaskById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ mensaje: 'El ID de la tarea no es válido' });
        const task = await Task.findOne({ _id: id, user: req.user.id });
        if (!task) return res.status(404).json({ mensaje: 'Tarea no encontrada' });
        res.status(200).json({ tarea: task });
    } catch (error) { next(error); }
};

const updateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ mensaje: 'El ID de la tarea no es válido' });
        const updates = {};
        for (const key of ['title', 'description', 'completed']) {
            if (req.body[key] !== undefined) updates[key] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
        }
        if (!Object.keys(updates).length) return res.status(400).json({ mensaje: 'Debes proporcionar al menos un campo para actualizar' });
        const task = await Task.findOneAndUpdate({ _id: id, user: req.user.id }, updates, { new: true, runValidators: true });
        if (!task) return res.status(404).json({ mensaje: 'Tarea no encontrada' });
        res.status(200).json({ mensaje: 'Tarea actualizada correctamente', tarea: task });
    } catch (error) { next(error); }
};

const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ mensaje: 'El ID de la tarea no es válido' });
        const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
        if (!task) return res.status(404).json({ mensaje: 'Tarea no encontrada' });
        res.status(200).json({ mensaje: 'Tarea eliminada correctamente' });
    } catch (error) { next(error); }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
