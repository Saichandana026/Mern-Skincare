import "./ProductCard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ProductCard({ product }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  if (!product) return null;

  const handleBuyNow = () => {
    navigate(`/product/${product._id}`);
  };

  const handleAddToCart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        alert("Please login first");
        return;
      }

      const res = await axios.post(
        `${backendUrl}/addToCart`,
        {
          userId: user.userId,
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        }
      );

      console.log("Added to cart", res.data);

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="product-card">
      <img src={product.image} />

      <h3>{product.name}</h3>
      <p>{product.category}</p>
      <p>${product.price}</p>
      <p>Stock: {product.quantity}</p>

      <button className="buy-btn" onClick={handleBuyNow}>
        View Product
      </button>

      <button className="cart-btn" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;