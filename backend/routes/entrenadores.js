import { Router } from "express";
import { listarEntrenadores, crearEntrenador, actualizarEntrenador } from "../controllers/entrenadoresController.js";

const router = Router();

router.get("/", listarEntrenadores);
router.post("/", crearEntrenador);
router.put("/:id", actualizarEntrenador);
router.get("/:id", obtenerEntrenadorPorId);
router.delete("/:id", eliminarEntrenador);


export default router;
