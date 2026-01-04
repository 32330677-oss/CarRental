import React, { useState } from 'react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({...formData,[e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');

    try {
      const response = await fetch('http://car-rental-backend-2dji.onrender.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(data.message);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setSuccessMessage(data.error || 'Error sending message. Please try again.');
      }
    } catch (error) {
      setSuccessMessage('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact">
      <div className="contact-header">
        <h1>Contact Us</h1>
      </div>

      <div className="contact-content">
        <div className="contact-form-section">
          <form onSubmit={handleSubmit} className="contact-form">
            {successMessage && (
              <div className="alert-message">
                {successMessage}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Your email address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
                placeholder="Your phone number"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select a subject</option>
                <option value="appointment">Appointment Booking</option>
                <option value="consultation">General Consultation</option>
                <option value="emergency">Emergency</option>
                <option value="prescription">Prescription Renewal</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="form-control"
                placeholder="Your message"
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="contact-info">
          <div className="info-card">
            <h3>Get in Touch</h3>
            <div className="contact-details">
              <div className="contact-item">
                <strong>Email:</strong>
                <span>info@hamzacars.com</span>
              </div>
              <div className="contact-item">
                <strong>Phone:</strong>
                <span>+961 71 123 456</span>
              </div>
              <div className="contact-item">
                <strong>Address:</strong>
                <span>Center, Saida, Lebanon</span>
              </div>
              <div className="contact-item">
                <strong>Working Hours:</strong>
                <span>Mon-Fri: 8:00 AM - 6:00 PM</span>
              </div>
              <div className="contact-item">
                <strong>Emergency:</strong>
                <span>24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;