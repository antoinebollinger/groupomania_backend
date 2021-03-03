const bdd = require("../bdd/bdd");
const queries = require('../queries/user.json');
const bcrypt = require('bcrypt');
const fs = require('fs');

exports.getOneUser = (req, res, next) => {
    bdd.promise(queries.getOne, [req.params.userId], "Impossible d'afficher l'utilisateur demandé.")
    .then(user => res.status(200).json(user))
    .catch(error => res.status(400).json({ error }));
};

exports.getAllUsers = (req, res, next) => {
    bdd.promise(queries.getAll,[], "Impossible d'afficher les utilisateurs.")
    .then(users => res.status(200).json(users))
    .catch(error => res.status(400).json({ error }));
};

exports.updateUser = (req, res, next) => {
    const userObject = JSON.parse(req.body.user);
    bdd.promise(queries.update.check, [req.params.currentUserId])
    .then(result => {
        if (result.length > 0) {
            if (req.file && `${req.protocol}://${req.get('host')}/images/${req.file.filename}` != result[0].imageUrl) {
                const filename = result[0].imageUrl.split('/images/')[1];
                if (filename != 'user.png') {
                    fs.unlink(`images/${filename}`,() => {});
                }
            }
            const userImageUrl = (req.file) ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : result[0].imageUrl;
            bdd.promise(queries.update.update, [userObject.email, userObject.firstName, userObject.lastName, userImageUrl, req.params.currentUserId])
            .then(() => res.status(201).json({ message: "Compte modifié avec succès.", newUrl: userImageUrl }))
            .catch(error => res.status(500).json({ error }));

        } else {
            return res.status(401).json({ message: "Aucun compte associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ error }));
};

exports.deleteUser = (req, res, next) => {
    bdd.promise(queries.delete.check, [req.params.currentUserId, req.body.email])
    .then(result => {
        if (result.length > 0) {
            bcrypt.compare(req.body.password, result[0].password)
            .then(valid => {
                if (!valid) {
                    return res.status(401).json({ message: "Mot de passe incorrect !" });
                } else {
                    const filename = result[0].imageUrl.split('/images/')[1];
                    if (filename != 'user.png') {
                        fs.unlink(`images/${filename}`,() => {});
                    }
                    let query = (req.body.deletePosts) ? queries.delete.delete.userAndDatas : queries.delete.delete.onlyUser ;
                    let queryParams = [req.params.currentUserId, req.body.email] ;
                    let queryMessage = (req.body.deletePosts) ? "Votre compte et toutes les publications associées, commentaires et likes ont bien été supprimés." : "Votre compte a bien été supprimé." ;
                    bdd.promise(query, queryParams)
                    .then(() => {
                        if (req.body.deletePosts) {
                            bdd.promise(queries.delete.delete.images, [req.params.currentUserId])
                            .then(result => {
                                result.forEach(element => {
                                    console.log(element.imageUrl);
                                    let fileUrl = element.imageUrl.split('/images/')[1]
                                    if (fileUrl != 'user.png') {
                                        fs.unlink(`images/${fileUrl}`,() => {});
                                    }
                                });
                                return res.status(201).json({ message: queryMessage })
                            })
                            .catch(error => res.status(500).json({ error }));
                        } else {
                            return res.status(201).json({ message: queryMessage })
                        }
                    })
                    .catch(error => res.status(500).json({ error }));
                }
            })
            .catch(error => res.status(500).json({ error }));
        } else {
            return res.status(401).json({ message: "Aucun compte associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ error }));   
};