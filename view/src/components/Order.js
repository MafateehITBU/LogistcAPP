import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { Dropdown } from "react-bootstrap";
import Swal from "sweetalert2";
import axiosInstance from "../axiosConfig";

const Order = () => {
    const [orders, setOrders] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [procurement, setProcurement] = useState([]);
    const [delivery, setDelivery] = useState([]);

    useEffect(() => {
        fetchOrders();
        fetchProcurement();
        fetchDelivery();
    }, []);

    // Fetch orders data
    const fetchOrders = async () => {
        try {
            const response = await axiosInstance.get("/order/all");
            setOrders(response.data.orders);
        } catch (error) {
            console.error("Error fetching orders data:", error);
            Swal.fire("Error", "Failed to fetch orders data.", "error");
        }
    };

    // Fetch procurement officers
    const fetchProcurement = async () => {
        try {
            const response = await axiosInstance.get("/fulltimeCaptain");
            const procurementOfficers = response.data.filter(captain => captain.role === "procurement");
            setProcurement(procurementOfficers);
        } catch (error) {
            console.error("Error fetching procurement officers data:", error);
            Swal.fire("Error", "Failed to fetch procurement officers data.", "error");
        }
    };

    // Fetch delivery captains
    const fetchDelivery = async () => {
        try {
            const response = await axiosInstance.get("/freelanceCaptain/delivery");
            setDelivery(response.data.deliveryCaptains);
        } catch (error) {
            console.error("Error fetching delivery captains data:", error);
            Swal.fire("Error", "Failed to fetch delivery captains data.", "error");
        }
    };

    const handleViewItems = (items) => {
        setSelectedItems(items);
        setShowModal(true);
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

    const handleAddProcurement = async (orderId, procurementOfficerId) => {
        try {
            await axiosInstance.put(`/order/${orderId}/assign-captains`, {
                procurementOfficer: procurementOfficerId
            });
            fetchOrders();
            Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Procurement officer assigned successfully.",
                toast: true,
                position: "bottom-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
            });
        } catch (error) {
            console.error("Error assigning procurement officer:", error);
            Swal.fire("Error", "Failed to assign procurement officer.", "error");
        }
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

    const columns = [
        {
            name: "User Name",
            selector: (row) => row.user.name,
            sortable: true,
        },
        {
            name: "City",
            selector: (row) => row.city,
            sortable: true,
        },
        {
            name: "District",
            selector: (row) => row.district,
            sortable: true,
        },
        {
            name: "Area",
            selector: (row) => row.area,
            sortable: true,
        },
        {
            name: "St.",
            selector: (row) => row.street,
            sortable: true,
        },
        {
            name: "Procurement",
            cell: (row) => {
                const assignedProcurement = procurement.find(officer => officer._id === row.procurementOfficer);
                return (
                    <Dropdown>
                        <Dropdown.Toggle variant="light" className="p-0">
                            {assignedProcurement ? <span className="badge bg-success"> {assignedProcurement.name}</span> : <span className="badge bg-danger">"Not assigned"</span>}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {procurement.map((officer) => (
                                <Dropdown.Item
                                    key={officer._id}
                                    onClick={() => handleAddProcurement(row._id, officer._id)}
                                >
                                    {officer.name}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                );
            },
            sortable: true,
        },
        {
            name: "Delivery",
            cell: (row) => {
                const assignedDelivery = delivery.find(captain => captain._id === row.deliveryCaptain);
                return (
                    <Dropdown>
                        <Dropdown.Toggle variant="light" className="p-0">
                            {assignedDelivery ? <span className="badge bg-success"> {assignedDelivery.name}</span> : <span className="badge bg-danger">Not assigned</span>}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {delivery.map((captain) => (
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
                        {["InStore", "OutToDelivery"].map((status) => (
                            <Dropdown.Item
                                key={status}
                                onClick={() => handleUpdateStatus(row._id, status)}
                            >
                                {status}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            ),
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
        order.status.toLowerCase().includes(filterText.toLowerCase()) ||
        order.procurementOfficer.toLowerCase().includes(filterText.toLowerCase()) ||
        order.deliveryCaptain.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div className="container" style={{ marginTop: "80px" }}>
            <div className="page-inner">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <div className="d-flex align-items-center justify-content-between">
                                <h4 className="card-title">Order Details</h4>
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

export default Order;