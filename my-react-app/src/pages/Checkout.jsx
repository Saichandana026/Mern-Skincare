import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Checkout.css";

function Checkout() {

  console.log("NEW BUILD DEPLOYED");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  console.log("BACKEND URL:", backendUrl);

  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [payment, setPayment] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const [subtotal, setSubtotal] = useState(0);
  const [totalGST, setTotalGST] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

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
        const res = await axios.get(`${backendUrl}/cart/${userId}`);
        const items = res.data.items || [];
        setCartItems(items);
        calculateTotals(items);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchCart();
    else setLoading(false);
  }, [userId]);


  const calculateTotals = (items) => {
    let sub = 0;
    let gstTotal = 0;

    items.forEach((item) => {
      const itemTotal = item.price * item.quantity;

     
      const gst = (itemTotal * (item.gstRate || 0)) / 100;

      sub += itemTotal;
      gstTotal += gst;
    });

    setSubtotal(sub);
    setTotalGST(gstTotal);
    setGrandTotal(sub + gstTotal);
  };

  const getItemGST = (item) => {
  const itemTotal = item.price * item.quantity;
  return (itemTotal * (item.gstRate || 0)) / 100;
};


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
      const res = await axios.post(`${backendUrl}/api/placeOrder`, {
        userId,
        address: form,
        paymentMethod: payment,
        paymentStatus,
        totalGST,
        totalAmount: grandTotal,
        email: user?.email
      });

      console.log("ORDER SUCCESS:", res.data);
      setCartItems([]);
      setShowReview(false);
      return res.data; 
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("RESPONSE:", err.response);
      console.log("DATA:", err.response?.data);
      alert(err.response?.data?.message || err.message);
    }
  };


  const handleRazorpayPayment = async () => {
    try {
      console.log("GRAND TOTAL:", grandTotal);

      const { data } = await axios.post(
        `${backendUrl}/api/payment/create-order`,
        { amount: Math.round(grandTotal) } 
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
            setProcessingPayment(true); 
            console.log("STEP 1: Razorpay response", response);

            const verifyRes = await axios.post(
              `${backendUrl}/api/payment/verify`,
              response
            );

            console.log("STEP 2: Verify response", verifyRes.data);

            if (verifyRes.data.success) {
              console.log("STEP 3: Verification success");
              await confirmOrder("Paid");
              navigate("/order-success"); 
              console.log("STEP 4: Order placed");
            } else {
              console.log("STEP 3 FAILED");
              alert("Payment verification failed");
            }

          } catch (err) {
            console.log("ERROR:", err.response?.data || err.message);
            alert("Something failed after payment");
          } finally {
            setProcessingPayment(false);
          }
        },

        prefill: {
          name: form.fullName,
          contact: form.phone,
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: function () {
            alert("Payment cancelled");
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

      
      {processingPayment && (
        <div style={{
          position: "fixed", top: 0, left: 0,
          width: "100%", height: "100%",
          background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 9999
        }}>
          <div style={{
            color: "white", fontSize: "20px",
            background: "#333", padding: "24px 36px",
            borderRadius: "12px"
          }}>
             Processing your order...
          </div>
        </div>
      )}

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
                <p>{form.city}, {form.state} - {form.pincode}</p>
                <p><strong>Phone:</strong> {form.phone}</p>
              </div>

              <div className="review-box">
                <h4>Products</h4>

               {cartItems.map((item, index) => {
                  const itemTotal = item.price * item.quantity;
                  const gst = (itemTotal * (item.gstRate ?? 0)) / 100;
                  const final = itemTotal + gst;

                return (
                  <div className="product-row" key={index}>
                  <span className="p-name">{item.name}</span>
                  <span>₹{item.price}</span>
                  <span>Qty: {item.quantity}</span>
                  <span>GST ({item.gstRate ?? 0}%): ₹{gst.toFixed(2)}</span>
                  <span className="p-total">₹{final.toFixed(2)}</span>
                </div>
                  );
                })}

                <hr />

              
                <div className="review-total">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                {cartItems.map((item) => (
                  <div className="review-total" key={item.productId + "_gst"}
                    style={{ fontSize: "13px", color: "gray" }}>
                    <span>GST ({item.gstRate ?? 0}%) on {item.name}</span>
                    <span>₹{getItemGST(item).toFixed(2)}</span>
                  </div>
                ))}

                <div className="review-total">
                  <span>Total GST</span>
                  <span>₹{totalGST.toFixed(2)}</span>
                </div>

                <hr />

                <div className="review-total">
                  <span><strong>Grand Total</strong></span>
                  <strong>₹{grandTotal.toFixed(2)}</strong>
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
                  disabled={processingPayment}
                  onClick={async () => {
                    if (!payment) {
                      alert("Please select payment method");
                      return;
                    }
                    if (payment === "Cash on Delivery") {
                      const result = await confirmOrder("Pending");

                      if (result?.success) {
                        alert("Order Confirmed Successfully. Payment is Pending (Cash on Delivery).");
                        navigate("/");
                      }

                    } else {
                      handleRazorpayPayment();
                    }
                  }}
                  className="confirm-btn"
                >
                  {processingPayment ? "Processing..." : "Confirm Order"}
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
              <img src={item.image} alt={item.name} />
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
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        {cartItems.map((item) => (
          <div className="price-row" key={item.productId + "_gst"}
            style={{ fontSize: "13px", color: "gray" }}>
            <span>GST ({item.gstRate ?? 0}%) — {item.name}</span>
            <span>₹{getItemGST(item).toFixed(2)}</span>
          </div>
        ))}

        <div className="price-row">
          <span>Total GST</span>
          <span>₹{totalGST.toFixed(2)}</span>
        </div>

        <hr />

        <div className="price-row" style={{ fontWeight: "bold", fontSize: "16px" }}>
          <span>Grand Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
       

      </div>

    </div>
  );
}

export default Checkout;