import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>AutoRental</h3>
          <p>Your trusted partner for car rentals and auto parts in Lebanon.</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/cars">Cars</a></li>
            <li><a href="/car-parts">Car Parts</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact Info</h4>
          <p>📍 Beirut Downtown, Lebanon</p>
          <p>📞 +961 76 789 034</p>
          <p>✉️ info@autorental.com</p>
        </div>
        
        <div className="footer-section">
          <h4>Business Hours</h4>
          <p>Mon - Sun: 7:00 AM - 11:00 PM</p>
          <p>24/7 Emergency Support</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 AutoRental. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;