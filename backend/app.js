import express from "express";
import cors from "cors";

import usuariosRoutes from "./routes/usuarios.js";
import entrenadoresRoutes from "./routes/entrenadores.js";
import citasRoutes from "./routes/citas.js";
import chatsRoutes from "./routes/chats.js";
import rutinasRoutes from "./routes/rutinas.js";
import progresosRoutes from "./routes/progresos.js";
import comerciosRoutes from "./routes/comercios.js";
import cuponesRoutes from "./routes/cupones.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/entrenadores", entrenadoresRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/chats", chatsRoutes);
app.use("/api/rutinas", rutinasRoutes);
app.use("/api/progresos", progresosRoutes);
app.use("/api/comercios", comerciosRoutes);
app.use("/api/cupones", cuponesRoutes);

export default app;
