import pool from "../db/db.js";

export const crearCupon = async (req, res) => {
  try {
    const { comercio_id, titulo, descuento, valido_desde, valido_hasta, terms } = req.body;
    const result = await pool.query(
      "INSERT INTO cupones (comercio_id, titulo, descuento, valido_desde, valido_hasta, terms) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [comercio_id, titulo, descuento, valido_desde, valido_hasta, terms]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Error creando cupón" });
  }
};
export const listarCupones = async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM cupones");
      res.json(result.rows);
    } catch {
      res.status(500).json({ message: "Error listando cupones" });
    }
  };
  