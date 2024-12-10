const nodemailer = require("nodemailer");

// Configuración del transporte con las credenciales directamente
const transporter = nodemailer.createTransport({
  service: "gmail", // Cambia "gmail" por tu proveedor de correo si es diferente
  auth: {
    user: "borissulldiaz@gmail.com", // Reemplaza con tu correo
    pass: "hday xlvo bhvk osqq",     // Reemplaza con tu contraseña
  },
});

// Función para enviar correos
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: "borissulldiaz@gmail.com", // El correo del remitente
      to,                         // Destinatario
      subject,                    // Asunto
      html,                       // Contenido HTML
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo enviado exitosamente.");
  } catch (error) {
    console.error("Error al enviar el correo:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
