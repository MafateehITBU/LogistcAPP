import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const Car = () => {
    const [cars, setCars] = useState([]);
    const [newCar, setNewCar] = useState({});
    const [filterText, setFilterText] = useState("");
    const [selectedCar, setSelectedCar] = useState(null);

    useEffect(() => {
        fetchCars();
    }, []);

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
            text: "Do you really want to delete this car?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosInstance.delete(`/car/${id}`);
                    Swal.fire("Deleted!", "The car has been deleted.", "success");
                    // Update the state to remove the deleted user
                    setCars((prevCars) => prevCars.filter((car) => car._id !== id));
                } catch (error) {
                    console.error("Error deleting car:", error);
                }
            }
        });
    };

    const handleEdit = (car) => {
        setSelectedCar(car);
        const modal = new window.bootstrap.Modal(document.getElementById("editCarModal"));
        modal.show();
    };

    const handleUpdate = async () => {
        try {
            const response = await axiosInstance.put(`/car/${selectedCar._id}`, selectedCar);
            Swal.fire("Updated!", "The car has been updated successfully.", "success");

            setCars((prevCar) =>
                prevCar.map((car) =>
                    car._id === selectedCar._id ? { ...response.data } : car
                )
            );

            const modal = window.bootstrap.Modal.getInstance(document.getElementById("editCarModal"));
            modal.hide();
            fetchCars();
        } catch (error) {
            console.error("Error updating car:", error);
        }
    };

    const handleAddCar = async () => {
        try {
            const response = await axiosInstance.post("/car/create", newCar);

            if (response.status === 200) {
                Swal.fire("Success!", "Car added successfully.", "success");

                // Update the cars list to include the new car
                setCars([...cars, { ...response.data }]);

                // Reset the form fields
                setNewCar({
                    palette: "",
                    type: "",
                    manufacture: "",
                    license: "",
                    insurance: "comprehensive",
                    ownership: "company",
                });

                // Close the modal
                const modalElement = document.getElementById("addRowModal");
                const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
            }
        } catch (error) {
            // Display SweetAlert error message
            Swal.fire("Error!", "Failed to add car.", "error");
            console.error("Error adding car:", error);
        }
    };

    const columns = [
        {
            name: "Ownership",
            selector: (row) => row.carOwnership,
        },
        {
            name: "Palette",
            selector: (row) => row.car_palette,
        },
        {
            name: "Type",
            selector: (row) => row.car_type,
        },
        {
            name: "Manufacture Year",
            selector: (row) => row.manufactureYear,
            sortable: true,
        },
        {
            name: "License Exp",
            selector: (row) => row.licenseExpiryDate,
            sortable: true,
        },
        {
            name: "Incurance Type",
            selector: (row) => row.insuranceType,
            sortable: false,
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

    const customStyles = {
        headCells: {
            style: {
                fontWeight: "bold",
                fontSize: "16px",
            },
        },
    };

    const filteredCars = cars.filter(
        (car) =>
            car.car_palette?.toLowerCase().includes(filterText.toLowerCase()) ||
            car.car_type?.toLowerCase().includes(filterText.toLowerCase()) ||
            car.manufactureYear?.toLowerCase().includes(filterText.toLowerCase()) ||
            car.licenseExpiryDate?.toLowerCase().includes(filterText.toLowerCase()) ||
            car.insuranceType?.toLowerCase().includes(filterText.toLowerCase()) ||
            car.carOwnership?.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div className="page-inner">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="card-title">Car Details</h4>
                                <input
                                    type="text"
                                    className="form-control mx-3"
                                    placeholder="Search..."
                                    style={{ maxWidth: "300px" }}
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
                        </div>
                        <div className="card-body">
                            {/*Add New Car Modal Content */}
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
                                                <span className="fw-light"> Car</span>
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
                                                            <label>Palette</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter palette"
                                                                value={newCar.palette}
                                                                onChange={(e) =>
                                                                    setNewCar({ ...newCar, car_palette: e.target.value })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div className="form-group form-group-default">
                                                            <label>Type</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter type"
                                                                value={newCar.type}
                                                                onChange={(e) =>
                                                                    setNewCar({ ...newCar, car_type: e.target.value })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 pe-0">
                                                        <div className="form-group form-group-default">
                                                            <label>Manufacture Year</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter manufacture year"
                                                                value={newCar.manufacture}
                                                                onChange={(e) =>
                                                                    setNewCar({ ...newCar, manufactureYear: e.target.value })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group form-group-default">
                                                            <label>License Exp</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter license expiration"
                                                                value={newCar.license}
                                                                onChange={(e) =>
                                                                    setNewCar({ ...newCar, licenseExpiryDate: e.target.value })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div className="form-group form-group-default">
                                                            <label>Insurance Type</label>
                                                            <select
                                                                className="form-select"
                                                                value={newCar.insurance}
                                                                onChange={(e) =>
                                                                    setNewCar({ ...newCar, insuranceType: e.target.value })
                                                                }
                                                            >
                                                                <option value="comprehensive">Comprehensive</option>
                                                                <option value="thirdPartyLiability">Third Party Liability</option>
                                                                <option value="partial">Partial</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div className="form-group form-group-default">
                                                            <label>Car Ownership</label>
                                                            <select
                                                                className="form-select"
                                                                value={newCar.ownership}
                                                                onChange={(e) =>
                                                                    setNewCar({ ...newCar, carOwnership: e.target.value })
                                                                }
                                                            >
                                                                <option value="company">Company</option>
                                                                <option value="captain">Captain</option>
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
                                                onClick={handleAddCar}
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

                            {/* Edit Car Modal */}
                            <div
                                className="modal fade"
                                id="editCarModal"
                                tabIndex="-1"
                                role="dialog"
                                aria-hidden="true"
                            >
                                <div className="modal-dialog" role="document">
                                    <div className="modal-content">
                                        <div className="modal-header border-0">
                                            <h5 className="modal-title">Edit Car</h5>
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
                                                    <label>Ownership</label>
                                                    <select
                                                        className="form-select"
                                                        value={selectedCar?.carOwnership || ""}
                                                        onChange={(e) =>
                                                            setSelectedCar({ ...selectedCar, carOwnership: e.target.value })
                                                        }
                                                    >
                                                        <option value="">Select ownership</option>
                                                        <option value="company">Company</option>
                                                        <option value="captain">Captian</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Car Palette</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={selectedCar?.car_palette || ""}
                                                        onChange={(e) =>
                                                            setSelectedCar({ ...selectedCar, car_palette: e.target.value })
                                                        }
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Type</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={selectedCar?.car_type || ""}
                                                        onChange={(e) =>
                                                            setSelectedCar({ ...selectedCar, car_type: e.target.value })
                                                        }
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Manufacture Year</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={selectedCar?.manufactureYear || ""}
                                                        onChange={(e) =>
                                                            setSelectedCar({ ...selectedCar, manufactureYear: e.target.value })
                                                        }
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>licenseExpiryDate</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={selectedCar?.licenseExpiryDate || ""}
                                                        onChange={(e) =>
                                                            setSelectedCar({ ...selectedCar, licenseExpiryDate: e.target.value })
                                                        }
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Insurance Type</label>
                                                    <select
                                                        className="form-select"
                                                        value={selectedCar?.insuranceType || ""}
                                                        onChange={(e) =>
                                                            setSelectedCar({ ...selectedCar, insuranceType: e.target.value })
                                                        }
                                                    >
                                                        <option value="comprehensive">Comprehensive</option>
                                                        <option value="thirdPartyLiability">Third Party Liability</option>
                                                        <option value="partial">Partial</option>
                                                    </select>
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

                            <DataTable
                                columns={columns}
                                data={filteredCars}
                                pagination
                                responsive
                                highlightOnHover
                                striped
                                customStyles={customStyles}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Car;
