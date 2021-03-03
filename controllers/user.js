const bcrypt = require('bcrypt');
const User = require('../models/user');
const bdd = require("../bdd/bdd");
const fs = require('fs');

exports.updateUser = (req, res, next) => {
    const userObject = JSON.parse(req.body.user);
    bdd.promise("SELECT imageUrl FROM users WHERE id=?", [req.params.currentUserId])
    .then(result => {
        if (result.length > 0) {
            if (req.file && `${req.protocol}://${req.get('host')}/images/${req.file.filename}` != result[0].imageUrl) {
                const filename = result[0].imageUrl.split('/images/')[1];
                if (filename != 'user.png') {
                    fs.unlink(`images/${filename}`,() => {});
                }
            }
            const userImageUrl = (req.file) ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : result[0].imageUrl;
            bdd.promise("UPDATE users SET email=?, firstName=?, lastname=?, imageUrl=? WHERE id=?", [userObject.email, userObject.firstName, userObject.lastName, userImageUrl, req.params.currentUserId])
            .then(() => res.status(201).json({ message: "Compte modifié avec succès.", newUrl: userImageUrl }))
            .catch(error => res.status(500).json({ error }));

        } else {
            return res.status(401).json({ message: "Aucun compte associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ error }));
};

exports.deleteUser = (req, res, next) => {
    bdd.promise("SELECT password, imageUrl FROM users WHERE id=? && email=? LIMIT 1", [req.params.currentUserId, req.body.email])
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
                    let query = (req.body.deletePosts) ? 'DELETE u, p, l, c FROM users u INNER JOIN posts p ON p.userId = u.id INNER JOIN likes l ON l.userId = u.id INNER JOIN comments c ON c.userId = u.id WHERE u.id = ? && u.email = ?' : 'DELETE FROM users WHERE id=? && email=?';
                    let queryParams = [req.params.currentUserId, req.body.email] ;
                    let queryMessage = (req.body.deletePosts) ? "Votre compte et toutes les publications associées, commentaires et likes ont bien été supprimés." : "Votre compte a bien été supprimé." ;
                    bdd.promise(query, queryParams)
                    .then(() => {
                        if (req.body.deletePosts) {
                            bdd.promise("SELECT imageUrl FROM posts WHERE userId = ?", [req.params.currentUserId])
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
                            .catch(error => {
                                console.log(error);
                            })
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

exports.getOneUser = (req, res, next) => {
    bdd.promise("SELECT firstName, lastName, imageUrl FROM users WHERE id = ?", [req.params.userId], "Impossible d'afficher l'utilisateur demandé.")
    .then(user => res.status(200).json(user))
    .catch(error => res.status(400).json({ error }));
};

exports.getAllUsers = (req, res, next) => {
    bdd.promise("SELECT id, firstName, lastName, imageUrl FROM users",[], "Impossible d'afficher les utilisateurs.")
    .then(users => res.status(200).json(users))
    .catch(error => res.status(400).json({ error }));
};