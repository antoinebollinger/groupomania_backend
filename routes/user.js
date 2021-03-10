const express = require('express');
const router = express.Router();

// Appel des middelwares Auth (token) et Multer (images)
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Appel des controllers
const userCtrl = require('../controllers/user');

// Routage des controleurs
// USER WANTS NOTIFICATION OR NOT 
router.put('/:currentUserId/notifs', auth, userCtrl.userWantsNotifs);
// REGULAR ROUTES
router.get('/', auth, userCtrl.getAllUsers);
router.get('/:currentUserId/filter/:filter', auth, userCtrl.getUsersWithFilter);
router.get('/:currentUserId/rand/:nbRand', auth, userCtrl.getRandUsers);
router.get('/:userId', auth, userCtrl.getOneUser);
router.put('/:currentUserId', auth, multer, userCtrl.updateUser);
router.put('/:currentUserId/pwd', auth, userCtrl.updatePwd);
router.delete('/:currentUserId', auth, multer, userCtrl.deleteUser);

module.exports = router;