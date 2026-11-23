const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorizeRoles');
const { listUsers } = require('../controllers/adminController');
router.get('/users', auth, authorizeRoles('admin'), listUsers);
module.exports = router;
