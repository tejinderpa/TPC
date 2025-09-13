import express from 'express';
import { auth, checkRole } from '../middleware/auth';
import pool from '../config/database';
import { AuthRequest } from '../types/auth';

const router = express.Router();

// Get all alumni
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, u.email,
        (SELECT json_agg(mp.*)
         FROM mentorship_posts mp
         WHERE mp.alumni_id = a.id AND mp.end_date > CURRENT_TIMESTAMP
        ) as active_mentorship_posts
      FROM alumni a
      JOIN users u ON a.user_id = u.id
      ORDER BY a.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get alumni by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT a.*, u.email,
        (SELECT json_agg(mp.*)
         FROM mentorship_posts mp
         WHERE mp.alumni_id = a.id
        ) as mentorship_posts
      FROM alumni a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Alumni not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update alumni profile (Alumni only)
router.put('/:id', auth, checkRole(['alumni']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      batch,
      degree,
      branch,
      company,
      position,
      location,
      linkedin_url,
      experience,
    } = req.body;

    // Verify alumni owns this profile
    const alumni = await pool.query(
      'SELECT id FROM alumni WHERE id = $1 AND user_id = $2',
      [id, req.user?.id]
    );

    if (alumni.rows.length === 0) {
      return res.status(404).json({ message: 'Alumni not found or unauthorized' });
    }

    const result = await pool.query(
      `UPDATE alumni 
      SET name = $1, batch = $2, degree = $3, branch = $4, company = $5,
          position = $6, location = $7, linkedin_url = $8, experience = $9
      WHERE id = $10 RETURNING *`,
      [name, batch, degree, branch, company, position, location, linkedin_url, experience, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create mentorship post (Alumni only)
router.post('/:id/mentorship', auth, checkRole(['alumni']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      topic,
      start_date,
      end_date,
      max_students,
    } = req.body;

    // Verify alumni owns this profile
    const alumni = await pool.query(
      'SELECT id FROM alumni WHERE id = $1 AND user_id = $2',
      [id, req.user?.id]
    );

    if (alumni.rows.length === 0) {
      return res.status(404).json({ message: 'Alumni not found or unauthorized' });
    }

    const result = await pool.query(
      `INSERT INTO mentorship_posts (
        alumni_id, title, description, topic, start_date, end_date, max_students
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, title, description, topic, start_date, end_date, max_students]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply for mentorship (Student only)
router.post('/mentorship/:postId/apply', auth, checkRole(['student']), async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const { message } = req.body;

    const student = await pool.query(
      'SELECT id FROM students WHERE user_id = $1',
      [req.user?.id]
    );

    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if already applied
    const existingApplication = await pool.query(
      'SELECT * FROM mentorship_applications WHERE post_id = $1 AND student_id = $2',
      [postId, student.rows[0].id]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ message: 'Already applied to this mentorship' });
    }

    const result = await pool.query(
      'INSERT INTO mentorship_applications (post_id, student_id, message) VALUES ($1, $2, $3) RETURNING *',
      [postId, student.rows[0].id, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as alumniRouter };