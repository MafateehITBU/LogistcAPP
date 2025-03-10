const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const FulltimeCaptain = require('../models/FulltimeCaptain');
const FreelanceCaptain = require('../models/FreelanceCaptain');
const asyncHandler = require('express-async-handler');

const updateWalletBalance = async (walletId) => {
    try {
        // Fetch all transactions for the given wallet
        const transactions = await Transaction.find({ walletId });

        let totalCredit = 0;
        let totalDebit = 0;

        transactions.forEach(txn => {
            if (txn.type === "credit") {
                if (!txn.paid) {
                    totalCredit += txn.amount;
                }
                txn.transactionHistory.forEach(history => {
                    if (!history.paid) {
                        totalCredit += history.amount;
                    }
                });
            } else if (txn.type === "debit") {
                if (!txn.paid) {
                    totalDebit += txn.amount;
                }
                txn.transactionHistory.forEach(history => {
                    if (!history.paid) {
                        totalDebit += history.amount;
                    }
                });
            }
        });

        // Calculate the new balance
        const newBalance = totalCredit - totalDebit;

        // Update the wallet balance in the database
        await Wallet.findByIdAndUpdate(walletId, { balance: newBalance });

        console.log(`Wallet ${walletId} balance updated: ${newBalance}`);
    } catch (error) {
        console.error("Error updating wallet balance:", error.message);
    }
};

// Helper: Create a new transaction
const createTransaction = async (type, amount, walletId) => {
    try {
        const newTransaction = new Transaction({
            walletId,
            amount,
            type,
            transactionHistory: [] // Empty history initially
        });

        await newTransaction.save();
    } catch (err) {
        console.error("Error creating transaction:", err.message);
    }
};

// Get all Wallets with their transactions
exports.getAllWallets = asyncHandler(async (req, res) => {
    try {
        const companyWalletId = req.admin.walletNo; // Get admin's wallet ID

        // Get all wallets except the company (admin) wallet
        const wallets = await Wallet.find({ _id: { $ne: companyWalletId } }).lean();
        const walletIds = wallets.map(wallet => wallet._id);

        // Find Captains and users linked to these wallets
        const fulltimeCaptains = await FulltimeCaptain.find({ walletNo: { $in: walletIds } })
            .select('name walletNo')
            .lean();

        const freelanceCaptains = await FreelanceCaptain.find({ walletNo: { $in: walletIds } })
            .select('name walletNo')
            .lean();

        const users = await User.find({ walletNo: { $in: walletIds } })
            .select('name walletNo')
            .lean();

        // Fetch transactions for all wallets
        const transactions = await Transaction.find({ walletId: { $in: walletIds } }).lean();

        // Map wallets to captains/users & transactions
        const walletsWithDetails = wallets.map(wallet => {
            const fulltimeCaptain = fulltimeCaptains.find(fc => fc.walletNo?.toString() === wallet._id.toString());
            const freelanceCaptain = freelanceCaptains.find(fc => fc.walletNo?.toString() === wallet._id.toString());
            const user = users.find(u => u.walletNo?.toString() === wallet._id.toString());

            // Find transactions for the wallet
            const creditTransaction = transactions.find(txn => txn.walletId.toString() === wallet._id.toString() && txn.type === 'credit');
            const debitTransaction = transactions.find(txn => txn.walletId.toString() === wallet._id.toString() && txn.type === 'debit');

            return {
                ...wallet,
                assignedTo: {
                    name: freelanceCaptain?.name || fulltimeCaptain?.name || user?.name || 'Unknown',
                    model: freelanceCaptain ? 'FreelanceCaptain' :
                        fulltimeCaptain ? 'FulltimeCaptain' :
                            user ? 'User' : 'Unknown'
                },
                transactions: {
                    credit: creditTransaction || null,
                    debit: debitTransaction || null
                }
            };
        });

        res.status(200).json(walletsWithDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all transactions for a wallet (credit and debit)
exports.getWalletTransactions = asyncHandler(async (req, res) => {
    try {
        const { walletId } = req.params;

        const creditTransaction = await Transaction.findOne({ walletId, type: 'credit' });
        const debitTransaction = await Transaction.findOne({ walletId, type: 'debit' });

        // If both don't exist, return an error
        if (!creditTransaction && !debitTransaction) {
            return res.status(404).json({ message: "No transactions found for this wallet" });
        }

        res.json({ creditTransaction, debitTransaction });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

exports.getCompanyWallet = asyncHandler(async (req, res) => {
    try {
        const companyWalletId = req.admin.walletNo; // Get company wallet ID from admin
        if (!companyWalletId) {
            return res.status(400).json({ message: "Company wallet not found" });
        }

        // Fetch company wallet details
        let companyWallet = await Wallet.findById(companyWalletId);
        if (!companyWallet) {
            return res.status(404).json({ message: "Company wallet not found" });
        }

        // Get all users and captains' wallets (excluding company wallet)
        const wallets = await Wallet.find({ _id: { $ne: companyWalletId } }).lean();
        const walletIds = wallets.map(wallet => wallet._id);

        // Find all transactions of captains and users (excluding company wallet transactions)
        const transactions = await Transaction.find({
            walletId: { $in: walletIds, $ne: companyWalletId }
        }).lean();

        let totalCompanyDebits = 0;
        let totalCompanyCredits = 0;

        transactions.forEach(txn => {
            if (txn.type === 'credit') {
                if (!txn.paid) totalCompanyDebits += txn.amount;
                txn.transactionHistory.forEach(history => {
                    if (!history.paid) {
                        totalCompanyDebits += history.amount;
                    }
                });
            } else if (txn.type === 'debit') {
                if (!txn.paid) totalCompanyCredits += txn.amount;
                txn.transactionHistory.forEach(history => {
                    if (!history.paid) {
                        totalCompanyCredits += history.amount;
                    }
                });
            }
        });

        // Get company transactions
        const companyTransactions = await Transaction.find({ walletId: companyWalletId });

        if (companyTransactions.length === 0) {
            await createTransaction("credit", totalCompanyCredits, companyWalletId);
            await createTransaction("debit", totalCompanyDebits, companyWalletId);
        }

        // Calculate Balance
        const calculatedBalance = totalCompanyCredits - totalCompanyDebits;

        // Update balance in the database
        companyWallet.balance = calculatedBalance;
        await companyWallet.save();

        res.status(200).json({
            companyWalletId,
            balance: calculatedBalance,
            totalDebits: totalCompanyDebits,
            totalCredits: totalCompanyCredits,
            transactions: companyTransactions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update paid status of a transaction or a transaction history entry
exports.updateTransactionPaidStatus = asyncHandler(async (req, res) => {
    try {
        const { transactionId, historyId } = req.params;
        const { paid } = req.body;

        console.log("TransactionId: ", transactionId, " ,HistoryId: ", historyId);

        // Find the transaction (either debit or credit)
        let transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Check if historyId is provided
        if (historyId) {
            const historyEntry = transaction.transactionHistory.id(historyId);
            if (!historyEntry) {
                return res.status(404).json({ message: "Transaction history entry not found" });
            }
            historyEntry.paid = paid;
        } else {
            // Directly update the main transaction's paid status
            transaction.paid = paid;
        }

        await transaction.save();

        // Call helper function to update the wallet balance
        await updateWalletBalance(transaction.walletId);

        res.status(200).json({ message: "Transaction updated successfully", transaction });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
