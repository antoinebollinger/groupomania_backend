const Comment = require('../models/comment');
const bdd = require("../bdd");

exports.createComment = (req, res, next) => {
    const commentObject = JSON.parse(req.body.comment);
    bdd.promise("INSERT INTO comments (postId, userId, content) VALUE (?, ?, ?)", [req.params.postId, commentObject.currentUserId, commentObject.content], "Problème d'accès à la base de données")
    .then(() => res.status(200).json({ message: "Commentaire créé avec succès !" }))
    .catch(error => res.status(400).json({ message: ""+error }));
};

exports.getAllComments = (req, res, next) => {
    bdd.promise("SELECT userId, content FROM comments",[], "Impossible d'afficher les commentaires.")
    .then(comments => res.status(200).json(comments))
    .catch(error => res.status(400).json({ message: ""+error }));
};

exports.deleteComment = (req, res, next) => {
    const commentObject = JSON.parse(req.body.comment);
    const queryFilter = (commentObject.admin) ? "" : " && userId=?" ;
    const queryParams = (commentObject.admin) ? [req.params.commentId] : [req.params.commentId, commentObject.currentUserId] ;
    bdd.promise("SELECT * FROM comments WHERE id=? "+queryFilter, queryParams)
    .then(result => {
        if (result.length > 0) {
            bdd.promise("DELETE FROM comments WHERE id=?", [req.params.commentId])
            .then(() => res.status(201).json({ message: "Commentaire supprimé avec succès." }))
            .catch(error => res.status(500).json({ message: ""+error }));     
        } else {
            return res.status(401).json({ message: "Aucun commentaire associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ message: ""+error }));
};