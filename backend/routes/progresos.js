import express from "express";
import { registrarProgreso, listarProgresos } from "../controllers/progresosController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyToken, registrarProgreso);
router.get("/", verifyToken, listarProgresos);

export default router;
