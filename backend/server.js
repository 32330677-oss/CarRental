const express = require("express");
const { Pool } = require("pg");  
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
});


const initDatabase = async () => {
  console.log("🔧 Initializing Railway database tables...");
  
  const client = await pool.connect();
  try {
  
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        brand VARCHAR(50),
        model VARCHAR(50),
        type VARCHAR(50) NOT NULL,
        year INTEGER,
        price_per_day NUMERIC(10,2) NOT NULL,
        seats INTEGER,
        transmission VARCHAR(20),
        fuel_type VARCHAR(20),
        features TEXT,
        description TEXT,
        image_url VARCHAR(255),
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
        user_name VARCHAR(100) NOT NULL,
        user_email VARCHAR(100) NOT NULL,
        user_phone VARCHAR(20) NOT NULL,
        driver_license VARCHAR(50) NOT NULL,
        pickup_date DATE NOT NULL,
        return_date DATE NOT NULL,
        total_days INTEGER NOT NULL,
        total_price NUMERIC(10,2) NOT NULL,
        special_requests TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    
    await client.query(`
      INSERT INTO admin_users (email, password) 
      VALUES ('admin@autorental.com', 'admin123')
      ON CONFLICT (email) DO NOTHING
    `);
    
 
    const carCount = await client.query('SELECT COUNT(*) FROM cars');
    if (parseInt(carCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO cars (name, brand, model, type, year, price_per_day, seats, transmission, fuel_type, features, description, image_url, available) VALUES
        ('Toyota Camry', 'Toyota', 'Camry', 'Sedan', 2023, 50.00, 5, 'Automatic', 'Gasoline', 'AC,Bluetooth,Navigation,Backup Camera', 'Comfortable and reliable sedan perfect for city driving.', 'toyota-camry.jpg', TRUE),
        ('Honda Civic', 'Honda', 'Civic', 'Sedan', 2024, 45.00, 5, 'Automatic', 'Gasoline', 'AC,Apple CarPlay,Android Auto,Safety Features', 'Stylish and fuel-efficient compact car.', 'honda-civic.jpg', TRUE),
        ('BMW X5', 'BMW', 'X5', 'SUV', 2023, 120.00, 7, 'Automatic', 'Gasoline', 'AC,Leather Seats,Sunroof,GPS,Parking Sensors', 'Luxury SUV with premium features and comfort.', 'bmw-x5.jpg', TRUE),
        ('Mercedes C-Class', 'Mercedes', 'C-Class', 'Luxury', 2024, 100.00, 5, 'Automatic', 'Gasoline', 'AC,Premium Sound,Heated Seats,Adaptive Cruise', 'Elegant and powerful luxury sedan.', 'mercedes-cclass.jpg', TRUE),
        ('Ford Mustang', 'Ford', 'Mustang', 'Sports', 2023, 150.00, 4, 'Manual', 'Gasoline', 'AC,Sports Mode,Performance Tires,Racing Seats', 'Iconic American muscle car for thrill seekers.', 'ford-mustang.jpg', TRUE),
        ('Toyota RAV4', 'Toyota', 'RAV4', 'SUV', 2024, 70.00, 5, 'Automatic', 'Hybrid', 'AC,All-Wheel Drive,Spacious Cargo,Safety Suite', 'Reliable SUV perfect for family trips.', 'toyota-rav4.jpg', TRUE),
        ('Hyundai Elantra', 'Hyundai', 'Elantra', 'Economy', 2024, 35.00, 5, 'Automatic', 'Gasoline', 'AC,Basic Features,Fuel Efficient', 'Affordable and practical daily driver.', 'hyundai-elantra.jpg', TRUE)
      `);
      console.log('✅ Inserted 7 sample cars into Railway');
    }
    
    console.log('✅ Railway database initialization complete');
  } catch (err) {
    console.error('❌ Database init error:', err.message);
  } finally {
    client.release();
  }
};


setTimeout(initDatabase, 3000);


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
    console.error(" Booking error:", err);
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
  console.log(` Server running on port ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` Database: Railway PostgreSQL`);
});