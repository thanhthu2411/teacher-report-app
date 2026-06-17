
BEGIN;

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL DEFAULT 2,    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE  classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, academic_year, user_id)
);


CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    dob DATE,
    gender CHAR(1) CHECK (gender in ('M', 'F')),
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(slug, class_id)
);

CREATE TABLE performance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    period_label VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    performance_id INTEGER REFERENCES performance(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    score NUMERIC(5,2),
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE behavior (
    id SERIAL PRIMARY KEY,
    performance_id INTEGER REFERENCES performance(id) ON DELETE CASCADE,
    attendance INTEGER,
    total_days INTEGER,
    rule_following INTEGER CHECK (rule_following BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    performance_id INTEGER REFERENCES performance(id) ON DELETE CASCADE,
    text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- the AI-generated report, one per performance period
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    performance_id INTEGER REFERENCES performance(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(150),
    text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- INSERT DATA INTO TABLES
INSERT INTO roles (role_name, role_description) VALUES
    ('admin', 'Administrator with full system access'),
    ('teacher', 'Manage their classes'),
    ('parent', 'Student parent');




COMMIT;



