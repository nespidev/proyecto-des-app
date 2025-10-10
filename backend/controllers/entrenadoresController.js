import pool from "../db/db.js";

export const listarEntrenadores = async (req, res) => {
    const { ubicacion, rating, disponibilidad } = req.query;
  
    let query = "SELECT * FROM entrenadores WHERE 1=1";
    let values = [];
    let i = 1;
  
    if (ubicacion) {
      query += ` AND ubicacion ILIKE $${i++}`;
      values.push(`%${ubicacion}%`);
    }
    if (rating) {
      query += ` AND rating >= $${i++}`;
      values.push(Number(rating));
    }
    if (disponibilidad) {
      query += ` AND disponibilidad ILIKE $${i++}`;
      values.push(`%${disponibilidad}%`);
    }
  
    try {
      const result = await pool.query(query, values);
      res.json(result.rows);
    } catch {
      res.status(500).json({ message: "Error listando entrenadores" });
    }
  };
  

export const crearEntrenador = async (req, res) => {
  try {
    const { usuario_id, bio, rating, ubicacion, disponibilidad } = req.body;
    const result = await pool.query(
      "INSERT INTO entrenadores (usuario_id, bio, rating, ubicacion, disponibilidad) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [usuario_id, bio, rating, ubicacion, disponibilidad]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Error creando entrenador" });
  }
};

export const obtenerEntrenadorPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM entrenadores WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Entrenador no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obteniendo entrenador" });
  }
};

export const actualizarEntrenador = async (req, res) => {
  try {
    const { id } = req.params;
    const { bio, rating, ubicacion, disponibilidad } = req.body;

    const result = await pool.query(
      `UPDATE entrenadores
       SET bio = $1,
           rating = $2,
           ubicacion = $3,
           disponibilidad = $4
       WHERE id = $5
       RETURNING *`,
      [bio, rating, ubicacion, disponibilidad, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Entrenador no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando entrenador" });
  }
};

export const eliminarEntrenador = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM entrenadores WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Entrenador no encontrado" });
    }

    res.json({ message: "Entrenador eliminado correctamente", entrenador: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando entrenador" });
  }
};

