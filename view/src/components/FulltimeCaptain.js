import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const FulltimeCaptain = () => {
    const [captains, setCaptains] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [selectedCaptain, setSelectedCaptain] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null); // To store the clicked image
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cars, setCars] = useState([]);

    useEffect(() => {
        fetchCaptains();
        fetchCars();
    }, []);

    const fetchCaptains = async () => {
        try {
            const response = await axiosInstance.get("/fulltimeCaptain");
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
                    await axiosInstance.delete(`/fulltimeCaptain/${id}`);
                    Swal.fire("Deleted!", "The captain has been deleted.", "success");
                    // Update the state to remove the deleted captain
                    setCaptains((prevCaptains) => prevCaptains.filter((captain) => captain._id !== id));
                } catch (error) {
                    console.error("Error deleting captain:", error);
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

    const handleUpdateStatus = async (captainId, status) => {
        await axiosInstance.put(`/fulltimeCaptain/${captainId}/updateStatus`, {
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

    const handleAddCar = async (captainId, carId) => {
        try {
            await axiosInstance.put(`/fulltimeCaptain/assign-car`, {
                carId: carId,
                captainId: captainId
            });
            fetchCaptains();
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Car assigned successfully.",
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        } catch (error) {
            console.error("Error assigning car:", error);
            Swal.fire("Error", "Failed to assign car.", "error");
        }
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
            name: "Role",
            selector: (row) => row.role,
            sortable: true,
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
            name: "Car",
            cell: (row) => {
                const assignedCar = cars.find(car => car._id === row.car_id);
                return (
                    <Dropdown>
                        <Dropdown.Toggle variant="light" className="p-0">
                            {assignedCar ? (
                                <span className="badge bg-success">{assignedCar.car_type} - {assignedCar.car_palette}</span>
                            ) : (
                                <span className="badge bg-danger">Not assigned</span>
                            )}
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ maxHeight: "150px", overflowY: "auto" }}>
                            {cars.map((car) => (
                                <Dropdown.Item
                                    key={car._id}
                                    onClick={() => handleAddCar(row._id, car._id)}
                                >
                                    {car.car_type} - {car.car_palette}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                );
            },
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
                        {["pending", "approved", "incomplete", "rejected"].map((accountStatus) => (
                            <Dropdown.Item
                                key={accountStatus}
                                onClick={() => handleUpdateStatus(row._id, accountStatus)}
                            >
                                {accountStatus}
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
                            <h1>Fulltime Captain Details</h1>
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
        </div>
    );
};

export default FulltimeCaptain;
