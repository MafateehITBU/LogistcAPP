import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const Admin = () => {
    const [admins, setAdmins] = useState([]);
    const [newAdmin, setNewAdmin] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "",
        profilePicture: null,
        salary:""
    });
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
            const formData = new FormData();
            formData.append("name", newAdmin.name);
            formData.append("email", newAdmin.email);
            formData.append("password", newAdmin.password);
            formData.append("phone", newAdmin.phone);
            formData.append("role", newAdmin.role);
            if (newAdmin.profilePicture) {
                formData.append("profilePic", newAdmin.profilePicture);
            }

            const response = await axiosInstance.post("/admin/addAdmin", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

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

                fetchAdmins();
                setNewAdmin({
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    role: "",
                    profilePicture: null,
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
            name: "Image",
            selector: (row) =>
                row.profilePicture ? (
                    <img
                        src={row.profilePicture}
                        alt="user profilePicture"
                        style={{ width: "50px", height: "50px", borderRadius: "5px", cursor: "pointer" }}
                    />
                ) : (
                    "No profilePicture attached"
                ),
        },
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
                                <i className="fa fa-plus"></i> Add Admin
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
                            <div className="modal fade" id="addRowModal" tabIndex="-1" role="dialog">
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">New Admin</h5>
                                            <button type="button" className="close" data-bs-dismiss="modal">
                                                <span>&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            <form>
                                                <input type="text" className="form-control mb-2" placeholder="Name" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} />
                                                <input type="email" className="form-control mb-2" placeholder="Email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} />
                                                <input type="password" className="form-control mb-2" placeholder="Password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} />
                                                <input type="text" className="form-control mb-2" placeholder="Phone" value={newAdmin.phone} onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })} />
                                                <input type="file" className="form-control mb-2" accept="image/*" onChange={(e) => setNewAdmin({ ...newAdmin, profilePicture: e.target.files[0] })} />
                                                <select
                                                    className="form-select mb-2"
                                                    value={newAdmin.role}
                                                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                                >
                                                    <option value="">Select Role</option>
                                                    <option value="Admin">Admin</option>
                                                    <option value="Accountant">Accountant</option>
                                                    <option value="Dispatcher">Dispatcher</option>
                                                    <option value="HR">HR</option>
                                                    <option value="StoreKeeper">Store Keeper</option>
                                                    <option value="SupportTeam">Support Team</option>
                                                </select>
                                                <input type="text" className="form-control mb-2" placeholder="Salary" value={newAdmin.salary} onChange={(e) => setNewAdmin({ ...newAdmin, salary: e.target.value })} />
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-primary" onClick={handleAddAdmin}>Add</button>
                                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
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
