const mongoose = require('mongoose');

const habitacionSchema = new mongoose.Schema({
  tipoHabitacion: { type: String, required: true },
  titulo: { type: String, required: true },
  subtitulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  precioPorNoche: { type: Number, required: true },
  capacidad: {
    adultos: { type: Number, required: true, min: 1, max: 4 },
    ninos: { type: Number, required: true, min: 0, max: 4 }
  },
  comodidadesCuarto: { type: [String], validate: [arrayLimit, '{PATH} excede el límite de 7'] },
  comodidadesBano: { type: [String], validate: [arrayLimit, '{PATH} excede el límite de 7'] },
  comodidadesGeneral: { type: [String], validate: [arrayLimit, '{PATH} excede el límite de 7'] },
  imagen: { type: String, required: true }, // URL de la imagen
  disponibilidad: { type: String, enum: ['ocupada', 'disponible'], required: true }
});

function arrayLimit(val) {
  return val.length <= 7;
}

module.exports = mongoose.model('Habitacion', habitacionSchema);

