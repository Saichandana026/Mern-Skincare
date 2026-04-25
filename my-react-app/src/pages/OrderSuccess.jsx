import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setShowPopup(true);
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    navigate("/");
  };

  return (
    <div className="success-page">
      {showPopup && (
        <div className="success-overlay">
          <div className="success-popup">
            

            <h2>Payment Successful</h2>

            <p>
              Your order has been placed successfully.  
              Thank you for shopping with us.
            </p>

            <button onClick={closePopup}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderSuccess;