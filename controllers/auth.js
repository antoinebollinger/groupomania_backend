const bcrypt = require('bcrypt');
//const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bdd = require("../bdd");

exports.signup = (req, res, next) => {
    const userObject = JSON.parse(req.body.user);
    const userImage = (req.file) ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : "zero.png";
    console.log(userObject);
    bdd.promise("SELECT COUNT(id) AS user_exists FROM users WHERE email=? LIMIT 1;", [userObject.email])
    .then(result => {
        if (result[0].user_exists == 0) {
            bcrypt.hash(userObject.password, 10) 
            .then(hash => {
                const query_insert = "INSERT INTO users (email, password, firstName, lastName, image, admin) VALUES (?, ?, ?, ?, ?, ?)";
                const query_params = [userObject.email, hash, userObject.firstName, userObject.lastName, userImage, userObject.admin];
                bdd.promise(query_insert, query_params, "Impossible de créer le compte.")
                .then(() => res.status(201).json({ message: "Compte créé avec succès." }))
                .catch(error => res.status(500).json({ message: ""+error }));
            })
            .catch(error => res.status(500).json({ message: ""+error }));
        } else {
            throw new Error("Cet email est déjà associé à un compte.");
        }
    })
    .catch(error => res.status(500).json({ message: ""+error }));
};

exports.login = (req, res, next) => {
    bdd.promise("SELECT * FROM users WHERE email=? LIMIT 1", [req.body.email])
    .then(result => {
        if (result.length > 0) {
            bcrypt.compare(req.body.password, result[0].password)
            .then(valid => {
                if (!valid) {
                    return res.status(401).json({ message: "Mot de passe incorrect !" });
                } else {
                    res.status(200).json({
                        userId: result[0].id,
                        token: jwt.sign(
                            {userId: result[0].id},
                            'RANDOM_TOKEN_SECRET',
                            {expiresIn: '24h'}
                        ),
                        firstName: result[0].firstName,
                        lastName: result[0].lastName,
                        image: result[0].image,
                        admin: (result[0].admin == 0) ? false : true
                    });
                }
            })
            .catch(error => res.status(500).json({ message: ""+error }));
        } else {
            return res.status(401).json({ message: "Aucun compte n'est associé à cet email." });
        }
    })
    .catch(error => res.status(500).json({ message: ""+error }));
};