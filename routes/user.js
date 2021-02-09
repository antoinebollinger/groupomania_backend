const express = require('express');
const router = express.Router();

// Appel des middelwares Auth (token) et Multer (images)
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Appel des controllers
const userCtrl = require('../controllers/user');

// Routage des controleurs
router.get('/', auth, userCtrl.getAllUsers);
router.get('/:id', auth, userCtrl.getOneUser);
router.put('/update', auth, multer, userCtrl.updateUser);
router.delete('/delete', auth, multer, userCtrl.deleteUser);

module.exports = router;