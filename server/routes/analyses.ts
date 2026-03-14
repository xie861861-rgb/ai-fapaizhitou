import { Router, Request, Response } from 'express';
import { dbGet, dbAll, dbRun } from '../db/index.js';
import { analyzeProperty } from '../services/ai.js';

const router = Router();

// Create new analysis
router.post('/', async (req: Request, res: Response) => {
  try {
    const { propertyId, userId = 1 } = req.body;

    // Get property data
    const property = dbGet('SELECT * FROM properties WHERE id = ?', [propertyId]);
    
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    // Run AI analysis
    const analysisResult = await analyzeProperty(property);

    // Save analysis to database
    dbRun(`
      INSERT INTO analyses (
        property_id, user_id, ai_predicted_price, risk_level, risk_factors,
        investment_rating, recommendations, market_analysis, loan_analysis
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      propertyId,
      userId,
      analysisResult.aiPredictedPrice,
      analysisResult.riskLevel,
      JSON.stringify(analysisResult.riskFactors),
      analysisResult.investmentRating,
      JSON.stringify(analysisResult.recommendations),
      analysisResult.marketAnalysis,
      analysisResult.loanAnalysis
    ]);

    // Get last inserted id
    const lastId = dbGet('SELECT last_insert_rowid() as id');

    // Update property with AI predicted price
    dbRun(`
      UPDATE properties SET ai_predicted_price = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [analysisResult.aiPredictedPrice, propertyId]);

    res.status(201).json({ 
      success: true, 
      data: { 
        id: lastId?.id,
        ...analysisResult
      } 
    });
  } catch (error) {
    console.error('Error creating analysis:', error);
    res.status(500).json({ success: false, error: 'Analysis failed' });
  }
});

// Get analysis for a property
router.get('/property/:propertyId', (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;

    const analysis = dbGet(`
      SELECT * FROM analyses WHERE property_id = ? ORDER BY created_at DESC LIMIT 1
    `, [propertyId]);

    if (!analysis) {
      return res.status(404).json({ success: false, error: 'No analysis found' });
    }

    res.json({ 
      success: true, 
      data: {
        ...analysis,
        risk_factors: analysis.risk_factors ? JSON.parse(analysis.risk_factors) : [],
        recommendations: analysis.recommendations ? JSON.parse(analysis.recommendations) : [],
      }
    });
  } catch (error) {
    console.error('Error getting analysis:', error);
    res.status(500).json({ success: false, error: 'Failed to get analysis' });
  }
});

// Get user analysis history
router.get('/history', (req: Request, res: Response) => {
  try {
    const userId = 1; // Demo user

    const analyses = dbAll(`
      SELECT a.*, p.title, p.location, p.images
      FROM analyses a
      JOIN properties p ON a.property_id = p.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT 20
    `, [userId]);

    const parsed = analyses.map((a: any) => ({
      ...a,
      risk_factors: a.risk_factors ? JSON.parse(a.risk_factors) : [],
      recommendations: a.recommendations ? JSON.parse(a.recommendations) : [],
      images: a.images ? JSON.parse(a.images) : [],
    }));

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ success: false, error: 'Failed to get history' });
  }
});

// Get all analyses (admin)
router.get('/', (req: Request, res: Response) => {
  try {
    const analyses = dbAll(`
      SELECT a.*, p.title, p.location, u.username
      FROM analyses a
      JOIN properties p ON a.property_id = p.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 50
    `);

    const parsed = analyses.map((a: any) => ({
      ...a,
      risk_factors: a.risk_factors ? JSON.parse(a.risk_factors) : [],
      recommendations: a.recommendations ? JSON.parse(a.recommendations) : [],
    }));

    res.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Error getting analyses:', error);
    res.status(500).json({ success: false, error: 'Failed to get analyses' });
  }
});

export default router;
