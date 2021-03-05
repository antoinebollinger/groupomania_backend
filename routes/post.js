const express = require('express');
const router = express.Router();

// Appel des middelwares Auth (token) et Multer (images)
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Appel des controllers
const postCtrl = require('../controllers/post');
const likeCtrl = require('../controllers/like');
const commentCtrl = require('../controllers/comment');


// POSTS
router.post('/', auth, multer, postCtrl.createPost);
router.get('/', auth, postCtrl.getAllPosts);
router.get('/:postId', auth, postCtrl.getOnePost);
router.put('/:postId', auth, multer, postCtrl.updatePost);
router.delete('/:postId', auth, postCtrl.deletePost);
// LIKES
router.post('/:postId/like', auth, likeCtrl.createLike);
// COMMENTS
router.post('/:postId/comment', auth, commentCtrl.createComment);
router.get('/:postId/comment', auth, commentCtrl.getAllComments);
router.put('/:postId/comment/:commentId', auth, commentCtrl.updateComment);
router.delete('/:postId/comment/:commentId', auth, commentCtrl.deleteComment);

module.exports = router;