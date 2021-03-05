const express = require('express');
const router = express.Router();

// Appel des middelwares Auth (token) et Multer (images)
const auth = require('../middleware/auth');

// Appel des controllers
const notifCtrl = require('../controllers/notification');

// ----- Routage des controllers ---------- //
// NOTIFICATIONS 
router.post('/', auth, notifCtrl.createNotif);
router.get('/:currentUserId', auth, notifCtrl.getNotif);
router.get('/:currentUserId/isActive', auth, notifCtrl.getActiveNotif);
router.put('/disable/:notifId', auth, notifCtrl.disableNotif);
router.put('/enable/:notifId', auth, notifCtrl.enableNotif);
router.delete('/:notifId', auth, notifCtrl.deleteNotif);

module.exports = router;