import pool from "../db/db.js";

export const crearComercio = async (req, res) => {
  try {
    const { tipo, nombre, lat, lng } = req.body;
    const result = await pool.query(
      "INSERT INTO comercios (tipo, nombre, lat, lng) VALUES ($1,$2,$3,$4) RETURNING *",
      [tipo, nombre, lat, lng]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Error creando comercio" });
  }
};
export const listarComercios = async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM comercios");
      res.json(result.rows);
    } catch {
      res.status(500).json({ message: "Error listando comercios" });
    }
  };
  export const listarCercanos = async (req, res) => {
    const { lat, lng, distancia = 5 } = req.query;
  
    if (!lat || !lng) {
      return res.status(400).json({ message: "lat y lng son requeridos" });
    }
  
    try {
      const result = await pool.query(
        `SELECT *, (
          6371 * acos(
            cos(radians($1)) * cos(radians(lat)) *
            cos(radians(lng) - radians($2)) +
            sin(radians($1)) * sin(radians(lat))
          )
        ) AS distancia
        FROM comercios
        HAVING distancia <= $3
        ORDER BY distancia ASC`,
        [lat, lng, distancia]
      );
  
      res.json(result.rows);
    } catch {
      res.status(500).json({ message: "Error listando comercios cercanos" });
    }
  };