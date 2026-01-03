const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "RentCar"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection error:", err);
        return;
    }
    console.log("Connected to RentCar database");
});

app.post("/api/contact", (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !phone || !subject || !message) {
        return res.status(400).json({ 
            success: false,
            error: "All fields are required" 
        });
    }

    const query = "INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)";
    
    db.query(query, [name, email, phone, subject, message], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ 
                success: false,
                error: "Failed to save message to database" 
            });
        }
        
        res.json({
            success: true,
            message: "We will get back to you soon!",
            messageId: result.insertId
        });
    });
});

app.get("/api/contact/messages", (req, res) => {
    db.query("SELECT * FROM contact_messages ORDER BY created_at DESC", (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                error: "Failed to fetch messages" 
            });
        }
        
        res.json({
            success: true,
            messages: results
        });
    });
});

// ===== SIMPLE LOGIN API =====

app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ 
            success: false,
            message: "Email and password are required" 
        });
    }

    db.query("SELECT id FROM admin_users WHERE email = ? AND password = ?", 
        [email, password], 
        (err, results) => {
            if (err) {
                console.error("Login error:", err);
                return res.json({ 
                    success: false,
                    message: "Database error" 
                });
            }
            
            if (results.length === 0) {
                return res.json({ 
                    success: false,
                    message: "Invalid email or password" 
                });
            }

            res.json({
                success: true,
                message: "Login successful",
                userId: results[0].id
            });
        }
    );
});

// ===== CAR API ENDPOINTS =====

// GET ALL CARS
app.get("/api/cars", (req, res) => {
    console.log("🚗 Fetching all cars from database");
    
    const query = "SELECT * FROM cars WHERE available = TRUE ORDER BY name";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Database error fetching cars:", err);
            return res.status(500).json({ 
                success: false,
                error: "Failed to fetch cars from database" 
            });
        }
        
        console.log(`✅ Found ${results.length} cars`);
        res.json({
            success: true,
            cars: results
        });
    });
});

// GET CAR TYPES
app.get("/api/cars/types", (req, res) => {
    console.log("📋 Fetching car types");
    
    const query = "SELECT DISTINCT type FROM cars WHERE available = TRUE ORDER BY type";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Database error fetching types:", err);
            return res.status(500).json({ 
                success: false,
                error: "Failed to fetch car types" 
            });
        }
        
        const types = results.map(row => row.type);
        console.log(`✅ Found ${types.length} car types:`, types);
        
        res.json({
            success: true,
            types: ['All', ...types]  // Add 'All' option
        });
    });
});

// GET SINGLE CAR BY ID
app.get("/api/cars/:id", (req, res) => {
    const carId = req.params.id;
    console.log(`🚗 Fetching car with ID: ${carId}`);
    
    const query = "SELECT * FROM cars WHERE id = ? AND available = TRUE";
    
    db.query(query, [carId], (err, results) => {
        if (err) {
            console.error("❌ Database error fetching car:", err);
            return res.status(500).json({ 
                success: false,
                error: "Failed to fetch car details" 
            });
        }
        
        if (results.length === 0) {
            console.log("❌ Car not found or not available");
            return res.status(404).json({ 
                success: false,
                error: "Car not found" 
            });
        }
        
        console.log(`✅ Found car: ${results[0].name}`);
        res.json({
            success: true,
            car: results[0]
        });
    });
});

// ===== BOOKING API =====

// CREATE NEW BOOKING
app.post("/api/bookings", (req, res) => {
    console.log("📅 Creating new booking");
    console.log("Booking data:", req.body);
    
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

    // Validation
    if (!car_id || !user_name || !user_email || !user_phone || !driver_license || !pickup_date || !return_date) {
        return res.status(400).json({
            success: false,
            error: "All required fields must be provided"
        });
    }

    // Check if car exists and is available
    const checkCarQuery = "SELECT id, name, price_per_day FROM cars WHERE id = ? AND available = TRUE";
    
    db.query(checkCarQuery, [car_id], (checkErr, carResults) => {
        if (checkErr) {
            console.error("❌ Error checking car:", checkErr);
            return res.status(500).json({
                success: false,
                error: "Database error checking car availability"
            });
        }

        if (carResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Car not found or not available"
            });
        }

        // Insert booking
        const insertQuery = `
            INSERT INTO bookings 
            (car_id, user_name, user_email, user_phone, driver_license, pickup_date, return_date, total_days, total_price, special_requests, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;
        
        db.query(insertQuery, [
            car_id,
            user_name,
            user_email,
            user_phone,
            driver_license,
            pickup_date,
            return_date,
            total_days,
            total_price,
            special_requests
        ], (insertErr, result) => {
            if (insertErr) {
                console.error("❌ Database error creating booking:", insertErr);
                return res.status(500).json({
                    success: false,
                    error: "Failed to save booking to database"
                });
            }
            
            console.log(`✅ Booking created with ID: ${result.insertId}`);
            console.log(`💰 Total price: $${total_price} for ${total_days} days`);
            
            res.json({
                success: true,
                message: "Booking confirmed successfully!",
                bookingId: result.insertId,
                carName: carResults[0].name,
                totalPrice: total_price,
                bookingDate: new Date().toISOString()
            });
        });
    });
});

// GET ALL BOOKINGS (for admin)
app.get("/api/bookings", (req, res) => {
    console.log("📋 Fetching all bookings");
    
    const query = `
        SELECT 
            b.*,
            c.name as car_name,
            c.image_url as car_image,
            c.type as car_type
        FROM bookings b
        JOIN cars c ON b.car_id = c.id
        ORDER BY b.created_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Database error fetching bookings:", err);
            return res.status(500).json({
                success: false,
                error: "Failed to fetch bookings"
            });
        }
        
        console.log(`✅ Found ${results.length} bookings`);
        res.json({
            success: true,
            bookings: results
        });
    });
});

// GET BOOKINGS BY EMAIL (for customers to view their bookings)
app.get("/api/bookings/email/:email", (req, res) => {
    const email = req.params.email;
    console.log(`📧 Fetching bookings for email: ${email}`);
    
    const query = `
        SELECT 
            b.*,
            c.name as car_name,
            c.image_url as car_image,
            c.type as car_type
        FROM bookings b
        JOIN cars c ON b.car_id = c.id
        WHERE b.user_email = ?
        ORDER BY b.created_at DESC
    `;
    
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error("❌ Database error fetching user bookings:", err);
            return res.status(500).json({
                success: false,
                error: "Failed to fetch your bookings"
            });
        }
        
        console.log(`✅ Found ${results.length} bookings for ${email}`);
        res.json({
            success: true,
            bookings: results
        });
    });
});

// ===== ROOT ENDPOINT (for testing) =====
app.get("/", (req, res) => {
    res.json({
        message: "AutoRental API Server",
        status: "running",
        endpoints: {
            cars: "GET /api/cars",
            carDetails: "GET /api/cars/:id",
            carTypes: "GET /api/cars/types",
            contact: "POST /api/contact",
            login: "POST /api/admin/login",
            messages: "GET /api/contact/messages",
            bookings: "POST /api/bookings"
        }
    });
});

// ===== 404 HANDLER (MUST BE LAST!) =====
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
        method: req.method
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("🌐 Test URL: http://localhost:5000");
    console.log("📅 Booking endpoint: POST http://localhost:5000/api/bookings");
    console.log("🚗 Cars endpoint: GET http://localhost:5000/api/cars");
    console.log("🔑 Login endpoint: POST http://localhost:5000/api/admin/login");
});