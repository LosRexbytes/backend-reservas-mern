// src/models/Reservation.js
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Habitacion', required: true },
  check_in_date: { type: Date, required: true },
  check_out_date: { type: Date, required: true },
  total_price: { type: Number, required: true },
  status: { type: String, enum: ['iniciado', 'finalizado'], required: true }
});

module.exports = mongoose.model('Reservation', reservationSchema);