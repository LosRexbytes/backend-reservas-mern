const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/emailService.js');

// Función para enviar el enlace de restablecimiento de contraseña
exports.sendResetLink = async (req, res) => {
  const { email } = req.body;

  try {
    // Si el correo no está registrado
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetLink = `https://risueniosreservas.netlify.app/password-reset/${resetToken}`;

    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    const htmlContent = `
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; }
      .container { max-width: 600px; margin: auto; padding: 20px; text-align: center; }
      .logo { width: 150px; }
      .content { background-color: #f4f4f4; padding: 20px; border-radius: 10px; }
      .button { padding: 10px 20px; background-color: rgba(169, 169, 169, 0.6); color: white; text-decoration: none; border-radius: 5px; }
      h2 { font-size: 30px; color: #333; font-weight: bold; text-align: center; }
      p { font-size: 18px; color: #555; text-align: left; }
      .section-title { font-size: 24px; color: #333; font-weight: bold; margin-top: 20px; text-align: center; }
      .footer { margin-top: 30px; font-size: 16px; color: #777; text-align: left; }
      .footer ul { list-style-type: none; padding: 0; }
      .footer li { padding: 5px 0; }
      .location { margin-top: 20px; font-size: 16px; color: #777; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <img src="https://i.imgur.com/xRUeaKx.png" alt="Logo de la Empresa" class="logo" />
      <div class="content">
        <h2>Solicitud de Restablecimiento de Contraseña</h2>
        <p>Hola, para restablecer tu contraseña, por favor haz clic en el siguiente enlace:</p>
        <a href="${resetLink}" class="button">Restablecer Contraseña</a>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      </div>
      <div class="footer">
        <p class="section-title">Redes Sociales de Risueños</p>
        <ul>
          <li><strong>Facebook:</strong> <a href="https://www.facebook.com/risuenos">https://www.facebook.com/risuenos</a></li>
          <li><strong>Instagram:</strong> <a href="https://www.instagram.com/risuenos">https://www.instagram.com/risuenos</a></li>
          <li><strong>Twitter:</strong> <a href="https://twitter.com/risuenos">https://twitter.com/risuenos</a></li>
        </ul>
        <p class="section-title">Sobre Risueños</p>
        <p>
          Risueños es una empresa dedicada a la reserva de habitaciones para todo tipo de eventos,
          proporcionando una experiencia cómoda, segura y memorable. Nos especializamos en ofrecer un
          servicio de calidad a nivel nacional, con un compromiso total con nuestros clientes. Cada
          habitación está diseñada para garantizar el máximo confort, asegurando que cada huésped
          disfrute de su estadía sin preocupaciones.
        </p>
        <p class="section-title">Recomendaciones</p>
        <p>Para evitar problemas en el futuro, sugerimos:</p>
        <ul>
          <li>Verifica tu contraseña regularmente.</li>
          <li>Utiliza contraseñas fuertes y únicas.</li>
          <li>Usa una combinación de letras mayúsculas, minúsculas, números y símbolos.</li>
          <li>No compartas tus contraseñas con nadie.</li>
        </ul>
        <p>No te olvides de considerar estas características para tu contraseña:</p>
        <ul>
          <li>Al menos una letra mayúscula.</li>
          <li>Al menos un número.</li>
          <li>Al menos un símbolo especial, como @, #, $, etc.</li>
          <li>Mínimo 8 caracteres de longitud.</li>
        </ul>
      </div>
      <div class="location">
        <p><strong>Ubicación de nuestra oficina principal:</strong></p>
        <p>Av. Los Pinos 350, Centro de Lima, Lima, Perú</p>
      </div>
    </div>
  </body>
</html>
    `;

    await sendEmail(email, 'Recupera tu contraseña', htmlContent);
    res.status(200).json({ message: 'Correo enviado exitosamente.' });
  } catch (error) {
    console.error('Error al enviar el enlace:', error.message);
    res.status(500).json({ message: 'Error al enviar el enlace de recuperación.' });
  }
};

// Función para restablecer la contraseña
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    // Validación de contraseña
    const passwordErrors = [];
    if (newPassword.length < 8) {
      passwordErrors.push("La contraseña debe tener al menos 8 caracteres.");
    }
    if (/\s/.test(newPassword)) {
      passwordErrors.push("La contraseña no debe contener espacios.");
    }
    if (!/[A-Z]/.test(newPassword)) {
      passwordErrors.push("La contraseña debe contener al menos una letra mayúscula.");
    }
    if (!/[a-z]/.test(newPassword)) {
      passwordErrors.push("La contraseña debe contener al menos una letra minúscula.");
    }
    if (!/[0-9]/.test(newPassword)) {
      passwordErrors.push("La contraseña debe contener al menos un número.");
    }
    if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      passwordErrors.push("La contraseña debe contener al menos un carácter especial (por ejemplo, @, #, $, %).");
    }

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: 'La contraseña no cumple con los requisitos.',
        errors: passwordErrors
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida exitosamente.' });
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error.message);
    res.status(500).json({ message: 'Error al restablecer la contraseña.' });
  }
};

// Función para registrar un nuevo usuario
exports.register = async (req, res) => {
  const { username, email, password, role  } = req.body;

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
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
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
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({
      message: 'Error al registrar el usuario',
      error: error.message
    });
  }
};

// recuperar lista de clientes
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();  // Recupera todos los usuarios de la base de datos
    res.json(users);  // Envía la lista de usuarios al cliente
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
};

// eliminar usuario
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Verifica si el usuario existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Elimina el usuario
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Usuario eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
};

// Función para iniciar sesión (login)
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