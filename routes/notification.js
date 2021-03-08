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
router.delete('/:notifId', auth, notifCtrl.deleteNotif);
// ACTIVE-INACTIVE NOTIFICATIONS
router.post('/:notifId/active', auth, notifCtrl.unactiveNotif);
router.delete('/:notifId/active', auth, notifCtrl.activeNotif);


module.exports = router;