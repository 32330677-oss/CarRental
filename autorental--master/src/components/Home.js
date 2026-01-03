import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import bmw from '../assets/BMW.png';
import honda from '../assets/Honda.png';
function Home() {
  const featuredCars = [
    {
      id: 1,
      name: "Toyota Camry",
      price: "$50/day",
      image: honda,
      description: "Comfortable andperfect for city driving."
    },
    {
      id: 2,
      name: "BMW X5",
      price: "$120/day",
      image: bmw,
      description: "Luxury premium features and comfort."
    }
  ];

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to AutoRental</h1>
          <p>Find your perfect car, auto parts</p>
          <div className="cta-buttons">
            <Link to="/cars" className="cta-btn">Rent a Car</Link>
          </div>
        </div>
      </section>

   
      <section className="featured-section">
        <h2>Featured Cars</h2>
        <div className="features-grid">
          {featuredCars.map(car => (
            <div key={car.id} className="feature-card">
              <div className="car-image">
                <img src={car.image} alt={car.name} />
              </div>
              <div className="feature-content">
                <h3>{car.name}</h3>
                <p className="car-price">{car.price}</p>
                <p className="car-description">{car.description}</p>
               
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;