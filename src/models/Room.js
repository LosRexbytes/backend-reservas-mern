// src/models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room_type: { type: String, required: true },
  price_per_night: { type: Number, required: true },
  availability: { type: Boolean, required: true }
});

module.exports = mongoose.model('Habitacion', roomSchema);