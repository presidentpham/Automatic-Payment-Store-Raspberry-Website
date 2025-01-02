import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    axios.get('http://localhost:3000')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the products!', error);
      });
  }, []);

  const handleAddToCart = (product: Product) => {
    const transaction_id = 1; // Hardcoded for now
    const quantity = quantities[product.id] || 1;

    axios.post('http://localhost:3000/transaction_items', {
      product_id: product.id,
      product_name: product.name,
      quantity,
      price: product.price,
      image_url: product.image_url
    })
      .then(response => {
        alert('Product added to cart successfully!');
      })
      .catch(error => {
        console.error('There was an error adding the product to the cart!', error);
      });
  };

  const handleQuantityChange = (productId: number, value: string) => {
    const newQuantity = Math.max(1, parseInt(value) || 1);
    setQuantities({ ...quantities, [productId]: newQuantity });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Product List</h1>

      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-12 col-md-6 offset-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by product name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Product Cards */}
      <div className="row">
        {filteredProducts.map(product => (
          <div key={product.id} className="col-md-4 mb-4">
            <div className="card shadow-sm h-100">
              <img
                src={product.image_url}
                alt={product.name}
                className="card-img-top"
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text flex-grow-1">
                  {product.description}
                </p>
                <p className="card-text">
                  <strong>Price: </strong>${product.price}
                </p>
                <div>
                  <input
                    type="number"
                    min="1"
                    className="form-control mb-2"
                    placeholder="Quantity"
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                  />
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
