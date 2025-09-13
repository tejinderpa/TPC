import express from 'express';
import { auth, checkRole } from '../middleware/auth';
import pool from '../config/database';
import { AuthRequest } from '../types/auth';

const router = express.Router();

// Get all students
router.get('/', auth, checkRole(['tpo', 'company']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.email 
      FROM students s 
      JOIN users u ON s.user_id = u.id 
      ORDER BY s.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student by id
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT s.*, u.email 
      FROM students s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Only allow TPO, company, or the student themselves to view details
    if (req.user?.role !== 'tpo' && req.user?.role !== 'company') {
      const student = await pool.query(
        'SELECT id FROM students WHERE user_id = $1',
        [req.user?.id]
      );

      if (!student.rows.length || student.rows[0].id !== parseInt(id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student profile (Student only)
router.put('/:id', auth, checkRole(['student']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      roll_number,
      course,
      branch,
      year,
      cgpa,
      skills,
      phone,
    } = req.body;

    // Verify student owns this profile
    const student = await pool.query(
      'SELECT id FROM students WHERE id = $1 AND user_id = $2',
      [id, req.user?.id]
    );

    if (student.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found or unauthorized' });
    }

    const result = await pool.query(
      `UPDATE students 
      SET name = $1, roll_number = $2, course = $3, branch = $4, 
          year = $5, cgpa = $6, skills = $7, phone = $8 
      WHERE id = $9 RETURNING *`,
      [name, roll_number, course, branch, year, cgpa, skills, phone, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export { router as studentsRouter };