import { Router, Request, Response } from 'express';
import { dbAll, dbGet, dbRun } from '../db/index.js';

const router = Router();

// Middleware to check admin role
function requireAdmin(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const user = dbGet('SELECT u.role FROM users u JOIN user_tokens t ON u.id = t.user_id WHERE t.token = ?', [token]);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  
  next();
}

// Get all users (admin)
router.get('/users', requireAdmin, (req: Request, res: Response) => {
  try {
    const users = dbAll(`
      SELECT id, username, email, role, avatar, phone, points, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

// Update user (admin)
router.patch('/users/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, role, points, phone } = req.body;

    dbRun(`
      UPDATE users SET 
        username = COALESCE(?, username),
        role = COALESCE(?, role),
        points = COALESCE(?, points),
        phone = COALESCE(?, phone),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [username, role, points, phone, id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// Delete user (admin)
router.delete('/users/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    dbRun('DELETE FROM user_tokens WHERE user_id = ?', [id]);
    dbRun('DELETE FROM favorites WHERE user_id = ?', [id]);
    dbRun('DELETE FROM browse_history WHERE user_id = ?', [id]);
    dbRun('DELETE FROM analyses WHERE user_id = ?', [id]);
    dbRun('DELETE FROM recharge_orders WHERE user_id = ?', [id]);
    dbRun('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// Get all properties (admin)
router.get('/properties', requireAdmin, (req: Request, res: Response) => {
  try {
    const properties = dbAll(`
      SELECT * FROM properties ORDER BY created_at DESC
    `);
    res.json({ success: true, data: properties });
  } catch (error) {
    console.error('Error getting properties:', error);
    res.status(500).json({ success: false, error: 'Failed to get properties' });
  }
});

// Create property (admin)
router.post('/properties', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      title, location, starting_price, evaluation_price, ai_predicted_price,
      area, floor, built_date, usage_type, status, time_left,
      risk_level, difficulty_rating, loan_max_loan, loan_down_payment,
      loan_monthly_payment, tags, images, property_type, profit_potential,
      description, court, case_number
    } = req.body;

    dbRun(`
      INSERT INTO properties (
        title, location, starting_price, evaluation_price, ai_predicted_price,
        area, floor, built_date, usage_type, status, time_left,
        risk_level, difficulty_rating, loan_max_loan, loan_down_payment,
        loan_monthly_payment, tags, images, property_type, profit_potential,
        description, court, case_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, location, starting_price, evaluation_price, ai_predicted_price,
      area, floor, built_date, usage_type, status || 'pending', time_left,
      risk_level, difficulty_rating || 3, loan_max_loan, loan_down_payment,
      loan_monthly_payment, JSON.stringify(tags || []), JSON.stringify(images || []),
      property_type, profit_potential, description, court, case_number
    ]);

    const lastId = dbGet('SELECT last_insert_rowid() as id');
    res.json({ success: true, data: { id: lastId?.id } });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ success: false, error: 'Failed to create property' });
  }
});

// Update property (admin)
router.patch('/properties/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title, location, starting_price, evaluation_price, ai_predicted_price,
      area, floor, built_date, usage_type, status, time_left,
      risk_level, difficulty_rating, loan_max_loan, loan_down_payment,
      loan_monthly_payment, tags, images, property_type, profit_potential,
      description, court, case_number
    } = req.body;

    dbRun(`
      UPDATE properties SET
        title = COALESCE(?, title),
        location = COALESCE(?, location),
        starting_price = COALESCE(?, starting_price),
        evaluation_price = COALESCE(?, evaluation_price),
        ai_predicted_price = COALESCE(?, ai_predicted_price),
        area = COALESCE(?, area),
        floor = COALESCE(?, floor),
        built_date = COALESCE(?, built_date),
        usage_type = COALESCE(?, usage_type),
        status = COALESCE(?, status),
        time_left = COALESCE(?, time_left),
        risk_level = COALESCE(?, risk_level),
        difficulty_rating = COALESCE(?, difficulty_rating),
        loan_max_loan = COALESCE(?, loan_max_loan),
        loan_down_payment = COALESCE(?, loan_down_payment),
        loan_monthly_payment = COALESCE(?, loan_monthly_payment),
        tags = COALESCE(?, tags),
        images = COALESCE(?, images),
        property_type = COALESCE(?, property_type),
        profit_potential = COALESCE(?, profit_potential),
        description = COALESCE(?, description),
        court = COALESCE(?, court),
        case_number = COALESCE(?, case_number),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title, location, starting_price, evaluation_price, ai_predicted_price,
      area, floor, built_date, usage_type, status, time_left,
      risk_level, difficulty_rating, loan_max_loan, loan_down_payment,
      loan_monthly_payment, 
      tags ? JSON.stringify(tags) : null,
      images ? JSON.stringify(images) : null,
      property_type, profit_potential, description, court, case_number,
      id
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ success: false, error: 'Failed to update property' });
  }
});

// Delete property (admin)
router.delete('/properties/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    dbRun('DELETE FROM analyses WHERE property_id = ?', [id]);
    dbRun('DELETE FROM favorites WHERE property_id = ?', [id]);
    dbRun('DELETE FROM browse_history WHERE property_id = ?', [id]);
    dbRun('DELETE FROM properties WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ success: false, error: 'Failed to delete property' });
  }
});

// Get stats (admin)
router.get('/stats', requireAdmin, (req: Request, res: Response) => {
  try {
    const userCount = dbGet('SELECT COUNT(*) as count FROM users');
    const propertyCount = dbGet('SELECT COUNT(*) as count FROM properties');
    const analysisCount = dbGet('SELECT COUNT(*) as count FROM analyses');
    const orderCount = dbGet("SELECT COUNT(*) as count FROM recharge_orders WHERE status = 'paid'");
    
    res.json({
      success: true,
      data: {
        totalUsers: userCount?.count || 0,
        totalProperties: propertyCount?.count || 0,
        totalAnalyses: analysisCount?.count || 0,
        totalOrders: orderCount?.count || 0,
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

export default router;
