import React, { useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";

const Captain = () => {
    const [filterText, setFilterText] = useState("");

    const columns = [
        {
            name: "Image",
            selector: (row) => (
                <img
                    src={row.profilePic}
                    alt={row.name}
                    style={{ width: "50px", height: "50px", borderRadius: "5px" }}
                />
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
            name: "Contract Type",
            selector: (row) => row.contractType,
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
            name: "Action",
            cell: (row) => (
                <div className="form-button-action">
                    <button
                        type="button"
                        className="btn btn-link btn-primary btn-lg"
                        title="Edit Task"
                    >
                        <i className="fa fa-edit"></i>
                    </button>
                    <button
                        type="button"
                        className="btn btn-link btn-danger"
                        title="Remove"
                        onClick={() => handleDelete(row.id)}
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

    // Sample data
    const data = [
        {
            id: 1,
            profilePic: "https://via.placeholder.com/50",
            name: "John Doe",
            email: "john@example.com",
            phone: "123456789",
            contractType: "Full-time",
            role: "procurement",
            walletNo: "ABC123",
            rating: 4.5,
            points: 1200,
        },
        {
            id: 2,
            profilePic: "https://via.placeholder.com/50",
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "987654321",
            contractType: "Freelance",
            role: "delivery",
            walletNo: "XYZ456",
            rating: 3.8,
            points: 900,
        },
    ];

    const filteredData = data.filter(
        (item) =>
            item.name.toLowerCase().includes(filterText.toLowerCase()) ||
            item.position.toLowerCase().includes(filterText.toLowerCase()) ||
            item.office.toLowerCase().includes(filterText.toLowerCase())
    );

    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this item?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire("Deleted!", "Your item has been deleted.", "success");
                // Add the delete logic here
            }
        });
    };

    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div className="page-inner">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="card-title">Captain Details</h4>
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
                            {/* Modal Content */}
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
                                                <span className="fw-mediumbold">Add</span>
                                                <span className="fw-light"> New Record</span>
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
                                                Fill out the fields below to create a new record.
                                            </p>
                                            <form id="addRowForm">
                                                <div className="row">
                                                    <div className="col-sm-12">
                                                        <div className="form-group form-group-default">
                                                            <label>Name</label>
                                                            <input
                                                                id="addName"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter name"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group form-group-default">
                                                            <label>Email</label>
                                                            <input
                                                                id="addEmail"
                                                                type="email"
                                                                className="form-control"
                                                                placeholder="Enter email"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group form-group-default">
                                                            <label>Phone</label>
                                                            <input
                                                                id="addPhone"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter phone number"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div class="form-group form-group-default">
                                                            <label>Contract Type</label>
                                                            <select
                                                                class="form-select"
                                                                id="formGroupDefaultSelect"
                                                            >
                                                                <option value="fulltime"> Full-time</option>
                                                                <option value="freelance"> Freelance</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div class="form-group form-group-default">
                                                            <label>Role</label>
                                                            <select
                                                                class="form-select"
                                                                id="formGroupDefaultSelect"
                                                            >
                                                                <option value="procurement"> Procurement</option>
                                                                <option value="delivery"> Delivery</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group form-group-default">
                                                            <label>Wallet Number</label>
                                                            <input
                                                                id="addWalletNo"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter wallet number"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="modal-footer border-0">
                                            <button
                                                type="button"
                                                id="addRowButton"
                                                className="btn btn-primary"
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
        </div>
    );
};

export default Captain;
