const bdd = require("../bdd/bdd");
const queries = require('../queries/like.json');

exports.createLike = (req, res, next) => {
    bdd.promise(queries.create.check, [req.params.postId])
    .then(result => {
        if (result.length > 0) {
            bdd.promise(queries.create.delete,[req.params.postId, req.body.currentUserId], "Erreur sur le delete")
            .then(() => {
                const test_array = [1, -1];
                if (test_array.includes(req.body.like)) {
                    bdd.promise(queries.create.insert, [req.params.postId, req.body.currentUserId,req.body.like], "Problème d'accès à la base de données.")
                    .then(() => res.status(200).json({ message: "Like mis à jour avec succès !" }))
                    .catch(error => res.status(400).json({ message: ""+error }));
                } else {
                    if (req.body.like == 0) {
                        return res.status(200).json({ message: "Le like/dislike a bien été supprimé." });
                    } else {
                        return res.status(400).json({ message: "Aucune action n'a été réalisée." });
                    }
                }
            })
            .catch(error => res.status(400).json({ message: ""+error }));
        } else {
            return res.status(401).json({ message: "Aucun post associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ message: ""+error }));
};