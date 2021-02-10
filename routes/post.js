const express = require('express');
const router = express.Router();

// Appel des middelwares Auth (token) et Multer (images)
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Appel des controllers
const postCtrl = require('../controllers/post');
const likeCtrl = require('../controllers/like');
const commentCtrl = require('../controllers/comment');

// ----- Routage des controllers ---------- //
// POSTS
router.post('/', auth, multer, postCtrl.createPost);
router.get('/', auth, postCtrl.getAllPosts);
router.get('/:id', auth, postCtrl.getOnePost);
router.put('/:id', auth, multer, postCtrl.updatePost);
router.delete('/:id', auth, postCtrl.deletePost);
// LIKES
router.post('/:id/like', auth, likeCtrl.createLike);
// COMMENTS
router.post('/:id/comment', auth, commentCtrl.createComment);
router.delete('/:id/comment/:commentId', auth, commentCtrl.deleteComment);

module.exports = router;