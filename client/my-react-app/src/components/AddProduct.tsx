import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddProduct: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct = {
      name,
      description,
      price: parseFloat(price),
      image_url: imageUrl,
    };

    fetch('http://localhost:3000/add-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    })
      .then(() => navigate('/'))
      .catch((err) => console.error('Error adding product:', err));
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">
        <i className="fas fa-plus-circle me-2"></i>Add Product
      </h2>
      <form onSubmit={handleSubmit} className="border p-4 shadow rounded bg-light">
        <div className="mb-3">
          <label htmlFor="productName" className="form-label">
            <i className="fas fa-tag me-2"></i>Name
          </label>
          <input
            type="text"
            id="productName"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="productDescription" className="form-label">
            <i className="fas fa-align-left me-2"></i>Description
          </label>
          <textarea
            id="productDescription"
            className="form-control"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="productPrice" className="form-label">
            <i className="fas fa-dollar-sign me-2"></i>Price
          </label>
          <input
            type="number"
            id="productPrice"
            className="form-control"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="productImageUrl" className="form-label">
            <i className="fas fa-image me-2"></i>Image URL
          </label>
          <input
            type="text"
            id="productImageUrl"
            className="form-control"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
        </div>
        <div className="text-center">
          <button type="submit" className="btn btn-primary">
            <i className="fas fa-save me-2"></i>Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
