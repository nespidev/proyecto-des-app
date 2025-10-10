import pool from "../db/db.js";

export const crearCita = async (req, res) => {
  try {
    const { usuario_id, entrenador_id, fecha_hora } = req.body;
    const result = await pool.query(
      "INSERT INTO citas (usuario_id, entrenador_id, fecha_hora) VALUES ($1,$2,$3) RETURNING *",
      [usuario_id, entrenador_id, fecha_hora]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Error creando cita" });
  }
};

export const listarCitas = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM citas");
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: "Error listando citas" });
  }
};
export const cancelarCita = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        "UPDATE citas SET estado = 'cancelada' WHERE id = $1 RETURNING *",
        [id]
      );
      res.json(result.rows[0]);
    } catch {
      res.status(500).json({ message: "Error cancelando cita" });
    }
  };

export const eliminarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM citas WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cita no encontrada" });
    }

    res.json({ message: "Cita eliminada correctamente", cita: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando cita" });
  }
};
