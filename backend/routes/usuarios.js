import { Router } from "express";
import { registrarUsuario, loginUsuario } from "../controllers/usuariosController.js";

const router = Router();

router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);
router.delete("/:id", eliminarUsuario);


export default router;
