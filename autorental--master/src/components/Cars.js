import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Cars.css';

// Import your images
import honda from '../assets/Honda.png';
import bmw from '../assets/BMW.png';
import civic from '../assets/Civic.png';
import Mercedes from '../assets/Mercedes.png';

function Cars() {
  const [selectedType, setSelectedType] = useState('All');
  const [carTypes, setCarTypes] = useState(['All', 'Sedan', 'SUV', 'Sports', 'Luxury', 'Economy']);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cars from database on component mount
  useEffect(() => {
    fetchCars();
    fetchCarTypes();
  }, []);

  const fetchCars = async () => {
    try {
      console.log('🔵 Fetching cars from API...');
      const response = await fetch('http://localhost:5000/api/cars');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🟢 API response:', data);
      
      if (data.success) {
        console.log(`✅ Loaded ${data.cars.length} cars from database`);
        setCars(data.cars);
      } else {
        setError(data.error || 'Failed to load cars');
      }
    } catch (err) {
      console.error('❌ Error fetching cars:', err);
      setError('Cannot connect to server. Please make sure backend is running on http://localhost:5000');
      // Keep showing hardcoded cars as fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchCarTypes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cars/types');
      const data = await response.json();
      
      if (data.success) {
        setCarTypes(data.types);
      }
    } catch (err) {
      console.error('Error fetching car types:', err);
      // Use default types if API fails
    }
  };

  // Function to get image based on car data
  const getCarImage = (car) => {
    const carName = car.name.toLowerCase();
    const carImage = car.image_url ? car.image_url.toLowerCase() : '';
    
    // Check image name first
    if (carImage.includes('honda')) return honda;
    if (carImage.includes('bmw')) return bmw;
    if (carImage.includes('toyota') || carImage.includes('camry') || carImage.includes('rav4')) return civic;
    if (carImage.includes('mercedes')) return Mercedes;
    if (carImage.includes('ford')) return civic; // Use civic as placeholder for Ford
    if (carImage.includes('hyundai')) return civic; // Use civic as placeholder for Hyundai
    
    // Fallback to car name
    if (carName.includes('honda')) return honda;
    if (carName.includes('bmw')) return bmw;
    if (carName.includes('toyota')) return civic;
    if (carName.includes('mercedes')) return Mercedes;
    
    return civic; // Ultimate fallback
  };

  // Format features from database string to array
  const getFeaturesArray = (features) => {
    if (!features) return ['Automatic', 'AC', '4 Seats']; // Default
    return features.split(',').slice(0, 4); // Show max 4 features
  };

  const filteredCars = cars.filter(car => {
    const matchesType = selectedType === 'All' || car.type === selectedType;
    return matchesType;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading cars from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cars">
        <div className="cars-header">
          <h1>Available Cars</h1>
          <p className="error-message" style={{color: 'red'}}>{error}</p>
          <button onClick={fetchCars} className="retry-btn">Retry Connection</button>
        </div>
        
        {/* Show hardcoded cars as fallback */}
        <div className="cars-controls">
          <div className="types-filter">
            <h3>Car Types</h3>
            <div className="types-list">
              {carTypes.map(type => (
                <button
                  key={type}
                  className={`type-btn ${selectedType === type ? 'active' : ''}`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Hardcoded fallback cars */}
        <div className="cars-grid">
          {[
            {
              id: 1,
              name: "Toyota Camry",
              price_per_day: 50,
              type: "Sedan",
              description: "Comfortable and reliable sedan perfect for city driving.",
              features: "AC,Bluetooth,Navigation,Backup Camera"
            },
            {
              id: 2,
              name: "Honda Civic",
              price_per_day: 45,
              type: "Sedan",
              description: "Stylish and fuel-efficient compact car.",
              features: "AC,Apple CarPlay,Android Auto,Safety Features"
            },
            {
              id: 3,
              name: "BMW X5",
              price_per_day: 120,
              type: "SUV",
              description: "Luxury SUV with premium features and comfort.",
              features: "AC,Leather Seats,Sunroof,GPS,Parking Sensors"
            },
            {
              id: 4,
              name: "Mercedes C-Class",
              price_per_day: 100,
              type: "Luxury",
              description: "Elegant and powerful luxury sedan.",
              features: "AC,Premium Sound,Heated Seats,Adaptive Cruise"
            }
          ].filter(car => selectedType === 'All' || car.type === selectedType)
          .map(car => (
            <div key={car.id} className="car-card">
              <div className="car-image">
                <img src={getCarImage(car)} alt={car.name} />
              </div>
              <div className="car-info">
                <div className="car-header">
                  <h3>{car.name}</h3>
                  <span className="car-price">${car.price_per_day}/day</span>
                </div>
                <p className="car-type">{car.type}</p>
                <p className="car-description">{car.description}</p>
                <div className="car-features">
                  {getFeaturesArray(car.features).map((feature, index) => (
                    <span key={index} className="feature-tag">{feature.trim()}</span>
                  ))}
                </div>
                <Link to={`/CarDetails/${car.id}`} className="btn btn-primary">Rent a Car</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cars">
      <div className="cars-header">
        <h1>Available Cars</h1>
        <p className="cars-count">{filteredCars.length} cars available</p>
      </div>

      <div className="cars-controls">
        <div className="types-filter">
          <h3>Car Types</h3>
          <div className="types-list">
            {carTypes.map(type => (
              <button
                key={type}
                className={`type-btn ${selectedType === type ? 'active' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cars-grid">
        {filteredCars.map(car => (
          <div key={car.id} className="car-card">
            <div className="car-image">
              <img src={getCarImage(car)} alt={car.name} />
            </div>
            <div className="car-info">
              <div className="car-header">
                <h3>{car.name}</h3>
                <span className="car-price">${car.price_per_day}/day</span>
              </div>
              <p className="car-type">{car.type}</p>
              <p className="car-description">{car.description}</p>
              <div className="car-features">
                {getFeaturesArray(car.features).map((feature, index) => (
                  <span key={index} className="feature-tag">{feature.trim()}</span>
                ))}
              </div>
              <Link to={`/CarDetails/${car.id}`} className="btn btn-primary">Rent a Car</Link>
            </div>
          </div>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="no-cars">
          <p>No cars found matching "{selectedType}".</p>
          <button onClick={() => setSelectedType('All')} className="btn btn-secondary">
            Show All Cars
          </button>
        </div>
      )}
    </div>
  );
}

export default Cars;