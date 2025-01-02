import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');

  // H�m x? l� khi nh?n Checkout
  const handleCheckout = async () => {
    try {
      const response = await axios.post('http://localhost:3000/checkout', {
        product_ids: cartItems.map((item) => item.product_id), // L?y danh s�ch product_id
      });
      setMessage(response.data.message);
      setCartItems([]); // L�m tr?ng gi? h�ng sau khi Checkout th�nh c�ng
    } catch (error) {
      setMessage('Error during checkout');
      console.error(error);
    }
  };

  // L?y d? li?u gi? h�ng t? API
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await axios.get('http://localhost:3000/cart');
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">Your Shopping Cart</h3>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`} role="alert">
          {message}
        </div>
      )}

      {cartItems.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-hover table-bordered">
            <thead>
              <tr className="table-dark text-center">
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price (?)</th>
                <th>Total (?)</th>
                <th>Image</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item: any) => (
                <tr key={item.id}>
                  <td className="text-center">{item.product_id}</td>
                  <td>{item.product_name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">{item.price.toLocaleString()}</td>
                  <td className="text-end">{item.total.toLocaleString()}</td>
                  <td className="text-center">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="img-fluid rounded"
                      style={{ width: '50px', height: '50px' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-warning text-center" role="alert">
          Your cart is empty. Please add some products.
        </div>
      )}

      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-success btn-lg" onClick={handleCheckout}>
          Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
