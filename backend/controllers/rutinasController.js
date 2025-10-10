import pool from "../db/db.js";

export const crearRutina = async (req, res) => {
  try {
    const { entrenador_id, usuario_id, nombre, objetivos } = req.body;
    const result = await pool.query(
      "INSERT INTO rutinas (entrenador_id, usuario_id, nombre, objetivos) VALUES ($1,$2,$3,$4) RETURNING *",
      [entrenador_id, usuario_id, nombre, objetivos]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Error creando rutina" });
  }
};

export const listarRutinas = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM rutinas");
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: "Error listando rutinas" });
  }
};
