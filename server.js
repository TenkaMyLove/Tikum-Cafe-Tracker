import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

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

// Database Schema Migration: Update price range check constraints to allow values 1 to 15
async function runMigrations() {
  const connection = await pool.getConnection();
  try {
    console.log('Checking database constraints for price ranges...');
    
    // 1. Query constraints dynamically
    const [constraints] = await connection.query(`
      SELECT tc.CONSTRAINT_NAME, cc.CHECK_CLAUSE
      FROM information_schema.TABLE_CONSTRAINTS tc
      JOIN information_schema.CHECK_CONSTRAINTS cc 
        ON tc.CONSTRAINT_SCHEMA = cc.CONSTRAINT_SCHEMA 
        AND tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
      WHERE tc.TABLE_SCHEMA = DATABASE() 
        AND tc.TABLE_NAME = 'visits'
        AND tc.CONSTRAINT_TYPE = 'CHECK'
    `);

    // 2. Identify and drop constraints restricting food_price_range or beverage_price_range to 1-5
    for (const c of constraints) {
      const name = c.CONSTRAINT_NAME;
      const clause = c.CHECK_CLAUSE.toLowerCase();
      
      if (clause.includes('food_price_range') && (clause.includes('between 1 and 5') || clause.includes('<= 5'))) {
        console.log(`Dropping constraint ${name} containing food_price_range check: ${c.CHECK_CLAUSE}`);
        try {
          await connection.query(`ALTER TABLE visits DROP CONSTRAINT \`${name}\``);
        } catch (err) {
          console.error(`Failed to drop constraint ${name}:`, err.message);
        }
      }
      
      if (clause.includes('beverage_price_range') && (clause.includes('between 1 and 5') || clause.includes('<= 5'))) {
        console.log(`Dropping constraint ${name} containing beverage_price_range check: ${c.CHECK_CLAUSE}`);
        try {
          await connection.query(`ALTER TABLE visits DROP CONSTRAINT \`${name}\``);
        } catch (err) {
          console.error(`Failed to drop constraint ${name}:`, err.message);
        }
      }
    }

    // 3. Add the updated constraints
    try {
      await connection.query('ALTER TABLE visits ADD CONSTRAINT visits_chk_2 CHECK (food_price_range BETWEEN 1 AND 15)');
      console.log('✅ Added constraint visits_chk_2 (food_price_range BETWEEN 1 AND 15)');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('Constraint visits_chk_2 already exists.');
      } else {
        console.error('Failed to add constraint visits_chk_2:', err.message);
      }
    }

    try {
      await connection.query('ALTER TABLE visits ADD CONSTRAINT visits_chk_3 CHECK (beverage_price_range BETWEEN 1 AND 15)');
      console.log('✅ Added constraint visits_chk_3 (beverage_price_range BETWEEN 1 AND 15)');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('Constraint visits_chk_3 already exists.');
      } else {
        console.error('Failed to add constraint visits_chk_3:', err.message);
      }
    }

    // 4. Migrate users table for custom profiles
    console.log('Checking database columns for users table...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'users'
    `);
    const colNames = columns.map(c => c.COLUMN_NAME.toLowerCase());

    if (!colNames.includes('avatar')) {
      await connection.query('ALTER TABLE users ADD COLUMN avatar LONGTEXT NULL');
      console.log('✅ Added column users.avatar');
    }
    if (!colNames.includes('banner_color')) {
      await connection.query("ALTER TABLE users ADD COLUMN banner_color VARCHAR(50) DEFAULT '#8B5CF6'");
      console.log('✅ Added column users.banner_color');
    }
    if (!colNames.includes('bio')) {
      await connection.query('ALTER TABLE users ADD COLUMN bio TEXT NULL');
      console.log('✅ Added column users.bio');
    }
    if (!colNames.includes('custom_status')) {
      await connection.query("ALTER TABLE users ADD COLUMN custom_status VARCHAR(150) DEFAULT 'Partner in Caffeine'");
      console.log('✅ Added column users.custom_status');
    }

    console.log('🎉 Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Error during database migrations:', error.message);
  } finally {
    connection.release();
  }
}

// Test connection on startup and run migrations
pool.getConnection()
  .then(async conn => {
    console.log('✅ Successfully connected to the MySQL Database!');
    conn.release();
    await runMigrations();
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
          u.avatar AS userAvatar,
          u.custom_status AS userStatus,
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

// 2b. Update a Cafe Visit (Optimized Photo Management)
app.put('/api/visits/:id', async (req, res) => {
  const visitId = req.params.id;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name, rating, review, lat, lng, address,
      orderedItems, priceSpent, foodPriceRange, beveragePriceRange,
      userEmail, photo, boughtPhoto, menuPhoto
    } = req.body;

    // 1. Verify owner
    const [ownerCheck] = await connection.query(
      'SELECT user_email FROM visits WHERE id = ?',
      [visitId]
    );

    if (ownerCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Visit not found' });
    }

    if (ownerCheck[0].user_email !== userEmail) {
      await connection.rollback();
      return res.status(403).json({ error: 'Unauthorized to edit this visit' });
    }

    // 2. Update metadata in visits
    const updateVisitQuery = `
      UPDATE visits SET 
        name = ?, rating = ?, review = ?, lat = ?, lng = ?, address = ?,
        ordered_items = ?, price_spent = ?, food_price_range = ?, beverage_price_range = ?
      WHERE id = ?
    `;
    await connection.query(updateVisitQuery, [
      name, rating, review, lat, lng, address,
      orderedItems, priceSpent, foodPriceRange, beveragePriceRange, visitId
    ]);

    // 3. Fetch existing photos from DB
    const [existingPhotos] = await connection.query(
      'SELECT id, photo_url, photo_type FROM photos WHERE visit_id = ?',
      [visitId]
    );

    const existingCover = existingPhotos.find(p => p.photo_type === 'cover');
    const existingBought = existingPhotos.filter(p => p.photo_type === 'bought');
    const existingMenu = existingPhotos.filter(p => p.photo_type === 'menu');

    // A. Update Cover Photo
    if (photo !== (existingCover ? existingCover.photo_url : null)) {
      // Delete old cover
      if (existingCover) {
        await connection.query('DELETE FROM photos WHERE id = ?', [existingCover.id]);
      }
      // Insert new cover if provided
      if (photo) {
        await connection.query(
          'INSERT INTO photos (visit_id, photo_url, photo_type) VALUES (?, ?, "cover")',
          [visitId, photo]
        );
      }
    }

    // B. Update Bought Photos (Array)
    const submittedBought = Array.isArray(boughtPhoto) ? boughtPhoto : [];
    // Delete any old bought photos not present in the submitted array
    const boughtToDelete = existingBought.filter(p => !submittedBought.includes(p.photo_url));
    for (const p of boughtToDelete) {
      await connection.query('DELETE FROM photos WHERE id = ?', [p.id]);
    }
    // Insert any new bought photos not present in the DB
    const boughtToInsert = submittedBought.filter(pUrl => !existingBought.some(ep => ep.photo_url === pUrl));
    for (const pUrl of boughtToInsert) {
      await connection.query(
        'INSERT INTO photos (visit_id, photo_url, photo_type) VALUES (?, ?, "bought")',
        [visitId, pUrl]
      );
    }

    // C. Update Menu Photos (Array)
    const submittedMenu = Array.isArray(menuPhoto) ? menuPhoto : [];
    // Delete any old menu photos not present in the submitted array
    const menuToDelete = existingMenu.filter(p => !submittedMenu.includes(p.photo_url));
    for (const p of menuToDelete) {
      await connection.query('DELETE FROM photos WHERE id = ?', [p.id]);
    }
    // Insert any new menu photos not present in the DB
    const menuToInsert = submittedMenu.filter(pUrl => !existingMenu.some(ep => ep.photo_url === pUrl));
    for (const pUrl of menuToInsert) {
      await connection.query(
        'INSERT INTO photos (visit_id, photo_url, photo_type) VALUES (?, ?, "menu")',
        [visitId, pUrl]
      );
    }

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error('Transaction rolled back. Error updating visit:', error);
    res.status(500).json({ error: 'Failed to update visit and photos' });
  } finally {
    connection.release();
  }
});

// 2c. Delete a Cafe Visit
app.delete('/api/visits/:id', async (req, res) => {
  const visitId = req.params.id;
  const userEmail = req.headers['x-user-email'] || req.query.userEmail;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Verify owner
    const [ownerCheck] = await connection.query(
      'SELECT user_email FROM visits WHERE id = ?',
      [visitId]
    );

    if (ownerCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Visit not found' });
    }

    if (ownerCheck[0].user_email !== userEmail) {
      await connection.rollback();
      return res.status(403).json({ error: 'Unauthorized to delete this visit' });
    }

    // 2. Delete associated photos
    await connection.query('DELETE FROM photos WHERE visit_id = ?', [visitId]);

    // 3. Delete visit
    await connection.query('DELETE FROM visits WHERE id = ?', [visitId]);

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error('Transaction rolled back. Error deleting visit:', error);
    res.status(500).json({ error: 'Failed to delete visit' });
  } finally {
    connection.release();
  }
});

// 3. User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT email, name, role, password_hash, avatar, banner_color, bio, custom_status FROM users WHERE email = ?',
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

    res.json({ 
      email: user.email, 
      name: user.name, 
      role: user.role,
      avatar: user.avatar,
      banner_color: user.banner_color,
      bio: user.bio,
      custom_status: user.custom_status
    });
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

    res.status(201).json({ 
      email, 
      name, 
      role: role || 'admin',
      avatar: null,
      banner_color: '#8B5CF6',
      bio: '',
      custom_status: 'Partner in Caffeine'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 5. Get User Profile and Visit Stats
app.get('/api/users/:email', async (req, res) => {
  const email = req.params.email;
  try {
    const [rows] = await pool.query(
      'SELECT email, name, role, avatar, banner_color, bio, custom_status FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = rows[0];

    // Compute stats (Unique cafe spots count + total visit logs count)
    const [stats] = await pool.query(
      'SELECT COUNT(DISTINCT name) as visitedSpotCount, COUNT(*) as totalVisitsCount FROM visits WHERE user_email = ?',
      [email]
    );

    res.json({
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      banner_color: user.banner_color,
      bio: user.bio,
      custom_status: user.custom_status,
      stats: {
        visitedSpotCount: stats[0].visitedSpotCount || 0,
        totalVisitsCount: stats[0].totalVisitsCount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

// 6. Update User Profile (Self only)
app.put('/api/users/:email', async (req, res) => {
  const email = req.params.email;
  const requestingUserEmail = req.headers['x-user-email'] || req.body.requestingUserEmail;

  if (email !== requestingUserEmail) {
    return res.status(403).json({ error: 'Unauthorized to update this user profile' });
  }

  const { name, avatar, banner_color, bio, custom_status } = req.body;
  try {
    await pool.query(
      'UPDATE users SET name = ?, avatar = ?, banner_color = ?, bio = ?, custom_status = ? WHERE email = ?',
      [name, avatar, banner_color, bio, custom_status, email]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API Server running on http://localhost:${PORT}`));
