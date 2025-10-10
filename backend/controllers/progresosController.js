import pool from "../db/db.js";

export const registrarProgreso = async (req, res) => {
  try {
    const { rutina_id, fecha, metricas, media_uri } = req.body;
    const result = await pool.query(
      "INSERT INTO progresos (rutina_id, fecha, metricas, media_uri) VALUES ($1,$2,$3,$4) RETURNING *",
      [rutina_id, fecha, metricas, media_uri]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Error registrando progreso" });
  }
};
export const listarProgresos = async (req, res) => {
    try {
      const { rutina_id, usuario_id } = req.query;
  
      let result;
      if (rutina_id) {
        result = await pool.query("SELECT * FROM progresos WHERE rutina_id = $1", [rutina_id]);
      } else if (usuario_id) {
        result = await pool.query(
          `SELECT p.* FROM progresos p 
           JOIN rutinas r ON p.rutina_id = r.id 
           WHERE r.usuario_id = $1`,
          [usuario_id]
        );
      } else {
        return res.status(400).json({ message: "Se requiere rutina_id o usuario_id" });
      }
  
      res.json(result.rows);
    } catch {
      res.status(500).json({ message: "Error obteniendo progresos" });
    }
  };
  