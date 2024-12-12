// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, minlength: 8, maxlength: 20 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String },
  resetToken: { type: String, default: null },
  resetTokenExpires: { type: Date, default: null }, // Nuevo campo para manejar tokens
});

module.exports = mongoose.model('User', userSchema);
