import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const User = () => {
    const [users, setUsers] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get("/user");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this user?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`/user/${id}`);
                    Swal.fire("Deleted!", "The user has been deleted.", "success");
                    // Update the state to remove the deleted user
                    setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
                } catch (error) {
                    console.error("Error deleting user:", error);
                }
            }
        });
    };


    const handleEdit = (user) => {
        setSelectedUser(user);
        const modal = new window.bootstrap.Modal(document.getElementById("editUserModal"));
        modal.show();
    };

    const handleUpdate = async () => {
        try {
            const response = await axiosInstance.put(`/user/${selectedUser._id}`, selectedUser);
            Swal.fire("Updated!", "The user has been updated successfully.", "success");

            // Update the state with the edited user details
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user._id === selectedUser._id ? { ...response.data } : user
                )
            );

            const modal = window.bootstrap.Modal.getInstance(document.getElementById("editUserModal"));
            modal.hide();
            fetchUsers();
        } catch (error) {
            console.error("Error updating user:", error);
        }
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
            sortable: true,
        },
        {
            name: "Phone",
            selector: (row) => row.phone,
            sortable: true,
        },
        {
            name: "Orders",
            selector: (row) => row.orders,
            sortable: true,
        },
        {
            name: "Points",
            selector: (row) => row.points,
            sortable: true,
        },
        {
            name: "Wallet No",
            selector: (row) => row.walletNo,
            sortable: true,
        },
        {
            name: "Age",
            selector: (row) => row.age,
            sortable: true,
        },
        {
            name: "Gender",
            selector: (row) => row.gender,
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="form-button-action">
                    <button
                        type="button"
                        className="btn btn-link btn-primary btn-lg"
                        title="Edit User"
                        onClick={() => handleEdit(row)}
                    >
                        <i className="fa fa-edit"></i>
                    </button>
                    <button
                        type="button"
                        className="btn btn-link btn-danger"
                        title="Delete User"
                        onClick={() => handleDelete(row._id)}
                    >
                        <i className="fa fa-times"></i>
                    </button>
                </div>
            ),
        },
    ];

    const filteredUsers = users.filter((user) => {
        return (
            user.name?.toLowerCase().includes(filterText.toLowerCase()) ||
            user.email?.toLowerCase().includes(filterText.toLowerCase()) ||
            user.phone?.toLowerCase().includes(filterText.toLowerCase())
        );
    });


    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div className="page-inner">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h1>User Details</h1>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search..."
                                style={{ width: "300px" }}
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                            />
                        </div>
                        <div className="card-body">
                            <DataTable
                                columns={columns}
                                data={filteredUsers}
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit User Modal */}
            <div
                className="modal fade"
                id="editUserModal"
                tabIndex="-1"
                role="dialog"
                aria-hidden="true"
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0">
                            <h5 className="modal-title">Edit User</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={selectedUser?.name || ""}
                                        onChange={(e) =>
                                            setSelectedUser({ ...selectedUser, name: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={selectedUser?.email || ""}
                                        onChange={(e) =>
                                            setSelectedUser({ ...selectedUser, email: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={selectedUser?.phone || ""}
                                        onChange={(e) =>
                                            setSelectedUser({ ...selectedUser, phone: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        className="form-select"
                                        value={selectedUser?.gender || ""}
                                        onChange={(e) =>
                                            setSelectedUser({ ...selectedUser, gender: e.target.value })
                                        }
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={selectedUser?.age || ""}
                                        onChange={(e) =>
                                            setSelectedUser({ ...selectedUser, age: e.target.value })
                                        }
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer border-0">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleUpdate}
                            >
                                Save Changes
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
    );
};

export default User;
