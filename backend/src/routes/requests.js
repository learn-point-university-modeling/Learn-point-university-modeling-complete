import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { student_id, tutor_id, message } = req.body;
    if (!student_id || !tutor_id)
      return res.status(400).json({ error: "student_id y tutor_id son requeridos" });

    const [studentRows] = await pool.query(
      "SELECT id, user_id FROM students WHERE id = ?",
      [student_id]
    );
    const [tutorRows] = await pool.query(
      "SELECT id, user_id FROM tutors WHERE id = ?",
      [tutor_id]
    );

    if (!studentRows.length)
      return res.status(404).json({ error: "Estudiante no encontrado" });
    if (!tutorRows.length)
      return res.status(404).json({ error: "Tutor no encontrado" });

    const [result] = await pool.query(
      "INSERT INTO requests (student_id, tutor_id, status, message) VALUES (?, ?, 'pending', ?)",
      [student_id, tutor_id, message || null]
    );

    res.status(201).json({
      message: "Solicitud creada correctamente",
      request: {
        id: result.insertId,
        status: "pending",
        student_id,
        tutor_id,
        message: message || null,
        student_user_id: studentRows[0].user_id,
        tutor_user_id: tutorRows[0].user_id,
      },
    });
  } catch (err) {
    console.error("Error al crear solicitud:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { tutor_id, student_id } = req.query;

    let query = `
      SELECT 
        r.id, r.status, r.message, r.created_at,
        s.id AS student_id, s.user_id AS student_user_id,
        t.id AS tutor_id, t.user_id AS tutor_user_id,
        su.first_name AS student_first_name, su.last_name AS student_last_name,
        tu.first_name AS tutor_first_name, tu.last_name AS tutor_last_name
      FROM requests r
      JOIN students s ON s.id = r.student_id
      JOIN users su ON su.id = s.user_id
      JOIN tutors t ON t.id = r.tutor_id
      JOIN users tu ON tu.id = t.user_id
    `;

    const params = [];
    if (tutor_id) {
      query += " WHERE r.tutor_id = ?";
      params.push(tutor_id);
    } else if (student_id) {
      query += " WHERE r.student_id = ?";
      params.push(student_id);
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(" Error al obtener solicitudes:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tutor_id, status } = req.body;

    if (!tutor_id || !["accepted", "rejected"].includes(status))
      return res.status(400).json({ error: "Parámetros inválidos" });

    const [rows] = await pool.query(
      `
      SELECT r.*, 
             s.id AS student_db_id,
             t.id AS tutor_db_id,
             s.user_id AS student_user_id, 
             t.user_id AS tutor_user_id,
             su.first_name AS student_first_name,
             su.last_name AS student_last_name,
             tu.first_name AS tutor_first_name,
             tu.last_name AS tutor_last_name
      FROM requests r
      JOIN students s ON s.id = r.student_id
      JOIN tutors t ON t.id = r.tutor_id
      JOIN users su ON su.id = s.user_id
      JOIN users tu ON tu.id = t.user_id
      WHERE r.id = ? AND r.tutor_id = ?
    `,
      [id, tutor_id]
    );

    if (!rows.length)
      return res.status(404).json({ error: "Solicitud no encontrada" });

    if (rows[0].status !== "pending")
      return res.status(400).json({ error: "Solicitud ya procesada" });

    await pool.query("UPDATE requests SET status = ? WHERE id = ?", [status, id]);

    res.json({
      message: `Solicitud ${status} correctamente`,
      request: {
        id,
        status,
        student_user_id: rows[0].student_user_id,
        tutor_user_id: rows[0].tutor_user_id,
        student_name: `${rows[0].student_first_name} ${rows[0].student_last_name}`,
        tutor_name: `${rows[0].tutor_first_name} ${rows[0].tutor_last_name}`,
      },
    });
  } catch (err) {
    console.error("Error al actualizar solicitud:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM requests WHERE id = ?", [id]);

    if (!rows.length)
      return res.status(404).json({ error: "Solicitud no encontrada" });
    if (rows[0].status !== "pending")
      return res.status(400).json({ error: "Solo las solicitudes pendientes pueden eliminarse" });

    await pool.query("DELETE FROM requests WHERE id = ?", [id]);
    res.json({ message: "Solicitud eliminada correctamente" });
  } catch (err) {
    console.error(" Error al eliminar solicitud:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
