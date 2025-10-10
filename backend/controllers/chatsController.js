import pool from "../db/db.js";

export const crearChat = async (req, res) => {
  try {
    const { cita_id } = req.body;
    const result = await pool.query("INSERT INTO chats (cita_id) VALUES ($1) RETURNING *", [cita_id]);
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Error creando chat" });
  }
};

export const enviarMensaje = async (req, res) => {
  try {
    const { chat_id, autor_id, tipo, contenido } = req.body;
    const result = await pool.query(
      "INSERT INTO mensajes (chat_id, autor_id, tipo, contenido) VALUES ($1,$2,$3,$4) RETURNING *",
      [chat_id, autor_id, tipo, contenido]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Error enviando mensaje" });
  }
};
export const listarMensajes = async (req, res) => {
    try {
      const { chat_id } = req.params;
      const result = await pool.query(
        "SELECT * FROM mensajes WHERE chat_id = $1 ORDER BY timestamp ASC",
        [chat_id]
      );
      res.json(result.rows);
    } catch {
      res.status(500).json({ message: "Error obteniendo mensajes" });
    }
  };
  