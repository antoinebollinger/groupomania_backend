const bcrypt = require('bcrypt');
//const User = require('../models/user');
const bdd = require("../bdd");

exports.updateUser = (req, res, next) => {

};

exports.deleteUser = (req, res, next) => {
    bdd.promise("SELECT * FROM users WHERE email=? LIMIT 1", [req.body.email])
    .then(result => {
        if (result.length > 0) {
            bcrypt.compare(req.body.password, result[0].password)
            .then(valid => {
                if (!valid) {
                    return res.status(401).json({ message: "Mot de passe incorrect !" });
                } else {
                    //delete image
                    bdd.promise("DELETE FROM users WHERE email = ?", [req.body.email])
                    .then(() => res.status(201).json({ message: "Compte supprimé avec succès." }))
                    .catch(error => res.status(500).json({ message: ""+error }));
                }
            })
            .catch(error => res.status(500).json({ message: ""+error }));
        } else {
            return res.status(401).json({ message: "Erreur sur l'email associé à ce compte." });
        }
    })
    .catch(error => res.status(500).json({ message: ""+error }));   
};

exports.getOneUser = (req, res, next) => {
    bdd.promise("SELECT firstName, lastName, image FROM users WHERE id = ?", [req.params.id])
    .then(user => res.status(200).json(user))
    .catch(error => res.status(400).json({ message: ""+error }));
};

exports.getAllUsers = (req, res, next) => {
    bdd.promise("SELECT id, firstName, lastName, image FROM users")
    .then(users => res.status(200).json(users))
    .catch(error => res.status(400).json({ message: ""+error }));
};