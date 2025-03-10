import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const Wallet = () => {
    const [wallets, setWallets] = useState([]);
    const [companyWallet, setCompanyWallet] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filterType, setFilterType] = useState("Balance");

    useEffect(() => {
        fetchWallets();
        fetchCompanyWallet();
    }, []);

    const fetchWallets = async () => {
        try {
            const response = await axiosInstance.get("/wallet");
            setWallets(response.data);
        } catch (error) {
            console.error("Error fetching wallets:", error);
        }
    };

    const fetchCompanyWallet = async () => {
        try {
            const response = await axiosInstance.get("/wallet/company");
            setCompanyWallet(response.data);
        } catch (error) {
            console.error("Error fetching company wallet:", error);
        }
    };

    const handleViewTransactions = (wallet) => {
        let creditTransactions = [];
        let debitTransactions = [];

        if (wallet.transactions?.credit) {
            creditTransactions.push({ ...wallet.transactions.credit, type: "Credit" });
            if (wallet.transactions.credit.transactionHistory) {
                creditTransactions.push(...wallet.transactions.credit.transactionHistory.map(t => ({ ...t, type: "Credit" })));
            }
        }

        if (wallet.transactions?.debit) {
            debitTransactions.push({ ...wallet.transactions.debit, type: "Debit" });
            if (wallet.transactions.debit.transactionHistory) {
                debitTransactions.push(...wallet.transactions.debit.transactionHistory.map(t => ({ ...t, type: "Debit" })));
            }
        }

        // Set transactions based on selected filter type
        if (filterType === "Credits") {
            setTransactions(debitTransactions); // Show only Debit transactions when filtering for Credits
        } else if (filterType === "Debits") {
            setTransactions(creditTransactions); // Show only Credit transactions when filtering for Debits
        } else {
            setTransactions([...creditTransactions, ...debitTransactions]); // Default view shows all transactions
        }

        setSelectedWallet(wallet);
        const modal = new window.bootstrap.Modal(document.getElementById("transactionsModal"));
        modal.show();
    };

    const handleUpdatePaidStatus = async (transaction, mainTransactionId) => {
        try {
            const newPaidStatus = !transaction.paid; // Toggle status
            let url = "";

            if (mainTransactionId !== transaction._id) {
                // This is a history transaction, update via its main transaction
                url = `/wallet/${mainTransactionId}/history/${transaction._id}`;
            } else {
                // This is a main transaction
                url = `/wallet/${transaction._id}`;
            }

            // Send request to update
            await axiosInstance.put(url, { paid: newPaidStatus });

            // Update local state
            setTransactions(prevTransactions =>
                prevTransactions.map(tx =>
                    tx._id === transaction._id ? { ...tx, paid: newPaidStatus } : tx
                )
            );

            fetchWallets();
            fetchCompanyWallet();
            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "Transaction status has been updated.",
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        } catch (error) {
            console.error("Error updating transaction:", error);
            Swal.fire("Error", "Failed to update transaction status.", "error");
        }
    };

    const filteredWallets = wallets.filter(wallet => {
        if (filterType === "Credits") {
            return wallet.transactions?.debit;
        } else if (filterType === "Debits") {
            return wallet.transactions?.credit;
        }
        return true;
    });

    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div className="page-inner">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h1>Wallet Details</h1>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                                style={{ width: "300px" }}
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                        <div className="d-flex justify-content-around" style={{ borderBottom: '1px solid #ebecec' }}>
                            <div className="wallet-section p-3" onClick={() => setFilterType("Balance")}>
                                <button className={`button button-1 ${filterType === "Balance" ? "active-btn" : ""}`}>
                                    <b> Balance: </b>{companyWallet?.balance} JD
                                </button>
                            </div>
                            <div className="wallet-section p-3" onClick={() => setFilterType("Credits")}>
                                <button className={`button button-2 ${filterType === "Credits" ? "active-btn" : ""}`}><b> Credits: </b>{companyWallet?.totalCredits} JD</button>
                            </div>
                            <div className="wallet-section p-3" onClick={() => setFilterType("Debits")}>
                                <button className={`button button-3 ${filterType === "Debits" ? "active-btn" : ""}`}><b> Debits: </b>{companyWallet?.totalDebits} JD</button>
                            </div>
                        </div>
                        <div className="card-body">
                            <DataTable
                                columns={[
                                    { name: "Name", selector: row => row.assignedTo.name, sortable: true },
                                    { name: "Role", selector: row => row.assignedTo.model, sortable: true },
                                    { name: "Balance", selector: row => row.balance + " JD", sortable: true },
                                    {
                                        name: "Transactions",
                                        cell: (row) => (
                                            <button className="btn btn-primary btn-sm" onClick={() => handleViewTransactions(row)}>
                                                View
                                            </button>
                                        ),
                                    },
                                ]}
                                data={filteredWallets}
                                pagination
                                responsive
                                highlightOnHover
                                striped
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Modal */}
            <div className="modal fade" id="transactionsModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Transactions for {selectedWallet?.assignedTo?.name}</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Paid</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx, index) => (
                                        <tr key={index}>
                                            <td>{tx.type}</td>
                                            <td>{tx.amount}</td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={tx.paid}
                                                    onChange={() => {
                                                        // Find the main transaction ID if this is a history transaction
                                                        const mainTransaction = transactions.find(t =>
                                                            t.transactionHistory?.some(h => h._id === tx._id)
                                                        );

                                                        const mainTransactionId = mainTransaction ? mainTransaction._id : tx._id;

                                                        handleUpdatePaidStatus(tx, mainTransactionId);
                                                    }
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;