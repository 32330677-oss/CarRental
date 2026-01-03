import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>AutoRental</h2>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/cars">Cars</Link>  
        <Link to="/contact">Contact</Link>
        <Link to="/login" className="btn-login">Login</Link>
      </div>
    </nav>
  );
}

export default Navbar;
