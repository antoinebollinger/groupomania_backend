const Post = require('../models/post');
const bdd = require("../bdd/bdd");
const fs = require('fs');

exports.createPost = (req, res, next) => {
    const postObject = JSON.parse(req.body.post);
    const postImageUrl = (req.file) ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : "";
    bdd.promise("INSERT INTO posts (userId, content, imageUrl) VALUES (?, ?, ?)", [postObject.currentUserId, postObject.content, postImageUrl], "Impossible de créer le post.")
    .then(() => res.status(201).json({ message: "Post créé avec succès." }))
    .catch(error => res.status(400).json({ message: ""+error }));
};

exports.getOnePost = (req, res, next) => {
    const query = 'SELECT p.id, p.userId, p.content, p.imageUrl, p.postDate, SUM(CASE l.value WHEN 1 THEN 1 ELSE 0 END) AS "likes", SUM(CASE l.value WHEN -1 THEN 1 ELSE 0 END) AS "dislikes", COALESCE(c.comments,0) AS "comments", SUM(CASE l.userId WHEN ? THEN l.value ELSE 0 END) AS "currentUserLike" FROM posts p LEFT JOIN likes l ON l.postId = p.id LEFT JOIN (SELECT postId, COUNT(id) AS "comments" FROM comments GROUP BY postId) AS c ON c.postId = p.id WHERE p.id=? GROUP BY p.id';
    const queryParams = [req.body.currentUserId, req.params.postId];
    bdd.promise(query, queryParams, "Impossible d'afficher le post demandé.")
    .then(post => res.status(200).json(post))
    .catch(error => res.status(400).json({ message: ""+error }));
};

exports.getAllPosts = (req, res, next) => {
    const queryFilter = (Object.keys(req.query).length > 0) ? " WHERE p.userId = ?" : "";
    const query = 'SELECT p.id, p.userId, p.content, p.imageUrl, p.postDate, SUM(CASE l.value WHEN 1 THEN 1 ELSE 0 END) AS "likes", SUM(CASE l.value WHEN -1 THEN 1 ELSE 0 END) AS "dislikes", COALESCE(c.comments,0) AS "comments", SUM(CASE l.userId WHEN ? THEN l.value ELSE 0 END) AS "currentUserLike" FROM posts p LEFT JOIN likes l ON l.postId = p.id LEFT JOIN (SELECT postId, COUNT(id) AS "comments" FROM comments GROUP BY postId) AS c ON c.postId = p.id '+queryFilter+' GROUP BY p.id';
    const queryParams = (Object.keys(req.query).length > 0) ? [req.body.currentUserId, req.query.userId] : [req.body.currentUserId];
    bdd.promise(query, queryParams, "Impossible d'afficher les posts.")
    .then(post => res.status(200).json(post))
    .catch(error => res.status(400).json({ message: ""+error }));
};

exports.updatePost = (req, res, next) => {
    const postObject = JSON.parse(req.body.post);
    const queryFilter = (postObject.admin) ? "" : " && userId=?" ;
    const queryParams = (postObject.admin) ? [req.params.postId] : [req.params.postId, postObject.currentUserId] ;
    bdd.promise("SELECT imageUrl FROM posts WHERE id=? "+queryFilter+" LIMIT 1", queryParams)
    .then(result => {
        if (result.length > 0) {
            if (req.file && `${req.protocol}://${req.get('host')}/images/${req.file.filename}` != result[0].imageUrl) {
                const filename = result[0].imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`,() => {});
            }   
            const postImageUrl = (req.file) ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : result[0].imageUrl;
            bdd.promise("UPDATE posts SET content=?, imageUrl=? WHERE id=?", [postObject.content, postImageUrl, req.params.postId])
            .then(() => res.status(201).json({ message: "Post modifié avec succès." }))
            .catch(error => res.status(500).json({ message: ""+error }));     
        } else {
            return res.status(401).json({ message: "Aucun post associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ message: ""+error }));
};

exports.deletePost = (req, res, next) => {
    const postObject = JSON.parse(req.body.post);
    const queryFilter = (postObject.admin) ? "" : " && userId=?" ;
    const queryParams = (postObject.admin) ? [req.params.postId] : [req.params.postId, postObject.currentUserId] ;
    bdd.promise("SELECT imageUrl FROM posts WHERE id=? "+queryFilter+" LIMIT 1", queryParams)
    .then(result => {
        if (result.length > 0) {
            if (result[0].imageUrl != "") {
                const filename = result[0].imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`,() => {});
            }
            bdd.promise("DELETE FROM posts WHERE id=?", [req.params.postId])
            .then(() => res.status(201).json({ message: "Post supprimé avec succès." }))
            .catch(error => res.status(500).json({ message: ""+error }));     
        } else {
            return res.status(401).json({ message: "Aucun post associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ message: ""+error }));
};