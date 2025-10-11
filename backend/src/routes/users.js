import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "USER NOT FOUND" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, age, email, password, registration_date } = req.body;
    const [result] = await db.query(
      "INSERT INTO users (first_name, last_name, age, email, password, registration_date) VALUES (?, ?, ?, ?, ?, ?)",
      [first_name, last_name, age, email, password, registration_date || new Date()]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { first_name, last_name, age, email, password, registration_date } = req.body;
    const [result] = await db.query(
      "UPDATE users SET first_name=?, last_name=?, age=?, email=?, password=?, registration_date=? WHERE id=?",
      [first_name, last_name, age, email, password, registration_date || new Date(), req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: "USER NOT FOUND" });
    res.json({ message: "USER UPDATED" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM users WHERE id=?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "USER NOT FOUND" });
    res.json({ message: "USER DELETED" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const sql = `
      SELECT 
        u.id, 
        u.first_name AS name, 
        u.last_name, 
        u.email,
        s.id AS studentId,
        t.id AS tutorId
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN tutors t ON u.id = t.user_id
      WHERE u.email = ? AND u.password = ?
    `;

    const [rows] = await db.query(sql, [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    let role = null;
    if (user.studentId) role = "student";
    else if (user.tutorId) role = "tutor";

    if (!role) {
      return res.status(403).json({ message: "User has no role assigned" });
    }

    res.json({
      message: "Login successful",
      role,
      user: {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        tutorId: user.tutorId || null,
        studentId: user.studentId || null,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/role/students", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, u.first_name AS name, u.last_name, u.id AS user_id
      FROM students s
      JOIN users u ON s.user_id = u.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error getting students" });
  }
});

router.get("/role/tutors", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.id, u.first_name AS name, u.last_name, u.email, t.description
      FROM tutors t
      JOIN users u ON u.id = t.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tutors" });
  }
});

export default router;
