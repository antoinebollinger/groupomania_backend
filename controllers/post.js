const bdd = require("../bdd/bdd");
const queries = require('../queries/post.json');
const htmlspecialchars = require('htmlspecialchars');
const fs = require('fs');

exports.createPost = (req, res, next) => {
    const postObject = JSON.parse(req.body.post);
    const postImageUrl = (req.file) ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : "";
    bdd.promise(queries.create, [postObject.currentUserId, htmlspecialchars(postObject.content), postImageUrl], "Impossible de créer la publication.")
    .then(response => res.status(201).json({ message: "Publication créée avec succès.", postId: response[1] }))
    .catch(error => res.status(400).json({ error }));
};

exports.getOnePost = (req, res, next) => {
    bdd.promise(queries.getOne, [req.query.currentUserId, req.params.postId], "Impossible d'afficher la publication demandée.")
    .then(post => res.status(200).json(post))
    .catch(error => res.status(400).json({ error }));
};

exports.getAllPosts = (req, res, next) => {
    const query = (typeof req.query.userId == "undefined") ? queries.getAll.noFilter : queries.getAll.withFilter ;
    const queryParams = (typeof req.query.userId == "undefined") ? [req.query.currentUserId] : [req.query.currentUserId, req.query.userId] ;
    bdd.promise(query, queryParams, "Impossible d'afficher les publications.")
    .then(post => res.status(200).json(post))
    .catch(error => res.status(400).json({ error }));
};

exports.updatePost = (req, res, next) => {
    const postObject = JSON.parse(req.body.post);
    const query = (postObject.admin) ? queries.update.check.isAdmin : queries.update.check.notAdmin ;
    const queryParams = (postObject.admin) ? [req.params.postId] : [req.params.postId, postObject.currentUserId] ;
    bdd.promise(query, queryParams)
    .then(result => {
        if (result.length > 0) {
            if (req.file && `${req.protocol}://${req.get('host')}/images/${req.file.filename}` != result[0].imageUrl) {
                const filename = result[0].imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`,() => {});
            }   
            const postImageUrl = (req.file) ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : result[0].imageUrl;
            bdd.promise(queries.update.update, [htmlspecialchars(postObject.content), postImageUrl, req.params.postId])
            .then(() => res.status(201).json({ message: "Publication modifiée avec succès." }))
            .catch(error => res.status(500).json({ error }));     
        } else {
            return res.status(401).json({ message: "Aucune publication associée n'a été trouvée." });
        }
    })
    .catch(error => res.status(500).json({ error }));
};

exports.deletePost = (req, res, next) => {
    const query = (req.body.admin) ? queries.delete.check.isAdmin : queries.delete.check.notAdmin ;
    const queryParams = (req.body.admin) ? [req.params.postId] : [req.params.postId, req.body.currentUserId] ;
    bdd.promise(query, queryParams)
    .then(result => {
        if (result.length > 0) {
            if (result[0].imageUrl != "") {
                const filename = result[0].imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`,() => {});
            }
            bdd.promise(queries.delete.delete, [req.params.postId])
            .then(() => res.status(201).json({ message: "Publication supprimée avec succès." }))
            .catch(error => res.status(500).json({ message: ""+error }));     
        } else {
            return res.status(401).json({ message: "Aucune publication associée n'a été trouvée." });
        }
    })
    .catch(error => res.status(500).json({ error }));
};