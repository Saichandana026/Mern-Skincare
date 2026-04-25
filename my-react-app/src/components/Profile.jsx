import React, { useEffect, useState } from "react";
import "./Profile.css";

const Profile = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;;
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  setUser(storedUser);

  if (storedUser?.userId) {
    fetch(`${backendUrl}/my-orders/${storedUser.userId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => setOrders(data))
      .catch(err => console.log(err));
  }
}, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (!user) return <h2>Please login first</h2>;

  return (
    <div className="profile-container">

    
      <div className="sidebar">
        <h2>{user.name}</h2>
        <p>{user.email}</p>

        <ul>
          <li 
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            My Profile
          </li>

          <li 
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            All Orders
          </li>

          <li onClick={handleLogout} className="logout">
            Logout
          </li>
        </ul>
      </div>

      
      <div className="profile-content">

        {activeTab === "profile" && (
          <>
            <h2>Profile Information</h2>

            <div className="info">
              <div>
                <label>Name</label>
                <p>{user.name}</p>
              </div>

              <div>
                <label>Email</label>
                <p>{user.email}</p>
              </div>
            </div>
          </>
        )}

        {activeTab === "orders" && (
          <>
            <h2>My Orders</h2>

            {orders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              <table className="orders-table">
  <thead>
    <tr>
      <th>Order ID</th>
      <th>Products</th> 
      <th>Total</th>
      <th>Payment</th>
      <th>Status</th>
      <th>Date</th>
    </tr>
  </thead>

  <tbody>
    {orders.map((order) => (
      <tr key={order._id}>
        <td>{order._id}</td>

        
        <td>
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <img
                src={`${backendUrl}/images/${item.image}`}
                alt={item.name}
                className="order-img"
              />
              <p>{item.name} (x{item.quantity})</p>
            </div>
          ))}
        </td>

        <td>${order.totalAmount}</td>
        <td>{order.paymentStatus}</td>
        <td>{order.status}</td>
        <td>
          {new Date(order.createdAt).toLocaleDateString()}
        </td>
      </tr>
    ))}
  </tbody>
</table>
            )}
          </>
        )}

      </div>

    </div>
  );
};

export default Profile;