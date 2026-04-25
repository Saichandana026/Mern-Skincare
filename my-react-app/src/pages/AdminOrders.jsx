import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminOrders.css";

function AdminOrders() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${backendUrl}/admin-orders`);
      setOrders(res.data);
    } catch (err) {
      console.log("Error fetching orders:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/delete-order/${id}`);
      alert("Order deleted");
      fetchOrders();
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${backendUrl}/update-order/${id}`, {
        status: newStatus,
      });
      fetchOrders();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="admin-orders">
      <h2>MANAGE ORDERS</h2>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Sl No</th>
            <th>User</th>
            <th>Address</th>
            <th>Items</th>
            <th>Total Price</th>
            <th>Payment Method</th>
            <th>Payment Status</th>
            <th>Order Status</th>
            <th>Change Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="9">No orders found</td>
            </tr>
          ) : (
            orders.map((order, index) => (
              <tr key={order._id}>
                <td>{index + 1}</td>

                <td>{order.userId}</td>

                <td>
                  {order.address?.fullName || "N/A"} <br />
                  {order.address?.address || "N/A"} <br />
                  {order.address?.city || "N/A"}
                </td>

                <td>
                  {order.items?.map((item, i) => (
                    <div key={i}>
                      {item.name} x {item.quantity}
                    </div>
                  ))}
                </td>

                <td>${order.totalAmount}</td>

                <td>{order.paymentMethod}</td>

                <td>{order.paymentStatus}</td>

                <td>{order.status}</td>

                <td>
                  <select
                    className="status-change"
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                  >
                    <option value="Placed">Placed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out of Delivery">Out of Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>

                <td>
                  <div className="action-buttons">
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(order._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminOrders;