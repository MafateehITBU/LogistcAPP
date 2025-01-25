import React, { useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";

const Car = () => {
    const [filterText, setFilterText] = useState("");

    const columns = [
        {
            name: "Palette",
            selector: (row) => row.palette,
        },
        {
            name: "Type",
            selector: (row) => row.type,
        },
        {
            name: "Manufacture Year",
            selector: (row) => row.manufacture,
            sortable: true,
        },
        {
            name: "License Exp",
            selector: (row) => row.license,
            sortable: true,
        },
        {
            name: "Incurance Type",
            selector: (row) => row.insurance,
            sortable: false,
        },
        {
            name: "Ownership",
            selector: (row) => row.ownership,
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
        { id: 1, palette: "3431101", type: "System Architect", manufacture: "2017", license: "2027", insurance: "partial", ownership: "company" },
        { id: 2, palette: "123456", type: "Accountant", manufacture: "2020", license: "2027", insurance: "partial", ownership: "company" },
    ];

    const filteredData = data.filter(
        (item) =>
            item.palette.toLowerCase().includes(filterText.toLowerCase()) ||
            item.type.toLowerCase().includes(filterText.toLowerCase()) ||
            item.manufacture.toLowerCase().includes(filterText.toLowerCase()) ||
            item.license.toLowerCase().includes(filterText.toLowerCase()) ||
            item.insurance.toLowerCase().includes(filterText.toLowerCase()) ||
            item.ownership.toLowerCase().includes(filterText.toLowerCase())
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
                                                                id="addPalette"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter palette"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div className="form-group form-group-default">
                                                            <label>Type</label>
                                                            <input
                                                                id="addType"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter type"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6 pe-0">
                                                        <div className="form-group form-group-default">
                                                            <label>Manufacture Year</label>
                                                            <input
                                                                id="addManufacture"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter manufacture year"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group form-group-default">
                                                            <label>License Exp</label>
                                                            <input
                                                                id="addLicense"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Enter license expiration"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div class="form-group form-group-default">
                                                            <label>Insurance Type</label>
                                                            <select
                                                                class="form-select"
                                                                id="formGroupDefaultSelect"
                                                            >
                                                                <option value="comprehensive"> Comprehensive</option>
                                                                <option value="thirdPartyLiability"> Third Party Liability</option>
                                                                <option value="partial"> Partial</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-12">
                                                        <div class="form-group form-group-default">
                                                            <label>Car Ownership</label>
                                                            <select
                                                                class="form-select"
                                                                id="formGroupDefaultSelect"
                                                            >
                                                                <option value="company"> Company</option>
                                                                <option value="captain"> Captain</option>
                                                            </select>
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

export default Car;
