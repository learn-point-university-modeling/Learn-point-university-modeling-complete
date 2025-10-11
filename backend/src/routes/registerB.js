import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// =======================================
// REGISTER TUTOR
// =======================================
router.post("/registerTutor", async (req, res) => {
  const {
    name,
    last_name,
    age,
    email,
    password,
    hourPrice,
    description,
    subjects,
    availability,
  } = req.body;

  const working_days = availability?.days?.join(",") || null;
  const from = availability?.timeFrom || null;
  const to = availability?.timeTo || null;

  if (
    !name ||
    !last_name ||
    !age ||
    !email ||
    !password ||
    !hourPrice ||
    !description ||
    !subjects ||
    !working_days ||
    !from ||
    !to
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "The email already exists" });
    }

    // Insert user with role "tutor"
    const [userResult] = await pool.query(
      "INSERT INTO users (first_name, last_name, age, email, password, role) VALUES (?, ?, ?, ?, ?, 'tutor')",
      [name, last_name, age, email, password]
    );
    const userId = userResult.insertId;

    // Insert into tutors table
    const [tutorResult] = await pool.query(
      "INSERT INTO tutors (user_id, hourly_rate, description) VALUES (?, ?, ?)",
      [userId, hourPrice, description]
    );
    const tutorId = tutorResult.insertId;

    // Insert availability
    await pool.query(
      "INSERT INTO tutor_availability (tutor_id, available_days, start_time, end_time) VALUES (?, ?, ?, ?)",
      [tutorId, working_days, from, to]
    );

    // Insert subjects
    if (Array.isArray(subjects)) {
      for (const subject of subjects) {
        await pool.query(
          "INSERT INTO subjects (subject_name, tutor_id) VALUES (?, ?)",
          [subject, tutorId]
        );
      }
    }

    res.status(201).json({ message: "Tutor registered successfully" });
  } catch (err) {
    console.error("Error during tutor registration:", err.message, err.stack);
    res.status(500).json({ error: "Server error during tutor registration" });
  }
});

// =======================================
// REGISTER STUDENT
// =======================================
router.post("/registerStudent", async (req, res) => {
  const { name, last_name, age, email, password } = req.body;

  if (!name || !last_name || !age || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "The email already exists" });
    }

    // Insert user with role "student"
    const [userResult] = await pool.query(
      "INSERT INTO users (first_name, last_name, age, email, password, role) VALUES (?, ?, ?, ?, ?, 'student')",
      [name, last_name, age, email, password]
    );
    const userId = userResult.insertId;

    // Insert into students table
    await pool.query("INSERT INTO students (user_id) VALUES (?)", [userId]);

    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    console.error("Error during student registration:", err.message, err.stack);
    res.status(500).json({ error: "Server error during student registration" });
  }
});

export default router;
