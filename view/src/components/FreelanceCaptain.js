import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const FreelanceCaptain = () => {
    const [captains, setCaptains] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [selectedImages, setSelectedImages] = useState([]); // Store multiple images
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cars, setCars] = useState([]);

    useEffect(() => {
        fetchCaptains();
        fetchCars();
    }, []);

    const fetchCaptains = async () => {
        try {
            const response = await axiosInstance.get("/freelanceCaptain");
            setCaptains(response.data);
        } catch (error) {
            console.error("Error fetching captains:", error);
        }
    };

    const fetchCars = async () => {
        try {
            const response = await axiosInstance.get("/car");
            setCars(response.data);
        } catch (error) {
            console.error("Error fetching cars:", error);
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
                    setCaptains((prev) => prev.filter((captain) => captain._id !== id));
                } catch (error) {
                    console.error("Error deleting captain:", error);
                }
            }
        });
    };

    const handleViewDocs = (...images) => {
        const filteredImages = images.filter((img) => img); // Remove null/undefined values
        setSelectedImages(filteredImages);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedImages([]);
        setIsModalOpen(false);
    };

    const handleUpdateStatus = async (captainId, status) => {
        await axiosInstance.put(`/freelanceCaptain/${captainId}/updateStatus`, {
            accountStatus: status,
        });
        fetchCaptains();
        Swal.fire({
            icon: "success",
            title: "Updated!",
            text: "Status updated successfully.",
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
                        alt="Profile"
                        style={{ width: "50px", height: "50px", borderRadius: "5px", cursor: "pointer" }}
                    />
                ) : (
                    "No image"
                ),
        },
        { name: "Name", selector: (row) => row.name, sortable: true },
        { name: "Email", selector: (row) => row.email },
        { name: "Phone", selector: (row) => row.phone },
        { name: "Wallet No.", selector: (row) => row.walletNo },
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
        },
        {
            name: "Docs",
            cell: (row) => (
                <button
                    className="btn btn-primary"
                    onClick={() =>
                        handleViewDocs(
                            row.civilIdCardFront,
                            row.civilIdCardBack,
                            row.driverLicense,
                            row.vehicleLicense,
                            row.policeClearanceCertificate
                        )
                    }
                >
                    View
                </button>
            ),
        },
        {
            name: "Car",
            cell : (row) => {
                const assignedCar = cars.find(car => car._id === row.car);
                return ( <span className="badge bg-success">{assignedCar.car_type} - {assignedCar.car_palette}</span>);
            }
        },
        {
            name: "Status",
            cell: (row) => (
                <Dropdown>
                    <Dropdown.Toggle variant="light" className="p-0">
                        <span
                            className={`badge ${row.accountStatus === "approved" ? "bg-success" :
                                row.accountStatus === "pending" ? "bg-warning" :
                                    row.accountStatus === "rejected" ? "bg-danger" :
                                        "bg-secondary"
                                }`}
                        >
                            {row.accountStatus}
                        </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {["pending", "approved", "incomplete", "rejected"].map((status) => (
                            <Dropdown.Item key={status} onClick={() => handleUpdateStatus(row._id, status)}>
                                {status}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            ),
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

    const filteredCaptains = captains.filter((captain) =>
        ["name", "email", "phone", "walletNo"].some((key) =>
            captain[key]?.toLowerCase().includes(filterText.toLowerCase())
        )
    );

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
                                    headCells: { style: { fontWeight: "bold", fontSize: "16px" } },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for displaying documents */}
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
                    onClick={closeModal}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "10px",
                            width: "50vw", // Adjust width
                            maxWidth: "600px", // Prevent oversized modals
                            maxHeight: "80vh", // Prevent it from going off-screen
                            overflowY: "auto",
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                            display: "flex",
                            flexDirection: "column"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h4 style={{alignSelf: "center"}}>Documents</h4>
                        {selectedImages.length > 0 ? (
                            selectedImages.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Document ${index + 1}`}
                                    style={{ width: "100%", marginBottom: "10px", borderRadius: "5px" }}
                                />
                            ))
                        ) : (
                            <p>No documents available</p>
                        )}
                        <button className="btn btn-secondary mt-2" onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FreelanceCaptain;
