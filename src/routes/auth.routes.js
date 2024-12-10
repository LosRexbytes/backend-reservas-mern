const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Ruta para enviar enlace de restablecimiento de contraseña
router.post('/send-reset-link', authController.sendResetLink);

// Ruta para restablecer la contraseña usando un token
router.post('/reset-password/:token', authController.resetPassword);

// Ruta para registro de usuario
router.post('/register', authController.register);

// Ruta para login de usuario
router.post('/login', authController.login);

module.exports = router;
