const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const reservationRoutes = require('./routes/reservation.routes');
const roomRoutes = require('./routes/room.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));

// Conectar a la base de datos
connectDB();

// Rutas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/reservations', reservationRoutes);
app.use('/rooms', roomRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

module.exports = app;