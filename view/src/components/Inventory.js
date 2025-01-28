import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const Inventory = () => {
    const [inventories, setInventories] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchInventories();
    }, []);

    // Fetch inventory data
    const fetchInventories = async () => {
        try {
            const response = await axiosInstance.get("/inventory");
            setInventories(response.data);
        } catch (error) {
            console.error("Error fetching inventory data:", error);
            Swal.fire("Error", "Failed to fetch inventory data.", "error");
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to delete this inventory?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axiosInstance.delete(`/inventory/${id}`);
                    Swal.fire("Deleted!", response.data.message, "success");
                    // Update state by removing the deleted inventory
                    setInventories((prevInventories) =>
                        prevInventories.filter((inventory) => inventory._id !== id)
                    );
                } catch (error) {
                    if (error.response) {
                        Swal.fire("Error", error.response.data.message || "An error occurred", "error");
                    } else {
                        console.error("Error deleting the inventory:", error);
                        Swal.fire("Error", "Failed to delete the inventory.", "error");
                    }
                }
            }
        });
    };


    const handleViewItems = (items) => {
        setSelectedItems(items);
        setShowModal(true);
    };

    const columns = [
        {
            name: "User Name",
            selector: (row) => row.userName,
            sortable: true,
        },
        {
            name: "No. of Items",
            selector: (row) => row.items.length,
            sortable: true,
        },
        {
            name: "See Items",
            cell: (row) => (
                <button
                    className="btn btn-primary"
                    onClick={() => handleViewItems(row.items)}
                >
                    View Items
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

    const filteredData = inventories.filter((inventory) =>
        inventory.userName.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div className="page-inner">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="card-title">Inventory Details</h4>
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

            {/* Modal */}
            {showModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                >
                    <div className="modal-dialog" role="document" style={{ maxWidth: "70%" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Items Details</h5>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => setShowModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Weight</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedItems.map((item) => (
                                            <tr key={item._id}>
                                                <td>{item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt="user profilePicture"
                                                        style={{ width: "50px", height: "50px", borderRadius: "5px", cursor: "pointer" }}
                                                    />
                                                ): "no img attached"}</td>
                                                <td>{item.name}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.price}</td>
                                                <td>{item.weight}</td>
                                                <td>{item.type}</td>
                                                <td>{item.itemStatus === 'inStock'?
                                                 (<div style={{ backgroundColor: "#28a745", padding: "10px", borderRadius: "5px", color:"#fff", textAlign: "center" }}>In Stock</div>):
                                                 (<div style={{ backgroundColor: "red", padding: "10px", borderRadius: "5px", color:"#fff" }}>Out of Stock</div>)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;