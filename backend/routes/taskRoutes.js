const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validateTask = require('../middleware/validateTask');
const { createTask, getTasks, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');

router.use(auth);
router.get('/', getTasks);
router.post('/', validateTask, createTask);
router.get('/:id', getTaskById);
router.put('/:id', validateTask, updateTask);
router.delete('/:id', deleteTask);
module.exports = router;
