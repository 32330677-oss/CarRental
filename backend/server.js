const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection to Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test connection
pool.query('SELECT 1')
  .then(() => console.log('✅ Connected to Railway PostgreSQL'))
  .catch(err => console.error('❌ Database connection error:', err.message));

// ===== DEBUG ENDPOINT =====
app.get("/api/debug/db", async (req, res) => {
  try {
    const test1 = await pool.query('SELECT 1 as test_number');
    const test2 = await pool.query('SELECT COUNT(*) as car_count FROM cars');
    const test3 = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    
    res.json({
      success: true,
      tests: {
        connection: test1.rows[0],
        car_count: test2.rows[0].car_count,
        tables: test3.rows.map(row => row.table_name)
      }
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
      connection_string: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
    });
  }
});

// ===== CONTACT API =====
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ 
      success: false,
      error: "All fields are required" 
    });
  }

  try {
    const result = await pool.query(
      "INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, email, phone, subject, message]
    );
    
    res.json({
      success: true,
      message: "We will get back to you soon!",
      messageId: result.rows[0].id
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to save message to database" 
    });
  }
});

app.get("/api/contact/messages", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    res.json({
      success: true,
      messages: result.rows
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch messages" 
    });
  }
});

// ===== ADMIN LOGIN =====
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ 
      success: false,
      message: "Email and password are required" 
    });
  }

  try {
    const result = await pool.query(
      "SELECT id FROM admin_users WHERE email = $1 AND password = $2", 
      [email, password]
    );
    
    if (result.rows.length === 0) {
      return res.json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      userId: result.rows[0].id
    });
  } catch (err) {
    console.error("Login error:", err);
    res.json({ 
      success: false,
      message: "Database error" 
    });
  }
});

// ===== CAR API =====
app.get("/api/cars", async (req, res) => {
  console.log("🚗 Fetching all cars");
  
  try {
    const result = await pool.query(
      "SELECT * FROM cars WHERE available = TRUE ORDER BY name"
    );
    
    console.log(`✅ Found ${result.rows.length} cars`);
    res.json({
      success: true,
      cars: result.rows
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch cars" 
    });
  }
});

app.get("/api/cars/types", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT type FROM cars WHERE available = TRUE ORDER BY type"
    );
    
    const types = result.rows.map(row => row.type);
    res.json({
      success: true,
      types: ['All', ...types]
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch car types" 
    });
  }
});

app.get("/api/cars/:id", async (req, res) => {
  const carId = req.params.id;
  
  try {
    const result = await pool.query(
      "SELECT * FROM cars WHERE id = $1 AND available = TRUE",
      [carId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Car not found" 
      });
    }
    
    res.json({
      success: true,
      car: result.rows[0]
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch car details" 
    });
  }
});

// ===== BOOKING API =====
app.post("/api/bookings", async (req, res) => {
  const {
    car_id,
    user_name,
    user_email,
    user_phone,
    driver_license,
    pickup_date,
    return_date,
    total_days,
    total_price,
    special_requests = ''
  } = req.body;

  if (!car_id || !user_name || !user_email || !user_phone || !driver_license || !pickup_date || !return_date) {
    return res.status(400).json({
      success: false,
      error: "All required fields must be provided"
    });
  }

  try {
    // Check car exists
    const carResult = await pool.query(
      "SELECT id, name FROM cars WHERE id = $1 AND available = TRUE",
      [car_id]
    );

    if (carResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Car not found or not available"
      });
    }

    // Create booking
    const bookingResult = await pool.query(
      `INSERT INTO bookings 
       (car_id, user_name, user_email, user_phone, driver_license, pickup_date, return_date, total_days, total_price, special_requests, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
       RETURNING id`,
      [car_id, user_name, user_email, user_phone, driver_license, pickup_date, return_date, total_days, total_price, special_requests]
    );

    res.json({
      success: true,
      message: "Booking confirmed successfully!",
      bookingId: bookingResult.rows[0].id,
      carName: carResult.rows[0].name,
      totalPrice: total_price
    });
  } catch (err) {
    console.error("❌ Booking error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to save booking to database"
    });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        c.name as car_name,
        c.image_url as car_image,
        c.type as car_type
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      ORDER BY b.created_at DESC
    `);
    
    res.json({
      success: true,
      bookings: result.rows
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bookings"
    });
  }
});

app.get("/api/bookings/email/:email", async (req, res) => {
  const email = req.params.email;
  
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        c.name as car_name,
        c.image_url as car_image,
        c.type as car_type
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      WHERE b.user_email = $1
      ORDER BY b.created_at DESC
    `, [email]);
    
    res.json({
      success: true,
      bookings: result.rows
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bookings"
    });
  }
});

// ===== ROOT =====
app.get("/", (req, res) => {
  res.json({
    message: "AutoRental API Server (PostgreSQL)",
    status: "running",
    database: "Railway PostgreSQL",
    endpoints: {
      cars: "GET /api/cars",
      carDetails: "GET /api/cars/:id",
      carTypes: "GET /api/cars/types",
      contact: "POST /api/contact",
      login: "POST /api/admin/login",
      messages: "GET /api/contact/messages",
      bookings: "POST /api/bookings",
      debug: "GET /api/debug/db"
    }
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Database: Railway PostgreSQL`);
});