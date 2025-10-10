import express from "express";
import { crearCupon, listarCupones } from "../controllers/cuponesController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", verifyToken, crearCupon);
router.get("/", verifyToken, listarCupones);

export default router;
