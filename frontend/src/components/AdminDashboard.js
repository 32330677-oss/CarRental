import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const [adminEmail, setAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); 
  

  const [stats, setStats] = useState({
    totalMessages: 0,
    todayMessages: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalCars: 0,
    availableCars: 0,
    totalRevenue: 0
  });
  
  // Data States
  const [recentMessages, setRecentMessages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState({
    bookings: false,
    cars: false,
    messages: false
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('adminEmail');
    
    if (!email) {
      navigate('/login');
      return;
    }
    
    setAdminEmail(email);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchContactMessages(),
        fetchBookings(),
        fetchCars()
      ]);
      
      calculateStats();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactMessages = async () => {
    try {
      const response = await fetch('https://car-rental-backend-2dji.onrender.com/api/contact/messages');
      const data = await response.json();
      
      if (data.success) {
        setAllMessages(data.messages || []);
        setRecentMessages(data.messages.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchBookings = async () => {
    setLoadingData(prev => ({ ...prev, bookings: true }));
    try {
      const response = await fetch('https://car-rental-backend-2dji.onrender.com/api/bookings');
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingData(prev => ({ ...prev, bookings: false }));
    }
  };

  const fetchCars = async () => {
    setLoadingData(prev => ({ ...prev, cars: true }));
    try {
      const response = await fetch('https://car-rental-backend-2dji.onrender.com/api/cars');
      const data = await response.json();
      
      if (data.success) {
        setCars(data.cars || []);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoadingData(prev => ({ ...prev, cars: false }));
    }
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate from fetched data
    const totalMessages = allMessages.length;
    const todayMessages = allMessages.filter(msg => 
      msg.created_at && msg.created_at.startsWith(today)
    ).length;
    
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(booking => 
      booking.status === 'confirmed' || booking.status === 'pending'
    ).length;
    
    const totalCars = cars.length;
    const availableCars = cars.filter(car => car.available).length;
    
    const totalRevenue = bookings
      .filter(booking => booking.status === 'confirmed' || booking.status === 'completed')
      .reduce((sum, booking) => sum + (parseFloat(booking.total_price) || 0), 0);
    
    setStats({
      totalMessages,
      todayMessages,
      totalBookings,
      activeBookings,
      totalCars,
      availableCars,
      totalRevenue: Math.round(totalRevenue)
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminId');
    navigate('/login');
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      
      const response = await fetch(`https://car-rental-backend-2dji.onrender.com/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`Booking ${bookingId} status updated to ${newStatus}`);
        fetchBookings(); 
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    
    try {
      
      const response = await fetch(`https://car-rental-backend-2dji.onrender.com/api/cars/${carId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Car deleted successfully');
        fetchCars(); 
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('Failed to delete car');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };
    
    return <span className={`status-badge ${statusColors[status] || ''}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
     
      <header className="dashboard-header">
        <div className="header-content">
          <h1>AutoRental Admin Panel</h1>
          <p className="admin-info">Logged in as: <strong>{adminEmail}</strong></p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      
      <div className="dashboard-nav">
        <button 
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          
        </button>
        <button 
          className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('bookings');
            fetchBookings();
          }}
        >
          
        </button>
        <button 
          className={`nav-btn ${activeTab === 'cars' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('cars');
            fetchCars();
          }}
        >
          🚗 Cars
        </button>
        <button 
          className={`nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('messages');
            fetchContactMessages();
          }}
        >
          📨 Messages
        </button>
      </div>

      
      <div className="dashboard-content">
        
        
        {activeTab === 'overview' && (
          <>
            <div className="stats-section">
              <h2>Dashboard Overview</h2>
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-details">
                    <h3>2</h3>
                    <p>Total Bookings</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-details">
                    <h3>{formatCurrency(stats.totalRevenue)}</h3>
                    <p>340000  $</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">🚗</div>
                  <div className="stat-details">
                    <h3>{stats.availableCars}/7</h3>
                    <p>Cars Available</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">📨</div>
                  <div className="stat-details">
                    <h3>3</h3>
                    <p>Today's Messages</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="recent-section">
              <div className="section-header">
                <h2>Recent Bookings</h2>
                <button onClick={() => setActiveTab('bookings')} className="view-all-btn">
                  View All
                </button>
              </div>
              
              {bookings.length > 0 ? (
                <div className="recent-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Car</th>
                        <th>Dates</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking.id}>
                          <td>#{booking.id}</td>
                          <td>
                            <div>{booking.user_name}</div>
                            <small>{booking.user_email}</small>
                          </td>
                          <td>{booking.car_name}</td>
                          <td>
                            <div>{booking.pickup_date}</div>
                            <small>to {booking.return_date}</small>
                          </td>
                          <td>{formatCurrency(booking.total_price)}</td>
                          <td>{getStatusBadge(booking.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  <p>No bookings yet.</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="actions-section">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button onClick={() => setActiveTab('bookings')} className="action-btn">
                  <span className="btn-icon">📅</span>
                  <span className="btn-text">Manage Bookings</span>
                </button>
                
                <button onClick={() => setActiveTab('cars')} className="action-btn">
                  <span className="btn-icon">🚗</span>
                  <span className="btn-text">Manage Cars</span>
                </button>
                
                <button onClick={() => setActiveTab('messages')} className="action-btn">
                  <span className="btn-icon">📨</span>
                  <span className="btn-text">View Messages</span>
                </button>
                
                <button onClick={() => navigate('/cars')} className="action-btn">
                  <span className="btn-icon">🌐</span>
                  <span className="btn-text">View Website</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>All Bookings</h2>
              <button onClick={fetchBookings} className="refresh-btn" disabled={loadingData.bookings}>
                {loadingData.bookings ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
            
            {loadingData.bookings ? (
              <div className="loading-data">
                <p>Loading bookings...</p>
              </div>
            ) : bookings.length > 0 ? (
              <div className="bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Car</th>
                      <th>Pickup Date</th>
                      <th>Return Date</th>
                      <th>Days</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>#{booking.id}</td>
                        <td>
                          <div><strong>{booking.user_name}</strong></div>
                          <div>{booking.user_email}</div>
                          <div>{booking.user_phone}</div>
                        </td>
                        <td>{booking.car_name}</td>
                        <td>{booking.pickup_date}</td>
                        <td>{booking.return_date}</td>
                        <td>{booking.total_days}</td>
                        <td><strong>{formatCurrency(booking.total_price)}</strong></td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td className="actions-cell">
                          <select 
                            value={booking.status}
                            onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">
                <p>No bookings found.</p>
              </div>
            )}
          </div>
        )}

       
        {activeTab === 'cars' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Manage Cars</h2>
              <button className="add-btn" onClick={() => alert('Add Car feature coming soon!')}>
                + Add New Car
              </button>
            </div>
            
            {loadingData.cars ? (
              <div className="loading-data">
                <p>Loading cars...</p>
              </div>
            ) : cars.length > 0 ? (
              <div className="cars-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Price/Day</th>
                      <th>Seats</th>
                      <th>Transmission</th>
                      <th>Available</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((car) => (
                      <tr key={car.id}>
                        <td>#{car.id}</td>
                        <td>
                          <div><strong>{car.name}</strong></div>
                          <small>{car.brand} {car.model}</small>
                        </td>
                        <td>{car.type}</td>
                        <td>{formatCurrency(car.price_per_day)}</td>
                        <td>{car.seats}</td>
                        <td>{car.transmission}</td>
                        <td>
                          <span className={`availability ${car.available ? 'available' : 'unavailable'}`}>
                            {car.available ? '✅ Available' : '❌ Unavailable'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button className="action-btn-small edit" onClick={() => alert(`Edit car ${car.id}`)}>
                            Edit
                          </button>
                          <button className="action-btn-small delete" onClick={() => handleDeleteCar(car.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">
                <p>No cars found.</p>
              </div>
            )}
          </div>
        )}

        
        {activeTab === 'messages' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Contact Messages</h2>
              <button onClick={fetchContactMessages} className="refresh-btn">
                🔄 Refresh
              </button>
            </div>
            
            {allMessages.length > 0 ? (
              <div className="messages-table-full">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMessages.map((message) => (
                      <tr key={message.id}>
                        <td>#{message.id}</td>
                        <td>{message.name}</td>
                        <td>{message.email}</td>
                        <td>{message.phone}</td>
                        <td>
                          <span className="subject-tag">{message.subject}</span>
                        </td>
                        <td className="message-cell">
                          <div className="message-preview">{message.message.substring(0, 100)}...</div>
                          <button className="view-message" onClick={() => alert(`Full message:\n\n${message.message}`)}>
                            View Full
                          </button>
                        </td>
                        <td>{formatDate(message.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data">
                <p>No messages found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>AutoRental Admin Panel © {new Date().getFullYear()} | Server Status: <span className="status-online">Online</span></p>
        <p>Total Bookings: {stats.totalBookings} | Total Revenue: {formatCurrency(stats.totalRevenue)}</p>
      </footer>
    </div>
  );
}

export default AdminDashboard;