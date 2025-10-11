USE bgw7vukz4hklncoei5kp;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(45),
    edad INT,
    email VARCHAR(45),
    password VARCHAR(45)
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    users_id INT,
    FOREIGN KEY (users_id) REFERENCES users(id)
);

CREATE TABLE tutors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    users_id INT,
    mode_tutoria VARCHAR(45),
    precio_hora DECIMAL(10,2),
    descripcion_tutor VARCHAR(100),
    FOREIGN KEY (users_id) REFERENCES users(id)
);

CREATE TABLE tutor_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tutors_id INT,
    dias_disponibles SET('Mon','Tue','Wed','Thu','Fri','Sat','Sun'),
    inicio_disponibilidad TIME,
    fin_disponibilidad TIME,
    FOREIGN KEY (tutors_id) REFERENCES tutors(id)
);

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_materia VARCHAR(45),
    tutors_id INT,
    FOREIGN KEY (tutors_id) REFERENCES tutors(id)
);

CREATE TABLE students_subjects (
    students_id INT,
    subjects_id INT,
    FOREIGN KEY (students_id) REFERENCES students(id),
    FOREIGN KEY (subjects_id) REFERENCES subjects(id)
);

-- Chats
CREATE TABLE chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    students_id INT,
    tutors_id INT,
    FOREIGN KEY (students_id) REFERENCES students(id),
    FOREIGN KEY (tutors_id) REFERENCES tutors(id)
);

CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mensaje TEXT,
    chats_id INT,
    FOREIGN KEY (chats_id) REFERENCES chats(id)
);

CREATE TABLE reservation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_reserva DATE,
    tutors_id INT,
    students_id INT,
    subjects_id INT,
    FOREIGN KEY (subjects_id) REFERENCES subjects(id),
    FOREIGN KEY (tutors_id) REFERENCES tutors(id),
    FOREIGN KEY (students_id) REFERENCES students(id)
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    students_id INT,
    tutors_id INT,
    comentarios TEXT,
    ranking ENUM('1','2','3','4','5'),
    FOREIGN KEY (students_id) REFERENCES students(id),
    FOREIGN KEY (tutors_id) REFERENCES tutors(id)
);

CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    tutor_id INT,
    estado ENUM('pending','accepted','rejected'),
    mensaje TEXT
);