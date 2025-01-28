import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const Normal = () => {
    const [users, setUsers] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [selectedImage, setSelectedImage] = useState(null); // To store the clicked image
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get("/user");
            setUsers(response.data);
            setUsers((prevUsers) => prevUsers.filter((user) => user.role === "normal"));
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

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedImage(null);
        setIsModalOpen(false);
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
                        onClick={() => handleImageClick(row.profilePicture)} // Handle click to enlarge image
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
            sortable: true,
        },
        {
            name: "Phone",
            selector: (row) => row.phone,
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
            name: "Action",
            cell: (row) => (
                <div className="form-button-action">
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
                            <h1>Normal User Details</h1>
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
            {/* Modal for displaying enlarged image */}
            {isModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10000,
                    }}
                    onClick={closeModal} // Close modal on outside click
                >
                    <img
                        src={selectedImage}
                        alt="Enlarged file"
                        style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "10px" }}
                    />
                </div>
            )}
        </div>
    );
};

export default Normal;
