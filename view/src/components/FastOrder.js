import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";
import { parseISO } from "date-fns";

const FastOrder = () => {
    const [orders, setOrders] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [captains, setCaptains] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    useEffect(() => {
        fetchOrders();
        fetchCaptains();
    }, []);

    // Fetch orders data
    const fetchOrders = async () => {
        try {
            const response = await axiosInstance.get("/order/all");
            const filteredOrders = response.data.orders.filter(order => order.orderType === "Fast");
            setOrders(filteredOrders);
        } catch (error) {
            console.error("Error fetching orders data:", error);
            Swal.fire("Error", "Failed to fetch orders data.", "error");
        }
    };

    // Fetch captains data
    const fetchCaptains = async () => {
        try {
            const response = await axiosInstance.get("/fulltimeCaptain");
            setCaptains(response.data);
        } catch (error) {
            console.error("Error fetching captains:", error);
        }
    };

    const handleViewItems = (items) => {
        setSelectedItems(items);
        setShowModal(true);
    };

    const handleViewAddress = (city, district, area, street) => {
        setSelectedAddress({ city, district, area, street });
        setShowAddressModal(true);
    };

    const handleAddDelivery = async (orderId, deliveryCaptainId) => {
        try {
            await axiosInstance.put(`/order/${orderId}/assign-captains`, {
                deliveryCaptain: deliveryCaptainId
            });
            fetchOrders();
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Delivery captain assigned successfully.",
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        } catch (error) {
            console.error("Error assigning delivery captain:", error);
            Swal.fire("Error", "Failed to assign delivery captain.", "error");
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        await axiosInstance.put(`/order/${orderId}/change-status`, {
            status: status,
        });
        fetchOrders();
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
            name: "User",
            selector: (row) => row.user.name,
            sortable: true,
        },
        {
            name: "Address",
            cell: (row) => (
                <button className="btn btn-primary" onClick={() => handleViewAddress(row.city, row.district, row.area, row.street)}>
                    View
                </button>
            ),
            sortable: true,
        },
        {
            name: "Payment",
            selector: (row) => row.paymentStatus,
            sortable: true,
        },
        {
            name: "Time",
            selector: (row) => {
                if (!row.preferredTime) return "N/A";
                const date = new Date(row.preferredTime);
                return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
            },
            sortable: true,
        },
        {
            name: "Delivery",
            cell: (row) => {
                const assignedDelivery = captains.find(captain => captain._id === row.deliveryCaptain);
                return (
                    <Dropdown>
                        <Dropdown.Toggle variant="light" className="p-0">
                            {assignedDelivery ? <span className="badge bg-success"> {assignedDelivery.name}</span> : <span className="badge bg-danger">Not assigned</span>}
                        </Dropdown.Toggle>
                        <Dropdown.Menu style={{ maxHeight: "150px", overflowY: "auto" }}>
                            {captains.map((captain) => (
                                <Dropdown.Item
                                    key={captain._id}
                                    onClick={() => handleAddDelivery(row._id, captain._id)}
                                >
                                    {captain.name}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                );
            },
            sortable: true,
        },
        {
            name: "Status",
            cell: (row) => (
                <div>
                    {/* Status Dropdown */}
                    <Dropdown>
                        <Dropdown.Toggle variant="light" className="p-0">
                            <span
                                className={`badge ${row.status === "Delivered" ? "bg-success" :
                                    row.status === "Pending" ? "bg-warning" :
                                        row.status === "Refused" ? "bg-danger" :
                                            row.status === "OutToDelivery" ? "bg-info" :
                                                "bg-secondary"
                                    }`}
                            >
                                {row.status}
                            </span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {["OutToDelivery"].map((status) => (
                                <Dropdown.Item
                                    key={status}
                                    onClick={() => handleUpdateStatus(row._id, status)}
                                >
                                    {status}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>

                    {/* Show postponedDate BELOW the dropdown */}
                    {row.status === "Postponed" && row.postponedDate && (
                        <div className="mt-1 text-muted small">
                            Postponed to: {new Date(row.postponedDate).toLocaleDateString()} -<br />
                            {new Date(row.postponedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>
            ),
        },
        {
            name: "Total Price",
            selector: (row) => row.totalPrice,
            sortable: true,
        },
        {
            name: "Order Details",
            cell: (row) => (
                <button className="btn btn-primary" onClick={() => handleViewItems(row.items)}>
                    View
                </button>
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

    const filteredData = orders.filter((order) =>
        order.user.name.toLowerCase().includes(filterText.toLowerCase()) ||
        order.city.toLowerCase().includes(filterText.toLowerCase()) ||
        order.district.toLowerCase().includes(filterText.toLowerCase()) ||
        order.area.toLowerCase().includes(filterText.toLowerCase()) ||
        order.street.toLowerCase().includes(filterText.toLowerCase()) ||
        order.status.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div className="page-inner">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="card-title">Fast Order Details</h4>
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

            {/* Address Modal */}
            {showAddressModal && selectedAddress && (
                <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Address Details</h5>
                                <button type="button" className="close" onClick={() => setShowAddressModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p><strong>City:</strong> {selectedAddress.city}</p>
                                <p><strong>District:</strong> {selectedAddress.district}</p>
                                <p><strong>Area:</strong> {selectedAddress.area}</p>
                                <p><strong>Street:</strong> {selectedAddress.street}</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowAddressModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Items Modal */}
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
                                            <th>Name</th>
                                            <th>Source</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedItems.map((item) => (
                                            <tr key={item._id}>
                                                <td>{item.item.name}</td>
                                                <td>{item.source}</td>
                                                <td>{item.quantity}</td>
                                                <td>{item.item.price}</td>
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

export default FastOrder;
