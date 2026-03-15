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

    // Generate simple token
    const token = crypto.randomBytes(32).toString('hex');
    
    // 保存 token 到数据库
    dbRun('INSERT INTO user_tokens (user_id, token) VALUES (?, ?)', [user.id, token]);
    
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
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // 从 header 中提取 token (Bearer xxx)
    const token = authHeader.replace('Bearer ', '');
    
    // 从数据库查询 token 对应的用户
    const user = dbGet(`
      SELECT u.id, u.username, u.email, u.role, u.avatar, u.phone, u.created_at
      FROM users u
      JOIN user_tokens t ON u.id = t.user_id
      WHERE t.token = ?
    `, [token]);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
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
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { username, avatar, phone } = req.body;

    dbRun(`
      UPDATE users SET username = COALESCE(?, username), 
      avatar = COALESCE(?, avatar), 
      phone = COALESCE(?, phone),
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [username, avatar, phone, userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// Get user favorites
router.get('/favorites', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

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
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { propertyId } = req.body;

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
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { propertyId } = req.params;

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
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

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

// Get user points
router.get('/points', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = dbGet('SELECT points FROM users WHERE id = ?', [userId]);
    const orders = dbAll(`
      SELECT id, amount, points, status, payment_method, order_no, created_at, paid_at
      FROM recharge_orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [userId]);

    res.json({ 
      success: true, 
      data: { 
        points: user?.points || 0,
        orders 
      } 
    });
  } catch (error) {
    console.error('Error getting points:', error);
    res.status(500).json({ success: false, error: 'Failed to get points' });
  }
});

// Create recharge order
router.post('/recharge', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { amount, points } = req.body;
    if (!amount || !points) {
      return res.status(400).json({ success: false, error: 'Amount and points required' });
    }

    const orderNo = `RC${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
    
    dbRun(`
      INSERT INTO recharge_orders (user_id, amount, points, status, order_no)
      VALUES (?, ?, ?, 'pending', ?)
    `, [userId, amount, points, orderNo]);

    const order = dbGet('SELECT * FROM recharge_orders WHERE order_no = ?', [orderNo]);

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error creating recharge:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// Simulate payment callback (for demo)
router.post('/recharge/callback', (req: Request, res: Response) => {
  try {
    const { orderNo } = req.body;
    
    const order = dbGet('SELECT * FROM recharge_orders WHERE order_no = ?', [orderNo]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Update order status
    dbRun(`
      UPDATE recharge_orders SET status = 'paid', paid_at = CURRENT_TIMESTAMP
      WHERE order_no = ?
    `, [orderNo]);

    // Add points to user
    dbRun(`
      UPDATE users SET points = points + ? WHERE id = ?
    `, [order.points, order.user_id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, error: 'Payment failed' });
  }
});

// Get user ID from token
function getUserId(req: Request): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.replace('Bearer ', '');
  const user = dbGet('SELECT user_id FROM user_tokens WHERE token = ?', [token]);
  
  return user?.user_id || null;
}

// Send password reset code
router.post('/reset-code', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    // Check if user exists
    const user = dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) {
      // 为了安全，不提示用户邮箱是否存在
      return res.json({ success: true, message: 'If the email exists, a code will be sent' });
    }
    
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete old codes
    dbRun('DELETE FROM password_reset_codes WHERE user_id = ?', [user.id]);
    
    // Insert new code (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    dbRun('INSERT INTO password_resetCodes (user_id, code, expires_at) VALUES (?, ?, ?)', 
      [user.id, code, expiresAt]);
    
    // In production, send email here
    console.log(`Password reset code for ${email}: ${code}`);
    
    res.json({ success: true, message: 'If the email exists, a code will be sent' });
  } catch (error) {
    console.error('Error sending reset code:', error);
    res.status(500).json({ success: false, error: 'Failed to send reset code' });
  }
});

// Reset password with code
router.post('/reset-password', (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, code and new password are required' });
    }
    
    // Find user
    const user = dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Find valid code
    const resetCode = dbGet(`
      SELECT id FROM password_resetCodes 
      WHERE user_id = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
    `, [user.id, code]);
    
    if (!resetCode) {
      return res.status(400).json({ success: false, error: 'Invalid or expired code' });
    }
    
    // Update password
    const passwordHash = hashPassword(newPassword);
    dbRun('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
      [passwordHash, user.id]);
    
    // Mark code as used
    dbRun('UPDATE password_resetCodes SET used = 1 WHERE id = ?', [resetCode.id]);
    
    // Delete all tokens (force logout)
    dbRun('DELETE FROM user_tokens WHERE user_id = ?', [user.id]);
    
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
});

export default router;
