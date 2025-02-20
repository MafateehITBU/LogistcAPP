import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";
import Cookies from 'js-cookie';

const Salary = () => {
    const [salaries, setSalaries] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [selectedSalary, setSelectedSalary] = useState(null);
    const adminRole = Cookies.get('adminRole');

    useEffect(() => {
        fetchsalaries();
    }, []);

    const fetchsalaries = async () => {
        try {
            const response = await axiosInstance.get("/salary");
            setSalaries(response.data);
        } catch (error) {
            console.error("Error fetching salaries:", error);
        }
    };

    const handleEdit = (salary) => {
        setSelectedSalary(salary);
        const modal = new window.bootstrap.Modal(document.getElementById("editSalaryModal"));
        modal.show();
    };

    const handleUpdate = async () => {
        try {
            const response = await axiosInstance.put(`/salary/${selectedSalary._id}`, selectedSalary);
            Swal.fire("Updated!", "The Salary has been updated successfully.", "success");

            // Update the state with the edited salary details
            setSalaries((prevsalaries) =>
                prevsalaries.map((salary) =>
                    salary._id === selectedSalary._id ? { ...response.data } : salary
                )
            );

            const modal = window.bootstrap.Modal.getInstance(document.getElementById("editSalaryModal"));
            modal.hide();
            fetchsalaries();
        } catch (error) {
            console.error("Error updating salary:", error);
        }
    };

    const columns = [
        {
            name: "Name",
            selector: (row) => row.assignedTo,
            sortable: true,
        },
        {
            name: "Position",
            selector: (row) => row.position,
            sortable: true,
        },
        {
            name: "Start Date",
            selector: (row) => {
                if (!row.startDate) return "N/A";
                const date = new Date(row.startDate);
                return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
            },
            sortable: true,
        },
        {
            name: "Salary",
            selector: (row) => row.salary,
            sortable: true,
        },
        {
            name: "Deduction",
            selector: (row) => row.deduction,
            sortable: true,
        },
        {
            name: "Commission",
            selector: (row) => row.commission,
            sortable: true,
        },
        // Conditionally add the Action column
        ...(adminRole !== "Accountant"
            ? [
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
                        </div>
                    ),
                },
            ]
            : []),
    ];

    const filteredsalaries = salaries.filter((salary) => {
        return (
            salary.name?.toLowerCase().includes(filterText.toLowerCase()) ||
            salary.position?.toLowerCase().includes(filterText.toLowerCase()) ||
            salary.startDate?.toLowerCase().includes(filterText.toLowerCase())
        );
    });


    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div className="page-inner">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h1>Salary Details</h1>
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
                                data={filteredsalaries}
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

            {/* Edit Salary Modal */}
            <div
                className="modal fade"
                id="editSalaryModal"
                tabIndex="-1"
                role="dialog"
                aria-hidden="true"
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0">
                            <h5 className="modal-title">Update Salary</h5>
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
                                        value={selectedSalary?.assignedTo || ""}
                                        disabled
                                        style={{ backgroundColor: 'white' }}
                                    />
                                </div>
                                <div class="form-group form-group-default">
                                    <label>Start Date</label>
                                    <input
                                        id="Name"
                                        type="date"
                                        class="form-control"
                                        value={selectedSalary?.startDate ? new Date(selectedSalary.startDate).toISOString().split('T')[0] : ""}
                                        style={{ backgroundColor: 'white' }}
                                    />

                                </div>
                                <div class="form-group form-group-default">
                                    <label>Salary</label>
                                    <input
                                        id="Name"
                                        type="text"
                                        class="form-control"
                                        placeholder="Fill Salary"
                                        value={selectedSalary?.salary || ""}
                                        onChange={(e) =>
                                            setSelectedSalary({ ...selectedSalary, salary: e.target.value })
                                        }
                                    />
                                </div>
                                <div class="form-group form-group-default">
                                    <label>Deduction</label>
                                    <input
                                        id="Name"
                                        type="text"
                                        class="form-control"
                                        placeholder="Fill Deduction"
                                        value={selectedSalary?.deduction || ""}
                                        onChange={(e) =>
                                            setSelectedSalary({ ...selectedSalary, deduction: e.target.value })
                                        }
                                    />
                                </div>
                                <div class="form-group form-group-default">
                                    <label>Commission</label>
                                    <input
                                        id="Name"
                                        type="text"
                                        class="form-control"
                                        placeholder="Fill Commission"
                                        value={selectedSalary?.commission || ""}
                                        onChange={(e) =>
                                            setSelectedSalary({ ...selectedSalary, commission: e.target.value })
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

export default Salary;
