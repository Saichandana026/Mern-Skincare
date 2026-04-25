import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Admin() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/admin-login`,
        { email, password }
      );

      if (res.data.success) {
        alert("Admin Login Successful");
        navigate("/admin-dashboard");
      }
    } catch (err) {
      alert("Invalid Admin Email or Password");
    }
  };

  return (
    <>
      <div className="overlay"></div>

      <div className="login-box">
        <h2>
          <span>my</span> SKIN CARE
        </h2>
        <h3>Admin Login</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Admin Email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">LOG IN</button>
        </form>

        <button
          className="back-btn"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </div>
    </>
  );
}

export default Admin;