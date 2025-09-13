import express from 'express';
import { auth, checkRole } from '../middleware/auth';
import pool from '../config/database';
import { AuthRequest } from '../types/auth';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, 
        CASE 
          WHEN u.role = 'tpo' THEN 'Training & Placement Office'
          WHEN u.role = 'company' THEN (SELECT name FROM companies WHERE user_id = u.id)
          WHEN u.role = 'alumni' THEN (SELECT name FROM alumni WHERE user_id = u.id)
        END as hosted_by_name
      FROM events e
      JOIN users u ON e.hosted_by = u.id
      ORDER BY e.date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT e.*, 
        CASE 
          WHEN u.role = 'tpo' THEN 'Training & Placement Office'
          WHEN u.role = 'company' THEN (SELECT name FROM companies WHERE user_id = u.id)
          WHEN u.role = 'alumni' THEN (SELECT name FROM alumni WHERE user_id = u.id)
        END as hosted_by_name
      FROM events e
      JOIN users u ON e.hosted_by = u.id
      WHERE e.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event (TPO, Company, or Alumni only)
router.post('/', auth, checkRole(['tpo', 'company', 'alumni']), async (req: AuthRequest, res) => {
  try {
    const {
      title,
      description,
      type,
      date,
      location,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO events (
        title, description, type, date, location, hosted_by
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, type, date, location, req.user?.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event (Event creator only)
router.put('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      type,
      date,
      location,
    } = req.body;

    // Verify user created this event
    const event = await pool.query(
      'SELECT * FROM events WHERE id = $1 AND hosted_by = $2',
      [id, req.user?.id]
    );

    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found or unauthorized' });
    }

    const result = await pool.query(
      `UPDATE events 
      SET title = $1, description = $2, type = $3, date = $4, location = $5
      WHERE id = $6 RETURNING *`,
      [title, description, type, date, location, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as eventsRouter };