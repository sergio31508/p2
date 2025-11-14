import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import usuarioRoutes from "./routes/usuarioRoutes.js"; // <--- importa tus rutas

const app = express();
app.use(express.json());

// Configurar CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];
app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

// Conectar a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://sergiohernandez22s:123@cluster0.xadfllh.mongodb.net/pwa?retryWrites=true&w=majority&appName=Cluster0";
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Mongo Atlas conectado"))
  .catch(err => console.log("Error al conectar:", err));

// Rutas
app.use("/api/usuarios", usuarioRoutes); // <--- debe estar **antes de app.listen**

// Servidor
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
