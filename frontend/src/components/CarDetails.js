import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CarDetails.css';


import honda from '../assets/Honda.png';
import bmw from '../assets/BMW.png';
import civic from '../assets/Civic.png';
import Mercedes from '../assets/Mercedes.png';

function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    returnDate: '',
    license: '',
    specialRequests: ''
  });

 
  const getCarImage = (car) => {
    if (!car) return civic;
    
    const carName = car.name.toLowerCase();
    const carImage = car.image_url ? car.image_url.toLowerCase() : '';
    
    if (carImage.includes('honda') || carName.includes('honda')) return honda;
    if (carImage.includes('bmw') || carName.includes('bmw')) return bmw;
    if (carImage.includes('toyota') || carName.includes('toyota') || carName.includes('camry')) return civic;
    if (carImage.includes('mercedes') || carName.includes('mercedes')) return Mercedes;
    if (carImage.includes('ford') || carName.includes('ford')) return civic;
    if (carImage.includes('hyundai') || carName.includes('hyundai')) return civic;
    
    return civic;
  };

  
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        console.log(`🔵 Fetching car details for ID: ${id}`);
        const response = await fetch(`https://car-rental-backend-2dji.onrender.com/api/cars/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('🟢 Car details response:', data);
        
        if (data.success) {
          console.log(`✅ Loaded car: ${data.car.name}`);
          setCar(data.car);
        } else {
          setBookingError(data.error || 'Car not found');
        }
      } catch (err) {
        console.error('❌ Error fetching car details:', err);
        setBookingError('Cannot connect to server. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const saveBookingToDatabase = async (bookingData) => {
    try {
      console.log('📤 Sending booking to server:', bookingData);
      
      const response = await fetch('https://car-rental-backend-2dji.onrender.com/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Booking saved successfully:', data);
        return { success: true, data };
      } else {
        console.error(' Booking failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('Error ', err);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!car) return;
    
    // Validate dates
    const pickupDate = new Date(formData.pickupDate);
    const returnDate = new Date(formData.returnDate);
    
    if (returnDate <= pickupDate) {
      setBookingError('Return date must be after pickup date');
      return;
    }
    
    const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.price_per_day;
    
    const bookingData = {
      car_id: car.id,
      user_name: formData.name,
      user_email: formData.email,
      user_phone: formData.phone,
      driver_license: formData.license,
      pickup_date: formData.pickupDate,
      return_date: formData.returnDate,
      total_days: days,
      total_price: totalPrice,
      special_requests: formData.specialRequests
    };
    
    setBookingLoading(true);
    setBookingError(null);
    
   
    const result = await saveBookingToDatabase(bookingData);
    
    setBookingLoading(false);
    
    if (result.success) {
      setBookingSuccess(true);
      
     
      alert(`✅ Booking confirmed!\n\nBooking ID: ${result.data.bookingId}\nCar: ${car.name}\nTotal: $${totalPrice} for ${days} days\n\nWe have sent a confirmation to ${formData.email}`);
      
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        pickupDate: '',
        returnDate: '',
        license: '',
        specialRequests: ''
      });
      
     
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } else {
      setBookingError(result.error || 'Failed to save booking. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading car details...</p>
      </div>
    );
  }

  if (bookingError && !car) {
    return (
      <div className="error-container">
        <h2>Error Loading Car</h2>
        <p>{bookingError}</p>
        <button onClick={() => navigate('/cars')} className="btn btn-primary">
          Back to Cars
        </button>
      </div>
    );
  }

  
  const days = formData.pickupDate && formData.returnDate 
    ? Math.ceil((new Date(formData.returnDate) - new Date(formData.pickupDate)) / (1000 * 60 * 60 * 24))
    : 0;
  const totalPrice = days * (car?.price_per_day || 0);

  return (
    <div className="car-details">
      {bookingSuccess && (
        <div className="booking-success">
          <h2>✅ Booking Successful!</h2>
          <p>Your booking has been confirmed. Redirecting to homepage...</p>
        </div>
      )}
      
      <div className="rental-header">
        <h1>Rent {car?.name}</h1>
        <div className="car-image-preview">
          <img src={getCarImage(car)} alt={car?.name} />
        </div>
        <div className="car-summary">
          <div className="car-meta">
            <span className="car-type">{car?.type}</span>
            <span className="car-price">${car?.price_per_day}/day</span>
            {car?.year && <span className="car-year">{car.year}</span>}
          </div>
          <p className="car-description">{car?.description}</p>
          
          {car?.features && (
            <div className="car-features-summary">
              <h4>Features:</h4>
              <div className="features-tags">
                {car.features.split(',').map((feature, index) => (
                  <span key={index} className="feature-tag">{feature.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rental-form">
        <h2>Rental Information</h2>
        
        {bookingError && (
          <div className="alert alert-error">
            {bookingError}
          </div>
        )}
        
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
            disabled={bookingLoading}
          />
        </div>

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            disabled={bookingLoading}
          />
        </div>

        <div className="form-group">
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+961 XX XXX XXX"
            required
            disabled={bookingLoading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Pick-up Date *</label>
            <input
              type="date"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
              disabled={bookingLoading}
            />
          </div>
          <div className="form-group">
            <label>Return Date *</label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              min={formData.pickupDate || new Date().toISOString().split('T')[0]}
              required
              disabled={bookingLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Driver License Number *</label>
          <input
            type="text"
            name="license"
            value={formData.license}
            onChange={handleChange}
            placeholder="License number"
            required
            disabled={bookingLoading}
          />
        </div>

        <div className="form-group">
          <label>Special Requests (Optional)</label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Any special requirements or notes..."
            rows="3"
            disabled={bookingLoading}
          />
        </div>

        
        {days > 0 && (
          <div className="price-summary">
            <h3>Price Summary</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Daily rate:</span>
                <span>${car?.price_per_day}/day</span>
              </div>
              <div className="summary-row">
                <span>Rental period:</span>
                <span>{days} days ({formData.pickupDate} to {formData.returnDate})</span>
              </div>
              <div className="summary-row total">
                <span>Total price:</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={bookingLoading}
        >
          {bookingLoading ? 'Processing...' : `Confirm Booking - $${totalPrice > 0 ? totalPrice : 'Calculate'}`}
        </button>
        
        <p className="form-note">
          * By confirming, you agree to our rental terms and conditions.
          A confirmation email will be sent to {formData.email || 'your email'}.
        </p>
      </form>
    </div>
  );
}

export default CarDetails;