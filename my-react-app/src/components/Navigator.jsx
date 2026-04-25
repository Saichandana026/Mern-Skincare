import "./Navigator.css";
import ShopMenu from "./ShopMenu";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function Navigator() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [showShopMenu, setShowShopMenu] = useState(false); 

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;

  const fetchCartCount = async () => {
    try {
      if (!userId) return;

      const res = await axios.get(`${backendUrl}/cart/${userId}`);
      setCartCount(res.data?.items?.length || 0);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCartCount();

    const updateCart = () => fetchCartCount();
    window.addEventListener("cartUpdated", updateCart);

    return () => {
      window.removeEventListener("cartUpdated", updateCart);
    };
  }, [userId]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/search?q=${search}`);
    }
  };

  return (
    <>
      <div className="top-bar">
        Minimum Order ₹499. Free Shipping above ₹999.
      </div>

      <div className="navbar">
        <div className="nav-left">
          <span className="rx-text">Rx</span>
          <span>PRESCRIPTION</span>
          <span>ADVICE</span>

          <div className="shop-menu">
          <span onClick={() => setShowShopMenu(!showShopMenu)}>
          SHOP
          </span>

          {showShopMenu && (
            <div className="dropdown-wrapper">
              <ShopMenu />
            </div>
        )}
        </div>
          <span>BRANDS</span>
        </div>

        <div className="nav-logo">
          <img src="/image2.jpg" alt="logo" />
        </div>

        <div className="nav-right">
          {!user ? (
            <Link to="/login">LOGIN</Link>
          ) : (
            <>
              <Link to="/profile">PROFILE</Link>

              <span
                style={{ cursor: "pointer", color: "red" }}
                onClick={() => {
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
              >
                LOGOUT
              </span>
            </>
          )}

          <Link to="/wishlist">WISHLIST</Link>
          <Link to="/cart">CART ({cartCount})</Link>

          <span>CONSULTATION</span>
          <span>BLOG</span>
          <Link to="/about">ABOUT</Link>
        </div>
      </div>

      <div className="search-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search skincare products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>
    </>
  );
}

export default Navigator;