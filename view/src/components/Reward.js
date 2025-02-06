import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const Reward = () => {
    const [rewards, setRewards] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [newReward, setNewReward] = useState({});

    useEffect(() => {
        fetchRewards();
    }, []);

    // Fetch inventory data
    const fetchRewards = async () => {
        try {
            const response = await axiosInstance.get("/reward");
            setRewards(response.data);
        } catch (error) {
            console.error("Error fetching reward data:", error);
            Swal.fire("Error", "Failed to fetch reward data.", "error");
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this reward?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axiosInstance.delete(`/reward/${id}`);
                    Swal.fire("Deleted!", response.data.message, "success");
                    Swal.fire({
                        icon: "success",
                        title: "Deleted!",
                        text: "Reward deleted successfully.",
                        toast: true,
                        position: "bottom-end",
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                    setRewards((prevRewards) => prevRewards.filter((reward) => reward._id !== id));
                } catch (error) {
                    Swal.fire("Error", error.response?.data?.message || "An error occurred", "error");
                }
            }
        });
    };

    const handleViewCoupons = (coupon) => {
        setSelectedCoupon(coupon);
        setShowModal(true);
    };

    const handleEdit = () => {
        setEditingCoupon({ ...selectedCoupon });
    };

    const handleSaveEdit = async () => {
        try {
            await axiosInstance.put(`/coupon/${editingCoupon._id}`, editingCoupon);
            setSelectedCoupon(editingCoupon);
            setEditingCoupon(null);
            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "Coupon updated successfully!",
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        } catch (error) {
            Swal.fire("Error", "Failed to update coupon.", "error");
        }
    };

    const handleChange = (e) => {
        setEditingCoupon({ ...editingCoupon, [e.target.name]: e.target.value });
    };

    const handleAddReward = async () => {
        try {
            console.log("Sending new reward:", newReward);
            const response = await axiosInstance.post("/reward", newReward);

            if (response.status === 201) {
                // Show success alert
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Reward added successfully.",
                    toast: true,
                    position: "bottom-end",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });

                // Update the rewards list to include the new reward
                setRewards([...rewards, response.data.reward]);

                // Reset the form fields
                setNewReward({
                    name: "",
                    description: "",
                    pointsRequired: "",
                    discountType: "percentage",
                    discountValue: "",
                    expiryDate: ""
                });

                // Fetch updated rewards list
                await fetchRewards();

                // Close the modal
                const modalElement = document.getElementById("addRowModal");
                const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
            }
        } catch (error) {
            console.error("Error adding reward:", error.response ? error.response.data : error);
            Swal.fire("Error!", error.response?.data?.message || "Failed to add reward.", "error");
        }
    };

    const columns = [
        {
            name: "Name",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Description",
            selector: (row) => row.description,
            sortable: true,
        },
        {
            name: "Points Required",
            selector: (row) => row.pointsRequired,
            sortable: true,
        },
        {
            name: "See Coupon",
            cell: (row) => (
                <button
                    className="btn btn-primary"
                    onClick={() => handleViewCoupons(row.coupon)}
                >
                    View Coupon
                </button>
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

    const customStyles = {
        headCells: {
            style: {
                fontWeight: "bold",
                fontSize: "16px",
            },
        },
    };

    const filteredData = rewards.filter((reward) =>
        reward.name.toLowerCase().includes(filterText.toLowerCase()) ||
        reward.description.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div className="page-inner">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="card-title">Reward Details</h4>
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
                            <DataTable
                                columns={columns}
                                data={filteredData}
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
            {/* Add Row Modal */}
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
                                <span className="fw-light"> Reward</span>
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
                                Create a new reward using this form. Make sure you fill out all fields.
                            </p>
                            <form>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <div className="form-group form-group-default">
                                            <label>Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter name"
                                                value={newReward.name}
                                                onChange={(e) =>
                                                    setNewReward({ ...newReward, name: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="col-sm-12">
                                        <div className="form-group form-group-default">
                                            <label>Description</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter description"
                                                value={newReward.description}
                                                onChange={(e) =>
                                                    setNewReward({ ...newReward, description: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6 pe-0">
                                        <div className="form-group form-group-default">
                                            <label>Points Required</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter points required"
                                                value={newReward.pointsRequired}
                                                onChange={(e) =>
                                                    setNewReward({ ...newReward, pointsRequired: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group form-group-default">
                                            <label>Expiry Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={newReward.expiryDate}
                                                onChange={(e) =>
                                                    setNewReward({ ...newReward, expiryDate: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6 ">
                                        <div className="form-group form-group-default p-3">
                                            <label>Discount Type</label>
                                            <select
                                                className="form-select"
                                                value={newReward.discountType}
                                                onChange={(e) =>
                                                    setNewReward({ ...newReward, discountType: e.target.value })
                                                }
                                            >
                                                <option value="percentage">Percentage</option>
                                                <option value="fixed">Fixed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group form-group-default">
                                            <label>Discount Value</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Enter discount value"
                                                value={newReward.discountValue}
                                                onChange={(e) =>
                                                    setNewReward({ ...newReward, discountValue: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer border-0">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleAddReward}
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

            {/* View Coupon modal */}
            {showModal && selectedCoupon && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog" role="document" style={{ maxWidth: "70%" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Coupon Details</h5>
                                <button type="button" className="close" onClick={() => setShowModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <table className="table text-center">
                                    <thead>
                                        <tr>
                                            <th>Discount Type</th>
                                            <th>Discount Value</th>
                                            <th>Max Usage</th>
                                            <th>Expiry Date</th>
                                            <th>Active Status</th>
                                            <th>Edit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {editingCoupon ? (
                                                <>
                                                    <td>
                                                        <div class="form-group form-group-default p-3">
                                                            <select
                                                                class="form-select"
                                                                id="formGroupDefaultSelect"
                                                                name="discountType" value={editingCoupon.discountType} onChange={handleChange}
                                                            >
                                                                <option value="percentage">Percentage</option>
                                                                <option value="fixed" >Fixed</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="form-group form-group-default">
                                                            <input
                                                                type="number"
                                                                name="discountValue"
                                                                value={editingCoupon.discountValue}
                                                                onChange={handleChange}
                                                                class="form-control"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="form-group form-group-default">
                                                            <input
                                                                type="number"
                                                                name="maxUsage"
                                                                value={editingCoupon.maxUsage}
                                                                onChange={handleChange}
                                                                class="form-control"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="form-group form-group-default">
                                                            <input
                                                                type="date"
                                                                name="expiryDate"
                                                                value={editingCoupon.expiryDate}
                                                                onChange={handleChange}
                                                                class="form-control"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="form-group form-group-default p-3">
                                                            <select
                                                                class="form-select"
                                                                id="formGroupDefaultSelect"
                                                                name="isActive" value={editingCoupon.isActive} onChange={handleChange}
                                                            >
                                                                <option value="true">Active</option>
                                                                <option value="false">Not Active</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td><button onClick={handleSaveEdit} className="btn btn-success">Save</button></td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{selectedCoupon.discountType}</td>
                                                    <td>{selectedCoupon.discountValue}</td>
                                                    <td>{selectedCoupon.maxUsage}</td>
                                                    <td>{new Date(selectedCoupon.expiryDate).toLocaleDateString()}</td>
                                                    <td>{selectedCoupon.isActive ? "Active" : "Not Active"}</td>
                                                    <td><button onClick={handleEdit} className="btn btn-primary">Edit</button></td>
                                                </>
                                            )}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reward;