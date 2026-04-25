import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Search.css";

function Search() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!query) return;

        setLoading(true);

        const res = await fetch(
          `${backendUrl}/search?q=${query}`
        );

        const data = await res.json();

        setProducts(data);
      } catch (err) {
        console.log("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  return (
    <div className="search-container">
      <h2>Search Results for "{query}"</h2>
      
      <div className="product-list">
       
        {loading && <p>Loading...</p>}

     
        {!loading && products.length === 0 && (
          <p>No products found</p>
        )}

    
        {!loading &&
          products.length > 0 &&
          products.map((item) => (
            <div
              key={item._id}
              className="product-card"
              onClick={() => navigate(`/product/${item._id}`)}
            >
              <img
                src={`${backendUrl}/images/${item.image}`} 
                alt={item.name}
              />
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Search;