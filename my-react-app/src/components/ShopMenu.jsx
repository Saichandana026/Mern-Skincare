import { Link } from "react-router-dom";
import "./ShopMenu.css";

function ShopMenu() {
  return (
    <div className="mega-menu">

      <div className="menu-column">
        <h4>Face Care</h4>
        <Link to="/search?q=cleanser">Cleanser</Link>
        <Link to="/search?q=serum">Serum</Link>
        <Link to="/search?q=moisturizer">Moisturizer</Link>
        <Link to="/search?q=sunscreen">Sunscreen</Link>
      </div>

     
      <div className="menu-column">
        <h4>Hair Care</h4>
        <Link to="/search?q=shampoo">Shampoo</Link>
        <Link to="/search?q=conditioner">Conditioner</Link>
        <Link to="/search?q=hair oil">Hair Oil</Link>
        <Link to="/search?q=hair serum">Hair Serum</Link>
      </div>

      
      <div className="menu-column">
        <h4>Body Care</h4>
        <Link to="/search?q=body lotion">Body Lotion</Link>
        <Link to="/search?q=body wash">Body Wash</Link>
        <Link to="/search?q=scrub">Body Scrub</Link>
        <Link to="/search?q=cream">Body Cream</Link>
      </div>

  
      <div className="menu-column">
        <h4>Essentials</h4>
        <Link to="/search?q=lip balm">Lip Balm</Link>
        <Link to="/search?q=face mask">Face Mask</Link>
        <Link to="/search?q=toner">Toner</Link>
        <Link to="/search?q=gift set">Gift Sets</Link>
      </div>

    </div>
  );
}

export default ShopMenu;