import express from 'express';
import { auth, checkRole } from '../middleware/auth';
import pool from '../config/database';
import { AuthRequest } from '../types/auth';

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.email 
      FROM companies c 
      JOIN users u ON c.user_id = u.id 
      ORDER BY c.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT c.*, u.email,
        (SELECT json_agg(j.*) 
         FROM jobs j 
         WHERE j.company_id = c.id AND j.status = 'open'
        ) as open_positions
      FROM companies c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update company profile (Company only)
router.put('/:id', auth, checkRole(['company']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      industry,
      website,
      logo_url,
      location,
      employee_count,
    } = req.body;

    // Verify company owns this profile
    const company = await pool.query(
      'SELECT id FROM companies WHERE id = $1 AND user_id = $2',
      [id, req.user?.id]
    );

    if (company.rows.length === 0) {
      return res.status(404).json({ message: 'Company not found or unauthorized' });
    }

    const result = await pool.query(
      `UPDATE companies 
      SET name = $1, description = $2, industry = $3, website = $4, 
          logo_url = $5, location = $6, employee_count = $7 
      WHERE id = $8 RETURNING *`,
      [name, description, industry, website, logo_url, location, employee_count, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as companiesRouter };