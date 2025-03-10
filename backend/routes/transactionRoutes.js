const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const adminAuth = require('../middlewares/adminAuthMiddleware');
const adminRoleMiddleware = require('../middlewares/adminRoleMiddleware');

// Get all wallets 
router.get('/', adminAuth, adminRoleMiddleware ('Admin', 'Accountant'), transactionController.getAllWallets);

// Get a single wallet transaction
router.get('/:walletId/transactions', transactionController.getWalletTransactions);

// Get company wallet
router.get('/company', adminAuth, adminRoleMiddleware('Admin', 'Accountant'), transactionController.getCompanyWallet);

// Update specific history entry paid status
router.put('/:transactionId/history/:historyId', adminAuth, adminRoleMiddleware ('Admin', 'Accountant'), transactionController.updateTransactionPaidStatus);
router.put('/:transactionId', adminAuth, adminRoleMiddleware('Admin', 'Accountant'), transactionController.updateTransactionPaidStatus);

module.exports = router;