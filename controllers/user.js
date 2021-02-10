const bcrypt = require('bcrypt');
//const User = require('../models/user');
const bdd = require("../bdd");
const fs = require('fs');

exports.updateUser = (req, res, next) => {
    const userObject = JSON.parse(req.body.user);
    bdd.promise("SELECT password, imageUrl FROM users WHERE id=? LIMIT 1", [req.params.id])
    .then(result => {
        if (result.length > 0) {
            if (req.file && `${req.protocol}://${req.get('host')}/images/${req.file.filename}` != result[0].imageUrl) {
                const filename = result[0].imageUrl.split('/images/')[1];
                if (filename != 'user.png') {
                    fs.unlink(`images/${filename}`,() => {});
                }
            }
            const userImageUrl = (req.file) ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : result[0].imageUrl;
            bdd.promise("UPDATE users SET email=?, firstName=?, lastname=?, imageUrl=? WHERE id=?", [userObject.email, userObject.firstName, userObject.lastName, userImageUrl, req.params.id])
            .then(() => res.status(201).json({ message: "Compte modifié avec succès." }))
            .catch(error => res.status(500).json({ message: ""+error }));

        } else {
            return res.status(401).json({ message: "Aucun compte associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ message: ""+error }));
};

exports.deleteUser = (req, res, next) => {
    bdd.promise("SELECT password, imageUrl FROM users WHERE id=? LIMIT 1", [req.params.id])
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
                    bdd.promise("DELETE FROM users WHERE id=? && email=?", [req.params.id, req.body.email])
                    .then(() => res.status(201).json({ message: "Compte supprimé avec succès." }))
                    .catch(error => res.status(500).json({ message: ""+error }));
                }
            })
            .catch(error => res.status(500).json({ message: ""+error }));
        } else {
            return res.status(401).json({ message: "Aucun compte associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ message: ""+error }));   
};

exports.getOneUser = (req, res, next) => {
    bdd.promise("SELECT firstName, lastName, imageUrl FROM users WHERE id = ?", [req.params.id], "Impossible d'afficher l'utilisateur demandé.")
    .then(user => res.status(200).json(user))
    .catch(error => res.status(400).json({ message: ""+error }));
};

exports.getAllUsers = (req, res, next) => {
    bdd.promise("SELECT id, firstName, lastName, imageUrl FROM users",[], "Impossible d'afficher les utilisateurs.")
    .then(users => res.status(200).json(users))
    .catch(error => res.status(400).json({ message: ""+error }));
};