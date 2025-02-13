import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const Admin = () => {
    const [admins, setAdmins] = useState([]);
    const [newAdmin, setNewAdmin] = useState({});
    const [filterText, setFilterText] = useState("");

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await axiosInstance.get("/admin");
            setAdmins(response.data);
        } catch (error) {
            console.error("Error fetching admins:", error);
        }
    };

    const handleAddAdmin = async () => {
        try {
            const response = await axiosInstance.post("/admin/addAdmin", newAdmin);

            if (response.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Admin added successfully.",
                    toast: true,
                    position: "bottom-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });

                // Refresh the admin list
                fetchAdmins();

                // Reset the form fields
                setNewAdmin({
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    role: "",
                });

                // Close the modal
                const modalElement = document.getElementById("addRowModal");
                const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
            }
        } catch (error) {
            Swal.fire("Error!", "Failed to add Admin.", "error");
            console.error("Error adding admin:", error);
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this admin?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`/admin/${id}`);
                    Swal.fire("Deleted!", "The admin has been deleted.", "success");
                    // Update the state to remove the deleted admin
                    setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin._id !== id));
                } catch (error) {
                    console.error("Error deleting admin:", error);
                }
            }
        });
    };

    const handleUpdateRole = async (adminId, role) => {
        await axiosInstance.put(`/admin/${adminId}`, {
            role: role,
        });
        fetchAdmins();
        Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Role updated successfully.",
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    };

    const columns = [
        {
            name: "Name",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Email",
            selector: (row) => row.email,
        },
        {
            name: "Phone",
            selector: (row) => row.phone,
        },
        {
            name: "Role",
            cell: (row) => {
                return (
                    <Dropdown>
                        <Dropdown.Toggle variant="light" className="p-0">
                            <span className="badge bg-success"> {row.role} </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {["Admin", "Accountant", "Dispatcher", "HR", "StoreKeeper", "SupportTeam"].map((role) => (
                                <Dropdown.Item
                                    key={role}
                                    onClick={() => handleUpdateRole(row._id, role)}
                                >
                                    {role}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                );
            },
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="form-button-action">
                    <button
                        type="button"
                        className="btn btn-link btn-danger"
                        title="Remove"
                        onClick={() => handleDelete(row._id)}
                    >
                        <i className="fa fa-times"></i>
                    </button>
                </div>
            ),
        },
    ];

    const filteredAdmins = admins.filter((admin) => {
        return (
            admin.name?.toLowerCase().includes(filterText.toLowerCase()) ||
            admin.email?.toLowerCase().includes(filterText.toLowerCase()) ||
            admin.phone?.toLowerCase().includes(filterText.toLowerCase()) ||
            admin.role?.toLowerCase().includes(filterText.toLowerCase())
        );
    });


    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div className="page-inner">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h1>Admins Details</h1>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                                style={{ width: "300px" }}
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />

                            <button
                                className="btn btn-primary btn-round"
                                data-bs-toggle="modal"
                                data-bs-target="#addRowModal"
                            >
                                <i className="fa fa-plus"></i> Add Row
                            </button>
                        </div>
                        <div className="card-body">
                            <DataTable
                                columns={columns}
                                data={filteredAdmins}
                                pagination
                                responsive
                                highlightOnHover
                                striped
                                customStyles={{
                                    headCells: {
                                        style: {
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                        },
                                    },
                                }}
                            />

                            {/*Add New Admin Modal Content */}
                            <div
                                className="modal fade"
                                id="addRowModal"
                                tabIndex="-1"
                                role="dialog"
                                aria-hidden="true"
                            >
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header border-0">
                                            <h5 className="modal-title">
                                                <span className="fw-mediumbold">New</span>
                                                <span className="fw-light"> Admin</span>
                                            </h5>
                                            <button
                                                type="button"
                                                className="close"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                            >
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            <p className="small">
                                                Create a new row using this form. Make sure you fill out all fields.
                                            </p>
                                            <form>
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <div className="form-group form-group-default">
                                                            <label>Name</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter admin name"
                                                                value={newAdmin.name}
                                                                onChange={(e) =>
                                                                    setNewAdmin({ ...newAdmin, name: e.target.value })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div className="form-group form-group-default">
                                                            <label>Email</label>
                                                            <input
                                                                type="email"
                                                                className="form-control"
                                                                placeholder="Enter Email"
                                                                value={newAdmin.email}
                                                                onChange={(e) =>
                                                                    setNewAdmin({ ...newAdmin, email: e.target.value })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div className="form-group form-group-default">
                                                            <label>Password</label>
                                                            <input
                                                                type="password"
                                                                className="form-control"
                                                                placeholder="Enter password"
                                                                value={newAdmin.password}
                                                                onChange={(e) =>
                                                                    setNewAdmin({ ...newAdmin, password: e.target.value })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div className="form-group form-group-default">
                                                            <label>Phone</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter phone number"
                                                                value={newAdmin.phone}
                                                                onChange={(e) =>
                                                                    setNewAdmin({ ...newAdmin, phone: e.target.value })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div className="form-group form-group-default">
                                                            <label>Role</label>
                                                            <select
                                                                className="form-select"
                                                                value={newAdmin.role}
                                                                onChange={(e) =>
                                                                    setNewAdmin({ ...newAdmin, role: e.target.value })
                                                                }
                                                            >
                                                                <option value="Admin">Admin</option>
                                                                <option value="Accountant">Accountant</option>
                                                                <option value="Dispatcher">Dispatcher</option>
                                                                <option value="HR">HR</option>
                                                                <option value="StoreKeeper">Store Keeper</option>
                                                                <option value="SupportTeam">Support Team</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="modal-footer border-0">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={handleAddAdmin}
                                            >
                                                Add
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                data-bs-dismiss="modal"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
