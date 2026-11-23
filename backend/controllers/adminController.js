const User = require('../models/User');

const listUsers = async (req, res, next) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
        const [users, total] = await Promise.all([
            User.find().select('name email role createdAt').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            User.countDocuments()
        ]);
        res.json({ total, usuarios: users, pagination: { page, limit, totalPages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
};
module.exports = { listUsers };
