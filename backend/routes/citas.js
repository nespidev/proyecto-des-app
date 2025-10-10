import express from "express";
import { crearCita, listarCitas, cancelarCita } from "../controllers/citasController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyToken, listarCitas);
router.post("/", verifyToken, crearCita);
router.patch("/:id/cancelar", verifyToken, cancelarCita);
router.delete("/:id", eliminarCita);


export default router;
