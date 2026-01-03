import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      console.log('🔵 [FRONTEND] Sending login request...');
      console.log('📤 Data being sent:', formData);
      
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('🟡 [FRONTEND] Response status:', response.status);
      
      const data = await response.json();
      console.log('🟢 [FRONTEND] Response data:', data);
      
      if (data.success) {
        console.log('✅ [FRONTEND] Login successful!');
        localStorage.setItem('adminEmail', formData.email);
        localStorage.setItem('adminId', data.userId);
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        console.log('❌ [FRONTEND] Login failed:', data.message);
        setErrorMessage(data.message || 'Login failed');
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Admin Login</h2>
        </div>

        {errorMessage && (
          <div className="alert-error">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              placeholder="Email"
              required
              
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Login'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;