const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const userOrCaptainAuth = require('../middlewares/userOrCaptainAuthMiddleware');
const adminAuth = require('../middlewares/adminAuthMiddleware');
const adminRoleMiddleware = require('../middlewares/adminRoleMiddleware'); 

// Create Ticket
router.post('/create', userOrCaptainAuth, ticketController.createTicket);

// Get all tickets
router.get('/', adminAuth, adminRoleMiddleware('Admin', 'SupportTeam'), ticketController.getAllTickets);

// Get all users tickets
router.get('/user', userOrCaptainAuth, ticketController.getUserTickets);

// Get a ticket by Id
router.get('/:id', ticketController.getTicket);

// Update ticket by ID
router.put('/:id', adminAuth, adminRoleMiddleware('Admin', 'SupportTeam'), ticketController.updateTicket);

// Delete a ticket
router.delete('/:id', adminAuth, adminRoleMiddleware('Admin', 'SupportTeam'), ticketController.deleteTicket);

module.exports = router;
