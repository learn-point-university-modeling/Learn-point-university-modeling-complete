USE bgw7vukz4hklncoei5kp;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    age INT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student','tutor','admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TUTORS
-- ============================================================
CREATE TABLE tutors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tutoring_mode ENUM('online','presential','mixed') DEFAULT 'online',
    hourly_rate DECIMAL(10,2),
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    tutor_id INT NOT NULL,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
);

-- ============================================================
-- TUTOR AVAILABILITY
-- ============================================================
CREATE TABLE tutor_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    available_days SET('Mon','Tue','Wed','Thu','Fri','Sat','Sun'),
    start_time TIME,
    end_time TIME,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
);

-- ============================================================
-- STUDENTS - SUBJECTS (Many-to-Many)
-- ============================================================
CREATE TABLE students_subjects (
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    PRIMARY KEY (student_id, subject_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- ============================================================
-- REQUESTS (Tutor requests from students)
-- ============================================================
CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    tutor_id INT NOT NULL,
    message TEXT,
    status ENUM('pending','accepted','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
);

-- ============================================================
-- RESERVATIONS
-- ============================================================
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutor_id INT NOT NULL,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    reservation_date DATE,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    tutor_id INT NOT NULL,
    comments TEXT,
    rating ENUM('1','2','3','4','5'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
);

-- ============================================================
-- CHATS
-- ============================================================
CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    tutor_id INT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id INT NOT NULL,
    sender ENUM('student','tutor'),
    message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);


-- ============================================================
-- INSERT ONE STUDENT AND ONE TUTOR (WITHOUT tutoring_mode)
-- ============================================================

-- USERS
INSERT INTO users (first_name, last_name, age, email, password, role)
VALUES
('Sofia', 'Lopez', 21, 'sofia.python@student.com', '12345', 'student'),
('David', 'Torres', 29, 'david.js@tutor.com', '12345', 'tutor');

-- STUDENT
INSERT INTO students (user_id)
VALUES (1); -- Sofia (student)

-- TUTOR
INSERT INTO tutors (user_id, hourly_rate, description)
VALUES (2, 55.00, 'JavaScript tutor with 6 years of full-stack experience.');
