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
  const [showPassword, setShowPassword] = useState(false);  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password)) {
    alert(
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
    );
    return;
  }


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

          <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="show-password">
            <input
              type="checkbox"
              id="showPass"
              onChange={() => setShowPassword(!showPassword)}
            />
            <label htmlFor="showPass">Show</label>
          </div>
        </div>

        <p
        style={{
          fontSize: "12px",
          color: "#666",
          marginTop: "5px"
        }}
      >
        Password must contain 8+ characters, uppercase, lowercase,
        number and special character.
      </p>

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