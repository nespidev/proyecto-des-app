import { Router } from "express";
import { crearRutina, listarRutinas } from "../controllers/rutinasController.js";

const router = Router();

router.post("/", crearRutina);
router.get("/", listarRutinas);

export default router;
