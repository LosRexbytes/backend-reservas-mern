const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const upload = require('../middleware/upload');

router.get('/', roomController.getAllRooms);
router.post('/', upload.single('imagen'), roomController.createRoom);
router.put('/:id', upload.single('imagen'), roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;