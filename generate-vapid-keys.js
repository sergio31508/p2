// Script para generar claves VAPID para notificaciones push
// Ejecutar: node generate-vapid-keys.js

import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n=== CLAVES VAPID GENERADAS ===\n');
console.log('Clave Pública:');
console.log(vapidKeys.publicKey);
console.log('\nClave Privada:');
console.log(vapidKeys.privateKey);
console.log('\n=== INSTRUCCIONES ===');
console.log('1. Copia la clave pública al archivo pushNotifications.js en el frontend');
console.log('2. Copia la clave privada al archivo usuarioRoutes.js en el backend');
console.log('3. En producción, usa variables de entorno para estas claves\n');

