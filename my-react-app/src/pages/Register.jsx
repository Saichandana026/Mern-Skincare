import "./Register.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Register() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/register`,
        { name, email, password }
      );

      alert(res.data);

      navigate("/login");
    } catch (err) {
      alert(err.response?.data || "Registration Failed");
    }
  };

  return (
    <>
      <div className="overlay"></div>

      <div className="register-box">
        <h2>REGISTER</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            required
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email address"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">REGISTER</button>
        </form>

        <button className="back-btn" onClick={() => navigate("/login")}>
          Back to Login
        </button>
      </div>
    </>
  );
}

export default Register;