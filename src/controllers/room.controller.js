const Habitacion = require('../models/Room');

exports.getAllRooms = async (req, res) => {
  try {
    const habitaciones = await Habitacion.find();
    res.json(habitaciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { 
      tipoHabitacion, titulo, subtitulo, descripcion, precioPorNoche,
      capacidadAdultos, capacidadNinos, comodidadesCuarto, comodidadesBano, comodidadesGeneral,
      disponibilidad
    } = req.body;

    let imagenPath = '';
    if (req.file) {
      imagenPath = `/uploads/${req.file.filename}`;
      // Verifica si el archivo existe
      const fs = require('fs');
      if (!fs.existsSync(`./uploads/${req.file.filename}`)) {
        throw new Error('El archivo de imagen no se pudo guardar correctamente.');
      }
    }

    const nuevaHabitacion = new Habitacion({
      tipoHabitacion,
      titulo,
      subtitulo,
      descripcion,
      precioPorNoche: Number(precioPorNoche),
      capacidad: {
        adultos: Number(capacidadAdultos),
        ninos: Number(capacidadNinos)
      },
      comodidadesCuarto: JSON.parse(comodidadesCuarto),
      comodidadesBano: JSON.parse(comodidadesBano),
      comodidadesGeneral: JSON.parse(comodidadesGeneral),
      imagen: imagenPath,
      disponibilidad
    });

    const habitacionGuardada = await nuevaHabitacion.save();
    res.status(201).json(habitacionGuardada);
  } catch (error) {
    console.error('Error al crear habitación:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      tipoHabitacion, titulo, subtitulo, descripcion, precioPorNoche,
      capacidadAdultos, capacidadNinos, comodidadesCuarto, comodidadesBano, comodidadesGeneral,
      disponibilidad
    } = req.body;

    let imagenPath = req.body.imagen;
    if (req.file) {
      imagenPath = `/uploads/${req.file.filename}`;
      // Verifica si el archivo existe
      const fs = require('fs');
      if (!fs.existsSync(`./uploads/${req.file.filename}`)) {
        throw new Error('El archivo de imagen no se pudo guardar correctamente.');
      }
    }

    const habitacionActualizada = await Habitacion.findByIdAndUpdate(id, {
      tipoHabitacion,
      titulo,
      subtitulo,
      descripcion,
      precioPorNoche: Number(precioPorNoche),
      capacidad: {
        adultos: Number(capacidadAdultos),
        ninos: Number(capacidadNinos)
      },
      comodidadesCuarto: JSON.parse(comodidadesCuarto),
      comodidadesBano: JSON.parse(comodidadesBano),
      comodidadesGeneral: JSON.parse(comodidadesGeneral),
      imagen: imagenPath,
      disponibilidad
    }, { new: true });

    if (!habitacionActualizada) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    res.json(habitacionActualizada);
  } catch (error) {
    console.error('Error al actualizar habitación:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const habitacionEliminada = await Habitacion.findByIdAndDelete(id);

    if (!habitacionEliminada) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }

    res.json({ message: 'Habitación eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

