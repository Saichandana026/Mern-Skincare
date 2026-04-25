import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-container">
      <div className="hero-section">
        <h1>About Our Skincare Store</h1>
        <p>Your one‑stop wellness solution for skin, body & hair care.</p>
      </div>

      <div className="about-content">
        <h2>Who We Are</h2>
        <p>
          We provide a blend of expert skincare advice, natural care, and the
          highest quality products delivered right to your doorstep.
          <br />
          Our products are carefully curated, dermatologist‑approved, and fully
          transparent with active ingredients listed for your confidence.
          <br />
          MySkinCare is a one-stop wellness solution for all your skin, body and hair care needs. We provide an amalgamation of medical knowledge, natural care and quality proven products - delivered to your doorstep!
          Brought to you by renowned dermatologists, we are India’s best online skincare store. We provide expert hair and skin advice from dermatologists and trichologists based on your specific concern. Book a consultation, 
          sign up for our award winning programs or choose from a wide array of products that are approved by our in-house skincare specialists.We have left no stone unturned to bring the best of products to you. Completely transparent - a list of active ingredients and a detailed description of all products are visible on the website. We vouch for the authenticity of every product we sell, as we source them directly from the manufacturers. Our safety standards ensure that we don’t sell products that are expired or near expiry date. In case of any query or concern, feel free to reach out to our inhouse doctors and experts before making a purchase.
        </p>
        
        <h2>What We Stand For</h2>
        <ul className="values-list">
          <li>100% Genuine Products</li>
          <li>Dermatologists Endorsed</li>
          <li>No Near‑Expiry or Expired Items</li>
          <li>Transparent Ingredients & Descriptions</li>
          <li>Customer‑First Support</li>
        </ul>

        <h2>Our Commitment</h2>
        <p>
          We ensure that every product you receive is authentic and safe. If
          you have questions or concerns, our team of experts is here to
          guide you.
        </p>

        <h2>Contact Us</h2>
        <p>
          Office Address: C‑16, Pamposh Enclave, New Delhi <br />
          Working Hours: Mon – Fri : 10am – 7pm <br />
          Email: info@example.com
        </p>
      </div>
    </div>
  );
}

export default About;