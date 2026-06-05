import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProductPage.css";

function ProductPage() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    axios
      .get(`${backendUrl}/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  if (!product) return <p>Loading product...</p>;

  const user = JSON.parse(localStorage.getItem("user"));


  //add to cart
  const handleAddToCart = async () => {
  try {
      if (quantity > product.quantity) {
        alert(`Only ${product.quantity} items available`);
        return;
      }
      if (product.quantity === 0) {
        alert("Out of stock");
        return;
      }
    const res = await axios.post(`${backendUrl}/addToCart`, {
      userId: user?.userId,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      gstRate: product.gstRate
    });
    if (res.status === 200 || res.status === 201) {
      alert("Added to cart");
      setTimeout(() => {
        window.dispatchEvent(new Event("cartUpdated"));
      }, 200);
    }
  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
};

 

  return (
    <div className="product-page-container">
      <div className="product-image-section">
        <img
        src={product.image}
        alt={product.name}
        style={{ width: "80%" }}
        />
      </div>

      <div className="product-info-section">
        <h1>{product.name}</h1>
        <h3>{product.category}</h3>

        <p className="product-price">₹{product.price?.toFixed(2)}</p>

        <div className="product-actions">
          <label>
            Quantity:
            <input
              type="number"
              min="1"
              max={product.quantity}   
              value={quantity}
              onChange={(e) => {
                const val = Number(e.target.value);

                if (val > product.quantity) {
                  alert(`Only ${product.quantity} available`);
                  return;
                }

                setQuantity(Math.max(1, val));
              }}
            />
          </label>

          <button onClick={handleAddToCart}>
            Add to Cart
          </button>

          <button onClick={() => navigate("/checkout")}>
             Buy Now
            </button>
        </div>

        <div className="delivery-info">
          <p>Free delivery on orders above ₹500</p>
          <p>Ships in 2-3 days</p>
        </div>

        <div className="product-description">
          <h3>About Product</h3>
          <p>{product.description}</p>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;