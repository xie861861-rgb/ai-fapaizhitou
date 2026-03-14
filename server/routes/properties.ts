import { Router, Request, Response } from 'express';
import { dbGet, dbAll, dbRun } from '../db/index.js';

const router = Router();

// Get all properties with pagination and filters
router.get('/', (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      property_type, 
      risk_level,
      min_price,
      max_price,
      min_area,
      max_area,
      search 
    } = req.query;

    let sql = 'SELECT * FROM properties WHERE 1=1';
    const params: any[] = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (property_type) {
      sql += ' AND property_type = ?';
      params.push(property_type);
    }
    if (risk_level) {
      sql += ' AND risk_level = ?';
      params.push(risk_level);
    }
    if (min_price) {
      sql += ' AND starting_price >= ?';
      params.push(Number(min_price));
    }
    if (max_price) {
      sql += ' AND starting_price <= ?';
      params.push(Number(max_price));
    }
    if (min_area) {
      sql += ' AND area >= ?';
      params.push(Number(min_area));
    }
    if (max_area) {
      sql += ' AND area <= ?';
      params.push(Number(max_area));
    }
    if (search) {
      sql += ' AND (title LIKE ? OR location LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count total
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const totalResult = dbGet(countSql, params);
    const total = totalResult?.total || 0;

    // Add pagination
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit), offset);

    const properties = dbAll(sql, params);

    // Parse JSON fields
    const parsedProperties = properties.map((p: any) => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : [],
      images: p.images ? JSON.parse(p.images) : [],
    }));

    res.json({
      success: true,
      data: parsedProperties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch properties' });
  }
});

// Get single property by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = dbGet('SELECT * FROM properties WHERE id = ?', [id]);

    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    const parsed = {
      ...property,
      tags: property.tags ? JSON.parse(property.tags) : [],
      images: property.images ? JSON.parse(property.images) : [],
    };

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch property' });
  }
});

// Search properties
router.get('/search', (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, error: 'Search query required' });
    }

    const properties = dbAll(`
      SELECT * FROM properties 
      WHERE title LIKE ? OR location LIKE ? OR description LIKE ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [`%${q}%`, `%${q}%`, `%${q}%`]);

    const parsed = properties.map((p: any) => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : [],
      images: p.images ? JSON.parse(p.images) : [],
    }));

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// Create property (admin)
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      title, location, starting_price, evaluation_price, area, floor,
      built_date, usage_type, status, time_left, risk_level, difficulty_rating,
      loan_max_loan, loan_down_payment, loan_monthly_payment, tags, images,
      property_type, profit_potential, description, court, case_number
    } = req.body;

    dbRun(`
      INSERT INTO properties (
        title, location, starting_price, evaluation_price, area, floor,
        built_date, usage_type, status, time_left, risk_level, difficulty_rating,
        loan_max_loan, loan_down_payment, loan_monthly_payment, tags, images,
        property_type, profit_potential, description, court, case_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, location, starting_price, evaluation_price, area, floor,
      built_date, usage_type, status || 'pending', time_left, risk_level, difficulty_rating,
      loan_max_loan, loan_down_payment, loan_monthly_payment, 
      JSON.stringify(tags || []), JSON.stringify(images || []),
      property_type, profit_potential, description, court, case_number
    ]);

    // Get last inserted id
    const lastId = dbGet('SELECT last_insert_rowid() as id');
    
    res.status(201).json({ 
      success: true, 
      data: { id: lastId?.id } 
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ success: false, error: 'Failed to create property' });
  }
});

// Update property (admin)
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    // Build dynamic update query
    const updates = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);

    if (updates) {
      dbRun(`UPDATE properties SET ${updates}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ success: false, error: 'Failed to update property' });
  }
});

// Delete property (admin)
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    dbRun('DELETE FROM properties WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ success: false, error: 'Failed to delete property' });
  }
});

export default router;
