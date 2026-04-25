import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-col">
          <h2>MySkinCare.In</h2>
          <p>One Stop Online Wellness Clinic.</p>

          <h4>Find us on:</h4>
          <div className="social-icons">
            <i className="fab fa-facebook-f"></i>
            <i className="fab fa-instagram"></i>
          </div>
        </div>

        <div className="footer-col">
          <h3>Customer Support</h3>
          <ul>
            <li>Track your Order</li>
            <li>My Account</li>
            <li>Wishlist</li>
            <li>Contact us</li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Quick Shop</h3>
          <ul>
            <li>Face</li>
            <li>Body</li>
            <li>Hair</li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Company</h3>
          <ul>
            <li>About us</li>
            <li>Terms of Service</li>
            <li>Refund policy</li>
            <li>Shipping Policy</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p>Copyright © 2026 MySkinCare.in. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;