const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large payload support for multi-photo base64 uploads

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cafe_journal_db',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ Successfully connected to the MySQL Database!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed. Verify your .env credentials!', err.message);
  });

// --- API ENDPOINTS ---

// 1. Get All Cafe Visits (Your exact MySQL aggregate query)
app.get('/api/visits', async (req, res) => {
  try {
    const query = `
      SELECT 
          v.id,
          v.name,
          v.rating,
          v.review,
          v.lat,
          v.lng,
          v.address,
          v.ordered_items AS orderedItems,
          v.price_spent AS priceSpent,
          v.food_price_range AS foodPriceRange,
          v.beverage_price_range AS beveragePriceRange,
          v.visit_date AS date,
          u.name AS user,
          u.email AS userEmail,
          (
              SELECT p.photo_url
              FROM photos p
              WHERE p.visit_id = v.id
                AND p.photo_type = 'cover'
              LIMIT 1
          ) AS photo,
          COALESCE(
              (
                  SELECT JSON_ARRAYAGG(p.photo_url)
                  FROM photos p
                  WHERE p.visit_id = v.id
                    AND p.photo_type = 'bought'
              ),
              JSON_ARRAY()
          ) AS boughtPhoto,
          COALESCE(
              (
                  SELECT JSON_ARRAYAGG(p.photo_url)
                  FROM photos p
                  WHERE p.visit_id = v.id
                    AND p.photo_type = 'menu'
              ),
              JSON_ARRAY()
          ) AS menuPhoto
      FROM visits v
      JOIN users u ON v.user_email = u.email
      ORDER BY v.visit_date DESC;
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ error: 'Failed to retrieve visits from database' });
  }
});

// 2. Create a Cafe Visit (Atomic Transaction)
app.post('/api/visits', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name, rating, review, lat, lng, address,
      orderedItems, priceSpent, foodPriceRange, beveragePriceRange,
      userEmail, photo, boughtPhoto, menuPhoto
    } = req.body;

    // Generate unique ID for the visit in Node
    const [uuidResult] = await connection.query('SELECT UUID() as uuid');
    const visitId = uuidResult[0].uuid;

    // A. Insert into visits
    const insertVisitQuery = `
      INSERT INTO visits (
        id, name, rating, review, lat, lng, address,
        ordered_items, price_spent, food_price_range, beverage_price_range, user_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await connection.query(insertVisitQuery, [
      visitId, name, rating, review, lat, lng, address,
      orderedItems, priceSpent, foodPriceRange, beveragePriceRange, userEmail
    ]);

    // B. Insert Primary Cover Photo
    if (photo) {
      await connection.query(
        'INSERT INTO photos (visit_id, photo_url, photo_type) VALUES (?, ?, "cover")',
        [visitId, photo]
      );
    }

    // C. Insert Multiple Items Bought Photos
    if (boughtPhoto && Array.isArray(boughtPhoto) && boughtPhoto.length > 0) {
      for (const pUrl of boughtPhoto) {
        await connection.query(
          'INSERT INTO photos (visit_id, photo_url, photo_type) VALUES (?, ?, "bought")',
          [visitId, pUrl]
        );
      }
    }

    // D. Insert Multiple Menu Photos
    if (menuPhoto && Array.isArray(menuPhoto) && menuPhoto.length > 0) {
      for (const pUrl of menuPhoto) {
        await connection.query(
          'INSERT INTO photos (visit_id, photo_url, photo_type) VALUES (?, ?, "menu")',
          [visitId, pUrl]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ success: true, visitId });
  } catch (error) {
    await connection.rollback();
    console.error('Transaction rolled back. Error:', error);
    res.status(500).json({ error: 'Failed to save visit and associated photos' });
  } finally {
    connection.release();
  }
});

// 3. User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT email, name, role, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const user = rows[0];
    // Plain text comparison to match local registry logic
    if (password !== user.password_hash) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    res.json({ email: user.email, name: user.name, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// 4. User Registration
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    // Check if email already exists
    const [exists] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
    if (exists.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    await pool.query(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, password, name, role || 'admin']
    );

    res.status(201).json({ email, name, role: role || 'admin' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API Server running on http://localhost:${PORT}`));
