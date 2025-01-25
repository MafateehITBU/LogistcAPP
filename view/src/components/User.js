import React, { useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";

const User = () => {
    const [filterText, setFilterText] = useState("");

    const columns = [
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
            name: "Orders",
            selector: (row) => row.orders,
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
            name: "Age",
            selector: (row) => row.age,
            sortable: true,
        },
        {
            name: "Gender",
            selector: (row) => row.gender,
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="form-button-action">
                    <button
                        type="button"
                        className="btn btn-link btn-danger"
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

    // Sample Data
    const data = [
        {
            id: 1,
            name: "Tiger Nixon",
            email: "tiger.nixon@example.com",
            phone: "123-456-7890",
            orders: 25,
            points: 120,
            walletNo: "WN123456",
            profilePicture: "https://via.placeholder.com/50",
            age: 36,
            gender: "Male",
        },
        {
            id: 2,
            name: "Garrett Winters",
            email: "garrett.winters@example.com",
            phone: "987-654-3210",
            orders: 30,
            points: 150,
            walletNo: "WN654321",
            profilePicture: "https://via.placeholder.com/50",
            age: 45,
            gender: "Female",
        },
        // Add more user data as needed
    ];

    const filteredData = data.filter(
        (item) =>
            item.name.toLowerCase().includes(filterText.toLowerCase()) ||
            item.email.toLowerCase().includes(filterText.toLowerCase()) ||
            item.phone.toLowerCase().includes(filterText.toLowerCase())
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
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h1>User Details</h1>
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

export default User;