import "./UpdateProduct.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function UpdateProduct() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    axios
      .get(`${backendUrl}/products/${id}`)
      .then((res) => {
        setName(res.data.name);
        setImage(res.data.image);
        setCategory(res.data.category);
        setQuantity(res.data.quantity);
        setPrice(res.data.price);
        setDescription(res.data.description);
      })
      .catch((err) => console.log(err));
  }, [id]);

  const handleUpdate = (e) => {
    e.preventDefault();

    axios
      .put(`${backendUrl}/update-product/${id}`, {
        name,
        category,
        image,
        quantity: Number(quantity),
        price: Number(price),
        description,
      })
      .then(() => {
        alert("Product Updated Successfully");
        navigate("/manage-products");
      })
      .catch((err) => console.log(err));
  };

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

  return (
    <>
      <div className="overlay"></div>

      <div className="update-box">
        <center>
          <h2>UPDATE PRODUCT</h2>
        </center>

        <form onSubmit={handleUpdate}>
          <input
            type="text"
            placeholder="Enter Name"
            className="form-field"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="form-field"
            value={category}
            required
            onChange={(e) => setCategory(e.target.value)}
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

          {image && (
            <img
              src={
                image.startsWith("http")
                  ? image
                  : `${backendUrl}/images/${image}`
              }
              alt="product"
              style={{ width: "120px", marginTop: "10px" }}
            />
          )}

          <input
            type="number"
            className="form-field"
            placeholder="Enter Quantity"
            value={quantity}
            required
            onChange={(e) => setQuantity(e.target.value)}
          />

          <input
            type="number"
            className="form-field"
            placeholder="Enter Price"
            value={price}
            required
            onChange={(e) => setPrice(e.target.value)}
          />

          <textarea
            className="form-field textarea-field"
            placeholder="Enter Description"
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <button type="submit">Update Product</button>

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/manage-products")}
          >
            Back
          </button>
        </form>
      </div>
    </>
  );
}

export default UpdateProduct;