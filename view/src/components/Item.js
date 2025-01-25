import React, { useState } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";

const Car = () => {
    const [filterText, setFilterText] = useState("");

    const columns = [
        {
            name: "Image",
            selector: (row) => (
                <img
                    src={row.image}
                    alt={row.name}
                    style={{ width: "50px", height: "50px", borderRadius: "5px" }}
                />
            ),
        },
        {
            name: "name",
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: "Price",
            selector: (row) => row.price,
            sortable: true,
        },
        {
            name: "Type",
            selector: (row) => row.type,
        },
        {
            name: "Expiary Date",
            selector: (row) => row.expiaryDate,
        },
        {
            name: "Weight",
            selector: (row) => row.weight,
            sortable: true,
        },
        {
            name:"Volume",
            selector: (row) => row.volume,
            sortable: true,
        },
        {
            name:"Owner",
            selector: (row) => row.owner,
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="form-button-action">
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
        // add sample data
        {id: 1, image: "test.jpg", name: "Cookie", price: "1 JD", type: "Refrigerant", expiaryDate: "2025/12", weight: "0.12 KG", volume: "10", owner:"Sara"},
        {id: 2, image: "test.jpg", name: "T-shirt", price: "10 JD", type: "Normal", expiaryDate: "-", weight: "0.20 KG", volume: "2", owner:"Saed"}
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
                                <h4 className="card-title">Item Details</h4>
                                <input
                                    type="text"
                                    className="form-control mx-3"
                                    placeholder="Search..."
                                    style={{ maxWidth: "300px" }}
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                />
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
        </div>
    );
};

export default Car;
