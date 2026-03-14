import { Router, Request, Response } from 'express';
import { dbGet, dbAll, dbRun } from '../db/index.js';
import crypto from 'crypto';

const router = Router();

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Register new user
router.post('/register', (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username, email and password are required' 
      });
    }

    // Check if user exists
    const existing = dbGet('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    
    if (existing) {
      return res.status(409).json({ 
        success: false, 
        error: 'Username or email already exists' 
      });
    }

    const passwordHash = hashPassword(password);
    
    dbRun(`
      INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)
    `, [username, email, passwordHash]);

    const lastId = dbGet('SELECT last_insert_rowid() as id');

    res.status(201).json({ 
      success: true, 
      data: { 
        id: lastId?.id, 
        username, 
        email 
      } 
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const passwordHash = hashPassword(password);
    const user = dbGet(`
      SELECT id, username, email, role, avatar, phone, created_at
      FROM users WHERE email = ? AND password_hash = ?
    `, [email, passwordHash]);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Generate simple token (in production, use JWT)
    const token = crypto.randomBytes(32).toString('hex');
    
    res.json({ 
      success: true, 
      data: { 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone
        },
        token 
      } 
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Get current user info
router.get('/me', (req: Request, res: Response) => {
  try {
    // In production, get user from JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // For now, return demo user
    const user = dbGet(`
      SELECT id, username, email, role, avatar, phone, created_at
      FROM users WHERE id = 1
    `);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ success: false, error: 'Failed to get user info' });
  }
});

// Update current user
router.put('/me', (req: Request, res: Response) => {
  try {
    const { username, avatar, phone } = req.body;

    // For demo, update user id 1
    dbRun(`
      UPDATE users SET username = COALESCE(?, username), 
      avatar = COALESCE(?, avatar), 
      phone = COALESCE(?, phone),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [username, avatar, phone]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// Get user favorites
router.get('/favorites', (req: Request, res: Response) => {
  try {
    // For demo, user id = 1
    const userId = 1;

    const favorites = dbAll(`
      SELECT p.*, f.created_at as favorited_at
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);

    const parsed = favorites.map((p: any) => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : [],
      images: p.images ? JSON.parse(p.images) : [],
    }));

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ success: false, error: 'Failed to get favorites' });
  }
});

// Add to favorites
router.post('/favorites', (req: Request, res: Response) => {
  try {
    const { propertyId } = req.body;
    const userId = 1; // Demo user

    // Check if already exists
    const existing = dbGet('SELECT id FROM favorites WHERE user_id = ? AND property_id = ?', [userId, propertyId]);
    
    if (!existing) {
      dbRun('INSERT INTO favorites (user_id, property_id) VALUES (?, ?)', [userId, propertyId]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ success: false, error: 'Failed to add favorite' });
  }
});

// Remove from favorites
router.delete('/favorites/:propertyId', (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const userId = 1;

    dbRun('DELETE FROM favorites WHERE user_id = ? AND property_id = ?', [userId, propertyId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
});

// Get browse history
router.get('/history', (req: Request, res: Response) => {
  try {
    const userId = 1;

    const history = dbAll(`
      SELECT p.*, h.viewed_at
      FROM browse_history h
      JOIN properties p ON h.property_id = p.id
      WHERE h.user_id = ?
      ORDER BY h.viewed_at DESC
      LIMIT 20
    `, [userId]);

    const parsed = history.map((p: any) => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : [],
      images: p.images ? JSON.parse(p.images) : [],
    }));

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ success: false, error: 'Failed to get history' });
  }
});

export default router;
