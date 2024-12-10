// src/controllers/auth.controller.js
const bcrypt = require('bcrypt');
const User = require('../models/User');

exports.register = async (req, res) => {
  const { username, email, password, role = 'user' } = req.body;

  try {
    // Validación de campos obligatorios
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Validación de longitud del nombre de usuario
    if (username.length < 8 || username.length > 20) {
      return res.status(400).json({
        message: 'El nombre de usuario debe tener entre 8 y 20 caracteres'
      });
    }

    // Validación de formato del correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|org|net|pe|[a-z]{2})$/i;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'El correo debe terminar en .com, .org, .net, .pe o un dominio de país válido.'
      });
    }

    // Verificar si el correo ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Validación de contraseña
    const passwordErrors = [];
    if (password.length < 8) {
      passwordErrors.push("La contraseña debe tener al menos 8 caracteres.");
    }
    if (/\s/.test(password)) {
      passwordErrors.push("La contraseña no debe contener espacios.");
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push("La contraseña debe contener al menos una letra mayúscula.");
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push("La contraseña debe contener al menos una letra minúscula.");
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push("La contraseña debe contener al menos un número.");
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      passwordErrors.push("La contraseña debe contener al menos un carácter especial (por ejemplo, @, #, $, %).");
    }

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: 'La contraseña no cumple con los requisitos.',
        errors: passwordErrors
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear y guardar usuario
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await user.save();
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({
      message: 'Error al registrar el usuario',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  const { usernameEmail, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [
        { email: usernameEmail },
        { username: usernameEmail }
      ]
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    res.json({ 
      username: user.username, 
      role: user.role,
      message: 'Inicio de sesión exitoso' 
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};