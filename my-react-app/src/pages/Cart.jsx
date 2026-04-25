import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Cart.css";
import { useNavigate } from "react-router-dom";

function Cart() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;

  const fetchCart = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`${backendUrl}/cart/${userId}`);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (userId) fetchCart();
  }, [userId]);

  const increaseQty = async (item) => {
    try {
      await axios.put(
        `${backendUrl}/cart/${userId}/${item.productId}`,
        { quantity: item.quantity + 1 }
      );
      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  const decreaseQty = async (item) => {
    try {
      await axios.put(
        `${backendUrl}/cart/${userId}/${item.productId}`,
        { quantity: item.quantity - 1 }
      );
      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${backendUrl}/cart/${userId}/${productId}`);
      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${backendUrl}/cart/${userId}`);
      fetchCart();
    } catch (err) {
      console.log(err);
    }
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>ITEM</th>
                <th>PRICE</th>
                <th>QUANTITY</th>
                <th>TOTAL</th>
                <th>REMOVE</th>
              </tr>
            </thead>

            <tbody>
              {cartItems.map((item) => (
                <tr key={item.productId}>
                  <td className="item-info">
                    <img
                      src={`${backendUrl}/images/${item.image}`}
                      alt={item.name}
                    />
                    <span>{item.name}</span>
                  </td>

                  <td>₹{item.price}</td>

                  <td>
                    <div className="qty-box">
                      <button onClick={() => decreaseQty(item)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQty(item)}>+</button>
                    </div>
                  </td>

                  <td>₹{item.price * item.quantity}</td>

                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-actions">
            <h3>Total: ₹{totalAmount.toFixed(2)}</h3>
          </div>

          <div className="cart-actions">
            <button onClick={() => navigate("/checkout")}>
              Continue Shopping
            </button>
            <button className="clear-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;