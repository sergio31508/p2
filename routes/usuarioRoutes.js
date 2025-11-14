import express from "express";
import Usuario from "../models/Usuario.js";
import webpush from "web-push";

// Configurar web-push (en producción, usa variables de entorno)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "BA_z1j1-VAWf4Sh964XeLejBuTl-9nqFjlw_E130UEGKUqyb621qcFLey_7bQWtu62Auj9Azn313FH8Uu4azyyE";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "NY3h62xSIhq2kdcaxq9xV8VVg7wclR0H9fyPMtpMpwk";

webpush.setVapidDetails(
  "mailto:admin@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const router = express.Router();

// REGISTRO
router.post("/registrar", async (req, res) => {
  try {
    const nuevo = new Usuario(req.body);
    await nuevo.save();
    res.json({ mensaje: "Usuario registrado", usuario: nuevo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { nombre, password } = req.body;
    const usuario = await Usuario.findOne({ nombre });

    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    if (usuario.password !== password) return res.status(400).json({ error: "Contraseña incorrecta" });

    res.json({ mensaje: "Login correcto", usuario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET TODOS LOS USUARIOS
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, { password: 0 }); // excluye password
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SUSCRIBIRSE A NOTIFICACIONES PUSH
router.post("/subscribe", async (req, res) => {
  try {
    const { subscription, userId } = req.body;
    const usuario = await Usuario.findById(userId);
    
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    usuario.pushSubscription = subscription;
    await usuario.save();
    
    res.json({ success: true, mensaje: "Suscripción guardada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ENVIAR NOTIFICACIÓN PUSH
router.post("/enviar-notificacion", async (req, res) => {
  try {
    const { usuarioId, titulo, mensaje } = req.body;
    
    let usuarios;
    if (usuarioId) {
      // Enviar a un usuario específico
      const usuario = await Usuario.findById(usuarioId);
      usuarios = usuario && usuario.pushSubscription ? [usuario] : [];
    } else {
      // Enviar a todos los usuarios con suscripción
      usuarios = await Usuario.find({ pushSubscription: { $ne: null } });
    }

    const payload = JSON.stringify({
      title: titulo,
      body: mensaje,
      icon: "/img/icons/icon-192x192.png",
      badge: "/img/icons/icon-144x144.png"
    });

    const promesas = usuarios.map(async (usuario) => {
      try {
        await webpush.sendNotification(usuario.pushSubscription, payload);
      } catch (err) {
        console.error(`Error enviando notificación a ${usuario.nombre}:`, err);
        // Si la suscripción es inválida, eliminarla
        if (err.statusCode === 410) {
          usuario.pushSubscription = null;
          await usuario.save();
        }
      }
    });

    await Promise.all(promesas);
    
    res.json({ success: true, mensaje: "Notificaciones enviadas" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
