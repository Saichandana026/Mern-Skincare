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

    if (product.quantity === 0) {
      alert("Out of stock");
      return;
    }

    const res = await axios.post(`${backendUrl}/addToCart`, {
      userId: user.userId,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      gstRate: product.gstRate,
    });

    console.log("Added to cart", res.data);
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
};

  return (
    <div className="product-card">
    <div className="image-wrapper">
    <img src={product.image} alt={product.name} />
      {product.quantity === 0 && (
        <div className="out-of-stock">Out of Stock</div>
      )}
    </div>

      <h3>{product.name}</h3>
      <p>{product.category}</p>
      <p>₹{product.price?.toFixed(2)}</p>
      <p>Stock: {product.quantity}</p>

      <button className="buy-btn" onClick={handleBuyNow}
       disabled={product.quantity === 0}>
        View Product
      </button>

      <button
        className="cart-btn"
        onClick={handleAddToCart}
        disabled={product.quantity === 0}
      >
        {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}

export default ProductCard;