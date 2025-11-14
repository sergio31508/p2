import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  password: { type: String, required: true },
  pushSubscription: { type: Object, default: null }
});

export default mongoose.model("Usuario", usuarioSchema);
