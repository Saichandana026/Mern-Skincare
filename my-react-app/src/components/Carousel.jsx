import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Carousel.css";

function Carousel({ data }) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) =>
        prev === data.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [data.length]);

  return (
    <div className="carousel">
      <img
        src={data[current].image}
        alt="slide"
        className="slide-image"
      />

      <div className="carousel-content">
        <p>MySkinCare.In</p>

        <h1>
          A One-Stop Online <br /> Wellness Clinic
        </h1>

        <p>For matters of the Skin and Body.</p>

        <button
          className="carousel-btn"
          onClick={() => navigate("/ProductCard")}
        >
          SHOP NOW
        </button>
      </div>

      <div className="dots">
        {data.map((_, index) => (
          <span
            key={index}
            className={`dot ${current === index ? "active" : ""}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;