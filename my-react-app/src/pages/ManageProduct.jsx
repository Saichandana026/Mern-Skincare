import { useEffect, useState } from "react";
import axios from "axios";
import "./ManageProduct.css";
import { Link } from "react-router-dom";

function ManageProduct() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${backendUrl}/products`);
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${backendUrl}/delete-product/${id}`
      );
      fetchProducts();
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="manage-container">
      <h2>MANAGE PRODUCTS</h2>

      <table className="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                <img
                  src={`${backendUrl}/images/${product.image}`}
                  alt={product.name}
                  width="70"
                />
              </td>

              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{product.quantity}</td>
              <td>₹{product.price}</td>
              <td>{product.description}</td>

              <td>
                <div className="action-buttons">
                  <Link
                    to={`/update-product/${product._id}`}
                    className="edit-btn"
                  >
                    Edit
                  </Link>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(product._id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageProduct;