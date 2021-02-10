//const User = require('../models/like');
const bdd = require("../bdd");

exports.createLike = (req, res, next) => {
    const likeObject = JSON.parse(req.body.like);
    bdd.promise("DELETE FROM likes WHERE postId=? && userId=?",[req.params.id, likeObject.userId], "Erreur sur le delete")
    .then(() => {
        const test_array = [1, -1];
        if (test_array.includes(likeObject.like)) {
            bdd.promise("INSERT INTO likes (postId, userId, value) VALUES (?, ?, ?)", [req.params.id, likeObject.userId,likeObject.like], "Problème d'accès à la base de données.")
            .then(() => res.status(200).json({ message: "Like mis à jour avec succès !" }))
            .catch(error => res.status(400).json({ message: ""+error }));
        } else {
            if (likeObject.like == 0) {
                return res.status(200).json({ message: "Le like/dislike a bien été supprimé." });
            } else {
                return res.status(400).json({ message: "Aucune action n'a été réalisée." });
            }
        }
    })
    .catch(error => res.status(400).json({ message: ""+error }));
};