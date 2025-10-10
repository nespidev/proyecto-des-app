import express from "express";
import { crearComercio, listarComercios } from "../controllers/comerciosController.js";
import { verifyToken } from "../middlewares/auth.js";
import { listarCercanos } from "../controllers/comerciosController.js";


const router = express.Router();

router.post("/", verifyToken, crearComercio);
router.get("/", verifyToken, listarComercios);
router.get("/cercanos", verifyToken, listarCercanos);


export default router;
