// PostgreSQL connection to Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true
  }
});

// Auto-create tables and insert sample data
const initDatabase = async () => {
  console.log("🔧 Initializing Railway database tables...");
  
  const client = await pool.connect();
  try {
    // Create tables
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
    
    // Insert admin user
    await client.query(`
      INSERT INTO admin_users (email, password) 
      VALUES ('admin@autorental.com', 'admin123')
      ON CONFLICT (email) DO NOTHING
    `);
    
    // Insert sample cars if empty
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

// Initialize database after 3 seconds
setTimeout(initDatabase, 3000);