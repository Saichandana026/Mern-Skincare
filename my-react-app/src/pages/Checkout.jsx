import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";

function Checkout() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [payment, setPayment] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/cart/${userId}`
        );
        setCartItems(res.data.items || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchCart();
    else setLoading(false);
  }, [userId]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = () => {
    if (!form.fullName || !form.address || !form.phone) {
      alert("Please fill required fields");
      return;
    }

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    setShowReview(true);
  };

  const handleNewAddress = () => {
    setShowReview(false);
    setForm({
      fullName: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: ""
    });
  };

  const confirmOrder = async (paymentStatus = "Pending") => {
  try {
    await axios.post(`${backendUrl}/placeOrder`, {
      userId,
      address: form,
      paymentMethod: payment,
      paymentStatus: paymentStatus,
    });

    setCartItems([]);
    setShowReview(false);

    navigate("/order-success");

  } catch (err) {
    console.log(err);
    alert("Failed to place order");
  }
};

  const handleRazorpayPayment = async () => {
    try {
      console.log("TOTAL:", total);

      const { data } = await axios.post(
        `${backendUrl}/api/payment/create-order`,
        { amount: total }
      );

      const options = {
        key: "rzp_test_SaXaAbphuqEtxN",
        amount: data.amount,
        currency: "INR",
        name: "SKINCARE",
        description: "Order Payment",
        order_id: data.id,

        handler: async function (response) {
        try {
          console.log(response);

          const verifyRes = await axios.post(
          `${backendUrl}/api/payment/verify`,
           response
          );

          if (verifyRes.data.success) {
            await confirmOrder("Paid");
            } else {
            alert("Payment verification failed");
          }

          } catch (err) {
            console.log(err);
            alert("Verification failed");
          }
        },
        
        prefill: {
          name: form.fullName,
          contact: form.phone,
        },

        theme: {
          color: "#3399cc",
        },

        modal: {
          ondismiss: function () {
            alert("Payment cancelled ");
          },
        },
      };

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.log(err);
      alert("Payment failed");
    }
  };

  return (
    <div className="checkout-page">

      <div className="checkout-left">
        <h2>Delivery Address</h2>

        <input name="fullName" placeholder="Full Name" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />

        <div className="row">
          <input name="city" placeholder="City" onChange={handleChange} />
          <input name="state" placeholder="State" onChange={handleChange} />
          <input name="pincode" placeholder="PIN Code" onChange={handleChange} />
        </div>

        <input name="phone" placeholder="Phone Number" onChange={handleChange} />

        <button className="pay-btn" onClick={handlePlaceOrder}>
          Place Order
        </button>

        {showReview && (
          <div className="checkout-page">
            <div className="checkout-left">

              <h2>Order Review</h2>

              <div className="review-box">
                <div className="review-header">
                  <h4>Delivery Address</h4>
                  <button className="edit-btn" onClick={handleNewAddress}>
                    + Add New
                  </button>
                </div>

                <p><strong>Name:</strong> {form.fullName}</p>
                <p><strong>Address:</strong> {form.address}</p>
                <p>
                  {form.city}, {form.state} - {form.pincode}
                </p>
                <p><strong>Phone:</strong> {form.phone}</p>
              </div>

              <div className="review-box">
                <h4>Products</h4>

                {cartItems.map((item) => (
                  <div className="review-item" key={item.productId}>
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}

                <hr />

                <div className="review-total">
                  <span>Total</span>
                  <strong>₹{total}</strong>
                </div>
              </div>

              <div className="review-box">
                <h4>Payment Method</h4>

                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="Cash on Delivery"
                    checked={payment === "Cash on Delivery"}
                    onChange={(e) => setPayment(e.target.value)}
                  />
                  Cash on Delivery (COD)
                </label>

                <label>
                  <input
                    type="radio"
                    name="payment"
                    value="Online Payment"
                    checked={payment === "Online Payment"}
                    onChange={(e) => setPayment(e.target.value)}
                  />
                  Online Payment
                </label>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowReview(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (!payment) {
                      alert("Please select payment method");
                      return;
                    }

                    if (payment === "Cash on Delivery") {
                      confirmOrder("Pending");
                    } else {
                      handleRazorpayPayment();
                    }
                  }}
                  className="confirm-btn"
                >
                  Confirm Order
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      <div className="checkout-right">
        <h2>Order Summary</h2>

        {cartItems.length === 0 ? (
          <p>No items in cart</p>
        ) : (
          cartItems.map((item) => (
            <div className="summary-item" key={item.productId}>
              <img
                src={`${backendUrl}/images/${item.image}`}
                alt=""
              />
              <div>
                <p>{item.name}</p>
                <p>Qty: {item.quantity}</p>
              </div>
              <h4>₹{item.price * item.quantity}</h4>
            </div>
          ))
        )}

        <hr />

        <div className="price-row">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

    </div>
  );
}

export default Checkout;