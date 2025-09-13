import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { jobsRouter } from './routes/jobs';
import { studentsRouter } from './routes/students';
import { companiesRouter } from './routes/companies';
import { alumniRouter } from './routes/alumni';
import { eventsRouter } from './routes/events';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/alumni', alumniRouter);
app.use('/api/events', eventsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});