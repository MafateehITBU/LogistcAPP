const express = require('express');
const router = express.Router();
const {
    addAdmin,
    loginAdmin,
    getAdmins,
    getSingleAdmin,
    changeAdminRole,
    deleteAdmin
} = require('../controllers/adminController');
const adminAuth = require('../middlewares/adminAuthMiddleware');
const adminRoleMiddleware = require('../middlewares/adminRoleMiddleware'); 

router.post('/addAdmin', adminAuth, adminRoleMiddleware("Admin"), addAdmin)
router.post('/login' , loginAdmin);
router.get('/', adminAuth, adminRoleMiddleware("Admin"), getAdmins);
router.get('/singleAdmin', adminAuth, getSingleAdmin);
router.put('/:id', adminAuth, adminRoleMiddleware("Admin"), changeAdminRole);
router.delete('/:id', adminAuth, adminRoleMiddleware("Admin"), deleteAdmin);

module.exports = router;