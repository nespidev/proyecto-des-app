import express from "express";
import { crearChat, enviarMensaje, listarMensajes } from "../controllers/chatsController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyToken, crearChat);
router.post("/mensaje", verifyToken, enviarMensaje);
router.get("/:chat_id/mensajes", verifyToken, listarMensajes);

export default router;
