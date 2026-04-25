import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Login() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/login`,
        { email, password }
      );

      console.log("Login response:", res.data);

      localStorage.setItem("user", JSON.stringify(res.data));

      alert("Login successful");

      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  return (
    <>
      <div className="overlay"></div>

      <div className="login-box">
        <h2>
          <span>my</span> SKIN CARE
        </h2>

        <h3>Great to have you back!</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">LOG IN</button>
        </form>

        <div className="register">
          Don’t have an account?
          <Link to="/register"> Register now</Link>
        </div>

        <div className="register">
          Are you an Admin?
          <Link to="/admin"> Login as Admin</Link>
        </div>
      </div>
    </>
  );
}

export default Login;