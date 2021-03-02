const Comment = require('../models/comment');
const bdd = require("../bdd/bdd");

exports.createComment = (req, res, next) => {
    bdd.promise("SELECT id FROM posts WHERE id=? LIMIT 1", [req.params.postId])
    .then(result => {
        if (result.length > 0) {
            bdd.promise("INSERT INTO comments (postId, userId, content) VALUE (?, ?, ?)", [req.params.postId, req.body.currentUserId, req.body.content], "Problème d'accès à la base de données")
            .then(() => res.status(200).json({ message: "Commentaire créé avec succès !" }))
            .catch(error => res.status(400).json({ message: ""+error }));
        } else {
            return res.status(401).json({ message: "Aucun post associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ message: ""+error }));
};

exports.getAllComments = (req, res, next) => {
    bdd.promise("SELECT c.id, c.postId, c.userId, COALESCE(u.firstName,'') AS 'firstName', COALESCE(u.lastName,'') AS 'lastName', u.imageUrl AS 'userImage',c.content, c.commentDate FROM comments c LEFT JOIN users u ON c.userId = u.id WHERE c.postId=? ORDER BY c.commentDate ASC",[req.params.postId], "Impossible d'afficher les commentaires.")
    .then(comments => res.status(200).json(comments))
    .catch(error => res.status(400).json({ message: ""+error }));
};

exports.updateComment = (req, res, next) => {
    bdd.promise("UPDATE comments SET content = ? WHERE id = ? && userId = ? && postId = ?", [req.body.content, req.params.commentId, req.body.currentUserId, req.params.postId])
    .then(() => res.status(201).json({ message: "Commentaire modifié avec succès." }))
    .catch(error => res.status(500).json({ error }));
}; 

exports.deleteComment = (req, res, next) => {
    const queryFilter = (req.body.admin) ? "" : " && userId=?" ;
    const queryParams = (req.body.admin) ? [req.params.commentId] : [req.params.commentId, req.body.currentUserId] ;
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