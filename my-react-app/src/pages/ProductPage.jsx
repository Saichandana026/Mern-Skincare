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
  const handleAddToCart = async () => {
  try {
    const res = await axios.post(`${backendUrl}/addToCart`, {
      userId: user?.userId,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
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
          src={`${backendUrl}/images/${product.image}`}
          alt={product.name}
          className="main-product-image"
        />
      </div>

      <div className="product-info-section">
        <h1>{product.name}</h1>
        <h3>{product.category}</h3>

        <p className="product-price">${product.price}</p>

        <div className="product-actions">
          <label>
            Quantity:
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value)))
              }
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