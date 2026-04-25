import "./AddProduct.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function AddProduct() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Please select image");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        `${backendUrl}/upload`,
        formData
      );

      setImage(res.data.image);
      alert("Image uploaded successfully");
    } catch (err) {
      console.log(err);
      alert("Image upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload image first");
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/add-product`,
        {
          name,
          category,
          image,
          quantity: Number(quantity),
          price: Number(price),
          description,
        }
      );

      alert(res.data.message);
      navigate("/admin-dashboard");
    } catch (err) {
      console.log(err);
      alert("Failed to add product");
    }
  };

  return (
    <>
      <div className="overlay"></div>

      <div className="register-box">
        <h2>ADD PRODUCT</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            className="form-field"
            onChange={(e) => setName(e.target.value)}
            required
          />

          <select
            className="form-field"
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            <option value="Face Care">Face Care</option>
            <option value="Hair Care">Hair Care</option>
            <option value="Body Care">Body Care</option>
            <option value="Makeup">Makeup</option>
          </select>

          <input
            type="file"
            className="form-field"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button type="button" onClick={handleUpload}>
            Upload Image
          </button>

          <input
            type="number"
            placeholder="Quantity"
            className="form-field"
            onChange={(e) => setQuantity(e.target.value)}
            required
          />

          <input
            type="number"
            placeholder="Price"
            className="form-field"
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <textarea
            placeholder="Description"
            className="form-field"
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <button type="submit">SUBMIT</button>
        </form>
      </div>
    </>
  );
}

export default AddProduct;