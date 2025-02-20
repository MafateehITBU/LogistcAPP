const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const adminAuth = require('../middlewares/adminAuthMiddleware');
const adminRoleMiddleware = require('../middlewares/adminRoleMiddleware'); 

// Get all salaries
router.get('/', adminAuth, adminRoleMiddleware('Admin', 'HR', 'Accountant'), salaryController.getAllSalaries);

// Update salary
router.put('/:id', adminAuth, adminRoleMiddleware('Admin', 'HR'), salaryController.updateSalary);

module.exports = router;