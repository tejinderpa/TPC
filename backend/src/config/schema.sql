-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    course VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    cgpa DECIMAL(4,2),
    resume_url TEXT,
    skills TEXT[],
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    website VARCHAR(255),
    logo_url TEXT,
    location VARCHAR(255),
    employee_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[],
    location VARCHAR(255),
    type VARCHAR(50),
    salary_range VARCHAR(100),
    deadline TIMESTAMP,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create applications table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id),
    student_id INTEGER REFERENCES students(id),
    status VARCHAR(50) DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50),
    date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    hosted_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create alumni table
CREATE TABLE alumni (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    batch INTEGER NOT NULL,
    degree VARCHAR(100),
    branch VARCHAR(100),
    company VARCHAR(255),
    position VARCHAR(255),
    location VARCHAR(255),
    linkedin_url VARCHAR(255),
    experience TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create mentorship_posts table
CREATE TABLE mentorship_posts (
    id SERIAL PRIMARY KEY,
    alumni_id INTEGER REFERENCES alumni(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    topic VARCHAR(100),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    max_students INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create mentorship_applications table
CREATE TABLE mentorship_applications (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES mentorship_posts(id),
    student_id INTEGER REFERENCES students(id),
    status VARCHAR(50) DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);