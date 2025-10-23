import express from "express";
import db from "../config/db.js";

const router = express.Router();

/**
 * ===============================
 * GET EVENTS (TUTORING SESSIONS)
 * ===============================
 * Filtra por userId y rol (tutor o student)
 * Ejemplo: GET /calendar/events?userId=2&role=tutor
 */
router.get("/events", async (req, res) => {
  const { userId, role } = req.query;

  try {
    let sql = `
      SELECT 
        r.id,
        s.subject_name,
        CONCAT(tu.first_name, ' ', tu.last_name) AS tutor_name,
        CONCAT(stu.first_name, ' ', stu.last_name) AS student_name,
        r.reservation_date,
        r.start_time,
        r.end_time,
        r.tutor_id,
        r.student_id,
        r.subject_id
      FROM reservations r
      JOIN subjects s ON r.subject_id = s.id
      JOIN tutors t ON r.tutor_id = t.id
      JOIN users tu ON t.user_id = tu.id
      JOIN students st ON r.student_id = st.id
      JOIN users stu ON st.user_id = stu.id
    `;

    const values = [];

    if (role === "tutor") {
      sql += " WHERE r.tutor_id = ?";
      values.push(userId);
    } else if (role === "student") {
      sql += " WHERE r.student_id = ?";
      values.push(userId);
    }

    console.log("SQL Query:", sql);
    console.log("Values:", values);

    const [rows] = await db.query(sql, values);
    console.log("✅ Events fetched:", rows);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error getting events:", err);
    res.status(500).json({ error: "Error getting events" });
  }
});

/**
 * ===============================
 * CREATE TUTORING SESSION
 * ===============================
 * Acepta tanto los nombres del frontend (tutors_id, start_datetime)
 * como los del backend (tutor_id, start_time).
 */
router.post("/events", async (req, res) => {
  try {
    console.log("Body received:", req.body);

    // ✅ Soporte para diferentes nombres de campos
    const tutor_id =
      req.body.tutor_id || req.body.tutors_id || req.body.tutorId;
    const student_id =
      req.body.student_id || req.body.students_id || req.body.studentId;
    const subject_id =
      req.body.subject_id || req.body.subjects_id || req.body.subjectId;

    const start =
      req.body.start_time ||
      req.body.start_datetime ||
      req.body.start ||
      null;
    const end =
      req.body.end_time ||
      req.body.end_datetime ||
      req.body.end ||
      null;
    const date =
      req.body.reservation_date ||
      (req.body.start_datetime
        ? req.body.start_datetime.split(" ")[0]
        : req.body.start?.split("T")[0]) ||
      null;

    const jitsi_link = req.body.jitsi_link || null;

    // ✅ Validación de campos
    if (!tutor_id || !student_id || !subject_id || !start || !end || !date) {
      console.log("❌ Missing required fields:", {
        tutor_id,
        student_id,
        subject_id,
        start,
        end,
        date,
      });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Inserción en la base de datos
    const [result] = await db.query(
      `INSERT INTO reservations 
        (tutor_id, student_id, subject_id, reservation_date, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [tutor_id, student_id, subject_id, date, start, end]
    );

    console.log("✅ Tutoring session created:", result.insertId);

    // ✅ Respuesta limpia
    res.status(201).json({
      success: true,
      id: result.insertId,
      jitsi_link,
    });
  } catch (err) {
    console.error("❌ Error creating event:", err.sqlMessage || err.message);
    res.status(500).json({ error: "Error creating event" });
  }
});

/**
 * ===============================
 * EDIT TUTORING SESSION
 * ===============================
 */
router.put("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const tutor_id =
      req.body.tutor_id || req.body.tutors_id || req.body.tutorId;
    const student_id =
      req.body.student_id || req.body.students_id || req.body.studentId;
    const subject_id =
      req.body.subject_id || req.body.subjects_id || req.body.subjectId;
    const reservation_date =
      req.body.reservation_date ||
      (req.body.start_datetime
        ? req.body.start_datetime.split(" ")[0]
        : null);
    const start_time =
      req.body.start_time ||
      req.body.start_datetime ||
      req.body.start ||
      null;
    const end_time =
      req.body.end_time ||
      req.body.end_datetime ||
      req.body.end ||
      null;

    await db.query(
      `UPDATE reservations 
       SET tutor_id = ?, student_id = ?, subject_id = ?, 
           reservation_date = ?, start_time = ?, end_time = ?
       WHERE id = ?`,
      [tutor_id, student_id, subject_id, reservation_date, start_time, end_time, id]
    );

    console.log("✅ Tutoring session updated:", id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error editing event:", err);
    res.status(500).json({ error: "Error editing event" });
  }
});

/**
 * ===============================
 * DELETE TUTORING SESSION
 * ===============================
 */
router.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM reservations WHERE id = ?`, [id]);
    console.log("✅ Tutoring session deleted:", id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting event:", err);
    res.status(500).json({ error: "Error deleting event" });
  }
});

export default router;
