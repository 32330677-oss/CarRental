import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about">
      {}
      <section className="about-hero">
        <h1>About AutoRental</h1>
        <p>Your Trusted Partner in Car Rental and Auto Parts</p>
      </section>

      {}
      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          At AutoRental, we are committed to providing top-quality vehicles and genuine auto parts 
          to meet all your automotive needs. Whether you're planning a road trip, need a temporary 
          vehicle, or looking for reliable car parts, we've got you covered.
        </p>
      </section>

      {}
      <section className="about-section">
        <h2>Our Story</h2>
        <p>
          Founded with a passion for automobiles and customer satisfaction, AutoRental has been 
          serving the community for over a decade. We started as a small local rental service 
          and have grown into a comprehensive automotive solution provider, offering everything 
          from daily car rentals to premium auto parts.
        </p>
      </section>

      {}
      <section className="about-section">
        <h2>Why Choose AutoRental?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚗</div>
            <h3>Wide Selection</h3>
            <p>Choose from various car models and auto parts for every need and budget</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3>Quality Guaranteed</h3>
            <p>All our vehicles and parts undergo strict quality checks and maintenance</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛠️</div>
            <h3>Expert Support</h3>
            <p>Our team of automotive experts is always ready to assist you</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Best Prices</h3>
            <p>Competitive pricing with no hidden fees and flexible rental options</p>
          </div>
        </div>
      </section>

      {}
      <section className="stats-section">
        <div className="stat-item">
          <h3>500+</h3>
          <p>Happy Customers</p>
        </div>
        <div className="stat-item">
          <h3>50+</h3>
          <p>Vehicles Available</p>
        </div>
        <div className="stat-item">
          <h3>1000+</h3>
          <p>Parts in Stock</p>
        </div>
        <div className="stat-item">
          <h3>24/7</h3>
          <p>Customer Support</p>
        </div>
      </section>
    </div>
  );
}

export default About;