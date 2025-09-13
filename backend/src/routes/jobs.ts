import express from 'express';
import { auth, checkRole } from '../middleware/auth';
import pool from '../config/database';
import { AuthRequest } from '../types/auth';

const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT j.*, c.name as company_name, c.logo_url 
      FROM jobs j 
      JOIN companies c ON j.company_id = c.id 
      WHERE j.status = 'open' 
      ORDER BY j.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT j.*, c.name as company_name, c.logo_url, c.description as company_description
      FROM jobs j 
      JOIN companies c ON j.company_id = c.id 
      WHERE j.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create job (Company only)
router.post('/', auth, checkRole(['company']), async (req: AuthRequest, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      type,
      salary_range,
      deadline,
    } = req.body;

    const company = await pool.query(
      'SELECT id FROM companies WHERE user_id = $1',
      [req.user?.id]
    );

    if (company.rows.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const result = await pool.query(
      `INSERT INTO jobs (
        company_id, title, description, requirements, location, type, salary_range, deadline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        company.rows[0].id,
        title,
        description,
        requirements,
        location,
        type,
        salary_range,
        deadline,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update job (Company only)
router.put('/:id', auth, checkRole(['company']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      requirements,
      location,
      type,
      salary_range,
      deadline,
      status,
    } = req.body;

    const job = await pool.query(
      'SELECT j.* FROM jobs j JOIN companies c ON j.company_id = c.id WHERE j.id = $1 AND c.user_id = $2',
      [id, req.user?.id]
    );

    if (job.rows.length === 0) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }

    const result = await pool.query(
      `UPDATE jobs 
      SET title = $1, description = $2, requirements = $3, location = $4, 
          type = $5, salary_range = $6, deadline = $7, status = $8 
      WHERE id = $9 RETURNING *`,
      [title, description, requirements, location, type, salary_range, deadline, status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply for job (Student only)
router.post('/:id/apply', auth, checkRole(['student']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const student = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user?.id]
    );

    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if already applied
    const existingApplication = await pool.query(
      'SELECT * FROM applications WHERE job_id = $1 AND student_id = $2',
      [id, student.rows[0].id]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }

    const result = await pool.query(
      'INSERT INTO applications (job_id, student_id) VALUES ($1, $2) RETURNING *',
      [id, student.rows[0].id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as jobsRouter };