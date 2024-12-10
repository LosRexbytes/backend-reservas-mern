const Reservation = require('../models/Reservation');

exports.createReservation = async (req, res) => {
  try {
    const { user_id, room_id, check_in_date, check_out_date, total_price } = req.body;
    const reservation = new Reservation({
      user_id,
      room_id,
      check_in_date,
      check_out_date,
      total_price,
      status: 'iniciado'
    });
    await reservation.save();
    res.status(201).json({ message: 'Reservación creada con éxito', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reservación', error: error.message });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('user_id', 'username').populate('room_id', 'room_type');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reservaciones', error: error.message });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('user_id', 'username').populate('room_id', 'room_type');
    if (!reservation) {
      return res.status(404).json({ message: 'Reservación no encontrada' });
    }
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reservación', error: error.message });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const { check_in_date, check_out_date, total_price, status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { check_in_date, check_out_date, total_price, status },
      { new: true, runValidators: true }
    );
    if (!reservation) {
      return res.status(404).json({ message: 'Reservación no encontrada' });
    }
    res.json({ message: 'Reservación actualizada con éxito', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar reservación', error: error.message });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservación no encontrada' });
    }
    res.json({ message: 'Reservación eliminada con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar reservación', error: error.message });
  }
};

