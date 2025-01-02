import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import Navbar from './components/Navbar';
import Cart from  './components/Cart';
import Login from './components/Login';
import BillList from './components/BillList';

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Navbar/>
        <Routes>
          <Route path="/login" element={<Login />}/>
          <Route path="/" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/add-products" element={<AddProduct />} />
          <Route path="/bills" element={<BillList/>}/>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
