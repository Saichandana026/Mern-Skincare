// AdminDashboard.jsx
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    totalPayment: 0,
    salesCount: 0
  });

  const [salesData, setSalesData] = useState([]);
  const [signupData, setSignupData] = useState([]);

  const COLORS = ["#27ae60", "#e74c3c"];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/dashboard");
      
      setStats(res.data.stats);
      setSalesData(res.data.salesData);
      setSignupData(res.data.signupData);

    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    alert("Admin Logged Out");
    navigate("/login");
  };

  const paymentData = [
    { name: "Received", value: stats.totalPayment },
    { name: "Pending", value: 0 }
  ];

  return (
    <div className="dashboard">
      <h1>ADMIN DASHBOARD</h1>
      <p>Welcome Admin</p>

     <div className="cards">
     <div className="buttons">

        <button onClick={() => navigate("/add-product")}>
          ADD PRODUCTS
        </button>

        <button onClick={() => navigate("/manage-products")}>
          MANAGE PRODUCTS
        </button>

        <button onClick={() => navigate("/admin-orders")}>
          MANAGE ORDERS
        </button>

        <button onClick={handleLogout} className="logout">
          LOGOUT
        </button>

      </div>
    </div>

      <div className="cards">

        <div className="card">
          <h3>Total Sales</h3>
          <p>{stats.salesCount}</p>
        </div>

        <div className="card">
          <h3>Payments</h3>
          <p>₹{stats.totalPayment}</p>
        </div>

        <div className="card">
          <h3>Signups</h3>
          <p>{stats.users}</p>
        </div>

        <div className="card">
          <h3>Orders</h3>
          <p>{stats.orders}</p>
        </div>

      </div>


      <div className="charts">


        <div className="chart-box">
          <h3>Monthly Sales</h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </div>


        <div className="chart-box">
          <h3>Payments</h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {paymentData.map((item, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>User Signups</h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={signupData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#8e44ad"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

    
    </div>
  );
}

export default AdminDashboard;