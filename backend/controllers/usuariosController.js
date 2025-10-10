import pool from "../db/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const hashedPass = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING *",
      [nombre, email, hashedPass, rol]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registrando usuario" });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM usuarios WHERE email=$1", [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en login" });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente", usuario: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error eliminando usuario" });
  }
};
