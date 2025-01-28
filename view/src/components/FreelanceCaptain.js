import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const FreelanceCaptain = () => {
    const [captains, setCaptains] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [selectedCaptain, setSelectedCaptain] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); // To store the clicked image
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchCaptains();
    }, []);

    const fetchCaptains = async () => {
        try {
            const response = await axiosInstance.get("/freelanceCaptain");
            setCaptains(response.data);
        } catch (error) {
            console.error("Error fetching captains:", error);
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this captain?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`/freelanceCaptain/${id}`);
                    Swal.fire("Deleted!", "The captain has been deleted.", "success");
                    // Update the state to remove the deleted captain
                    setCaptains((prevCaptains) => prevCaptains.filter((captain) => captain._id !== id));
                } catch (error) {
                    console.error("Error deleting captain:", error);
                }
            }
        });
    };


    const handleEdit = (captain) => {
        setSelectedCaptain(captain);
        const modal = new window.bootstrap.Modal(document.getElementById("editCaptainModal"));
        modal.show();
    };

    const handleUpdate = async () => {
        try {
            const response = await axiosInstance.put(`/freelanceCaptain/${selectedCaptain._id}`, selectedCaptain);
            Swal.fire("Updated!", "The captain has been updated successfully.", "success");

            // Update the state with the edited user details
            setCaptains((prevCaptains) =>
                prevCaptains.map((captain) =>
                    captain._id === selectedCaptain._id ? { ...response.data } : captain
                )
            );

            const modal = window.bootstrap.Modal.getInstance(document.getElementById("editCaptainModal"));
            modal.hide();
            fetchCaptains();
        } catch (error) {
            console.error("Error updating captain:", error);
        }
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
        },
        {
            name: "Phone",
            selector: (row) => row.phone,
        },
        {
            name: "Wallet No.",
            selector: (row) => row.walletNo,
        },
        {
            name: "Rating",
            selector: (row) => (
                <div>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <i
                            key={index}
                            className={
                                index < Math.floor(row.rating)
                                    ? "fa fa-star"
                                    : index < row.rating
                                        ? "fa fa-star-half-alt"
                                        : "fa fa-star-o"
                            }
                            style={{ color: "#FFD700", marginRight: "2px" }}
                        />
                    ))}
                </div>
            ),
        },
        {
            name: "Points",
            selector: (row) => row.points,
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="form-button-action">
                    <button
                        type="button"
                        className="btn btn-link btn-primary btn-lg"
                        title="Edit Task"
                        onClick={() => handleEdit(row)}

                    >
                        <i className="fa fa-edit"></i>
                    </button>
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

    const filteredCaptains = captains.filter((captain) => {
        return (
            captain.name?.toLowerCase().includes(filterText.toLowerCase()) ||
            captain.email?.toLowerCase().includes(filterText.toLowerCase()) ||
            captain.phone?.toLowerCase().includes(filterText.toLowerCase()) ||
            captain.contractType?.toLowerCase().includes(filterText.toLowerCase()) ||
            captain.role?.toLowerCase().includes(filterText.toLowerCase()) ||
            captain.walletNo?.toLowerCase().includes(filterText.toLowerCase()) 
        );
    });


    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div className="page-inner">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h1>Freelance Captain Details</h1>
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
                                data={filteredCaptains}
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

            {/* Edit Ticket Modal */}
            <div
                className="modal fade"
                id="editCaptainModal"
                tabIndex="-1"
                role="dialog"
                aria-hidden="true"
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0">
                            <h5 className="modal-title">Update Ticket</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <div class="form-group form-group-default">
                                    <label>Name</label>
                                    <input
                                        id="Name"
                                        type="text"
                                        class="form-control"
                                        placeholder="Fill Reply"
                                        value={selectedCaptain?.name || ""}
                                        disabled
                                        style={{ backgroundColor: 'white' }}
                                    />
                                </div>
                                <div class="form-group form-group-default">
                                    <label>Rating</label>
                                    <input
                                        id="Name"
                                        type="number"
                                        class="form-control"
                                        placeholder="Fill Reply"
                                        value={selectedCaptain?.rating || ""}
                                        onChange={(e) =>
                                            setSelectedCaptain({ ...selectedCaptain, rating: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="col-sm-12">
                                    <div className="form-group form-group-default">
                                        <label>Role</label>
                                        <select
                                            className="form-select"
                                            value={selectedCaptain?.role || ""}
                                            onChange={(e) =>
                                                setSelectedCaptain({ ...selectedCaptain, role: e.target.value })
                                            }
                                        >
                                            <option value="delivery">Delivery</option>
                                            <option value="procurement">Procurement</option>
                                        </select>
                                    </div>
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

export default FreelanceCaptain;
