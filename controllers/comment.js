const bdd = require("../bdd/bdd");
const queries = require('../queries/comment.json');
const htmlspecialchars = require('htmlspecialchars');

exports.createComment = (req, res, next) => {
    bdd.promise(queries.create.check, [req.params.postId])
    .then(result => {
        if (result.length > 0) {
            bdd.promise(queries.create.insert, [req.params.postId, req.body.currentUserId, htmlspecialchars(req.body.content)], "Problème d'accès à la base de données")
            .then(response => res.status(200).json({ message: "Commentaire créé avec succès !", commentId: response[1] }))
            .catch(error => res.status(400).json({ error }));
        } else {
            return res.status(401).json({ message: "Aucun post associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ message: ""+error }));
};

exports.getAllComments = (req, res, next) => {
    bdd.promise(queries.getAll,[req.params.postId], "Impossible d'afficher les commentaires.")
    .then(comments => res.status(200).json(comments))
    .catch(error => res.status(400).json({ error }));
};

exports.updateComment = (req, res, next) => {
    bdd.promise(queries.update, [htmlspecialchars(req.body.content), req.params.commentId, req.body.currentUserId, req.params.postId])
    .then(() => res.status(201).json({ message: "Commentaire modifié avec succès." }))
    .catch(error => res.status(500).json({ error }));
}; 

exports.deleteComment = (req, res, next) => {
    const queryFilter = (req.body.admin) ? "" : " && userId=?" ;
    const queryParams = (req.body.admin) ? [req.params.commentId] : [req.params.commentId, req.body.currentUserId] ;
    bdd.promise(queries.delete.check+queryFilter, queryParams)
    .then(result => {
        if (result.length > 0) {
            bdd.promise(queries.delete.delete, [req.params.commentId])
            .then(() => res.status(201).json({ message: "Commentaire supprimé avec succès." }))
            .catch(error => res.status(500).json({ error }));     
        } else {
            return res.status(401).json({ message: "Aucun commentaire associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ error }));
};