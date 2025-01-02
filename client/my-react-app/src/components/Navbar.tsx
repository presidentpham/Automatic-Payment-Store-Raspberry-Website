import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaPlus, FaSignInAlt } from 'react-icons/fa'; // Import c�c icon t? react-icons
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-primary" to="/">
          SMART STORE
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item mx-2">
              <Link className="nav-link d-flex align-items-center" to="/cart">
                <FaShoppingCart className="me-2" />
                Cart
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link d-flex align-items-center" to="/add-products">
                <FaPlus className="me-2" />
                Add Product
              </Link>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link d-flex align-items-center" to="/login">
                <FaSignInAlt className="me-2" />
                Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
