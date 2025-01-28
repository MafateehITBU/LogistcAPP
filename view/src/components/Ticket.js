import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const Ticket = () => {
    const [tickets, setTickets] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); // To store the clicked image
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await axiosInstance.get("/ticket");
            setTickets(response.data);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this ticket?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`/ticket/${id}`);
                    Swal.fire("Deleted!", "The ticket has been deleted.", "success");
                    // Update the state to remove the deleted user
                    setTickets((prevTickets) => prevTickets.filter((ticket) => ticket._id !== id));
                } catch (error) {
                    console.error("Error deleting ticket:", error);
                }
            }
        });
    };


    const handleEdit = (ticket) => {
        setSelectedTicket(ticket);
        const modal = new window.bootstrap.Modal(document.getElementById("editTicketModal"));
        modal.show();
    };

    const handleUpdate = async () => {
        try {
            const response = await axiosInstance.put(`/ticket/${selectedTicket._id}`, selectedTicket);
            Swal.fire("Updated!", "The ticket has been updated successfully.", "success");

            // Update the state with the edited user details
            setTickets((prevTickets) =>
                prevTickets.map((ticket) =>
                    ticket._id === selectedTicket._id ? { ...response.data } : ticket
                )
            );

            const modal = window.bootstrap.Modal.getInstance(document.getElementById("editTicketModal"));
            modal.hide();
            fetchTickets();
        } catch (error) {
            console.error("Error updating ticket:", error);
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
            name: "Name",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Role",
            selector: (row) => row.role,
            sortable: true,
        },
        {
            name: "Title",
            selector: (row) => row.title,
            sortable: true,
        },
        {
            name: "Description",
            selector: (row) => row.description,
            sortable: true,
        },
        {
            name: "File",
            selector: (row) =>
                row.file ? (
                    <img
                        src={row.file}
                        alt="user file"
                        style={{ width: "50px", height: "50px", borderRadius: "5px", cursor: "pointer" }}
                        onClick={() => handleImageClick(row.file)} // Handle click to enlarge image
                    />
                ) : (
                    "No file attached"
                ),
        },
        {
            name: "Reply",
            selector: (row) => (row.reply ? row.reply : "Didn't reply!"),
            sortable: true,
        },
        {
            name: "Status",
            selector: (row) => {
                switch (row.status) {
                    case "open":
                        return <div style={{ backgroundColor: "#28a745", padding: "10px", borderRadius: "5px", color:"#fff" }}>Open</div>;
                    case "in_progress":
                        return <div style={{ backgroundColor: "#ffc107", padding: "10px", borderRadius: "5px", color:"#fff" }}>In Progress</div>;
                    case "closed":
                        return <div style={{ backgroundColor: "#6c757d", padding: "10px", borderRadius: "5px", color:"#fff" }}>Closed</div>;
                }
            },
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

    const filteredTickets = tickets.filter((ticket) => {
        return (
            ticket.name?.toLowerCase().includes(filterText.toLowerCase()) ||
            ticket.role?.toLowerCase().includes(filterText.toLowerCase()) ||
            ticket.title?.toLowerCase().includes(filterText.toLowerCase()) ||
            ticket.description?.toLowerCase().includes(filterText.toLowerCase()) ||
            ticket.status?.toLowerCase().includes(filterText.toLowerCase()) 
        );
    });


    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div className="page-inner">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h1>Ticket Details</h1>
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
                                data={filteredTickets}
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
                id="editTicketModal"
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
                                    <label>Title</label>
                                    <input
                                        id="Name"
                                        type="text"
                                        class="form-control"
                                        placeholder="Fill Reply"
                                        value={selectedTicket?.title || ""}
                                        disabled
                                        style={{ backgroundColor: 'white' }}
                                    />
                                </div>
                                <div class="form-group form-group-default">
                                    <label>Description</label>
                                    <input
                                        id="Name"
                                        type="text"
                                        class="form-control"
                                        placeholder="Fill Reply"
                                        value={selectedTicket?.description || ""}
                                        disabled
                                        style={{ backgroundColor: 'white' }}
                                    />
                                </div>
                                {/* <div class="form-group form-group-default">
                                    <label>File</label>
                                </div> */}
                                <div class="form-group form-group-default">
                                    <label>File</label>
                                    <img src={selectedTicket?.file} alt="no file attached" height={'300px'} width={'450px'} className="my-3" />
                                </div>

                                <div class="form-group form-group-default">
                                    <label>Reply</label>
                                    <input
                                        id="Name"
                                        type="text"
                                        class="form-control"
                                        placeholder="Fill Reply"
                                        value={selectedTicket?.reply || ""}
                                        onChange={(e) =>
                                            setSelectedTicket({ ...selectedTicket, reply: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="col-sm-12">
                                    <div className="form-group form-group-default">
                                        <label>Ticket Status</label>
                                        <select
                                            className="form-select"
                                            value={selectedTicket?.status || ""}
                                            onChange={(e) =>
                                                setSelectedTicket({ ...selectedTicket, status: e.target.value })
                                            }
                                        >
                                            <option value="opened">Opened</option>
                                            <option value="in_progress">In progress</option>
                                            <option value="closed">Closed</option>
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

export default Ticket;
