const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bdd = require("../bdd/bdd");
const checkFunctions = require("../middleware/functions");

exports.signup = (req, res, next) => {
    const userImageUrl = (req.file) ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : `${req.protocol}://${req.get('host')}/images/user.png`;
    const userObject = JSON.parse(req.body.user);
    const userObjectTest = {
        "email": {
            "value": userObject.email,
            "type": "email"
        },
        "password": {
            "value": userObject.password,
            "type": "password"
        },
        "firstName": {
            "value": userObject.firstName,
            "type": "text"
        },
        "lastName": {
            "value": userObject.lastName,
            "type": "text"
        }
    }
    const goSignup = checkFunctions.checkForm(userObjectTest);
    if (goSignup.valid) {
        bdd.promise("SELECT id FROM users WHERE email=? LIMIT 1;", [userObject.email])
        .then(result => {
            if (result.length == 0) {
                bcrypt.hash(userObject.password, 10) 
                .then(hash => {
                    const query_insert = "INSERT INTO users (email, password, firstName, lastName, imageUrl) VALUES (?, ?, ?, ?, ?)";
                    const query_params = [userObject.email, hash, userObject.firstName, userObject.lastName, userImageUrl];
                    bdd.promise(query_insert, query_params, "Impossible de créer le compte.")
                    .then(() => res.status(201).json({ message: "Compte créé avec succès." }))
                    .catch(error => res.status(500).json({ error }));
                })
                .catch(error => res.status(500).json({ error }));
            } else {
                return res.status(401).json({ message: "Cet email est déjà associé à un compte." });
            }
        })
        .catch(error => res.status(500).json({ error }));
    } else {
        return res.status(401).json({ message: "Impossible de créer un compte. Veuillez vérifier vos informations." });
    }
};

exports.login = (req, res, next) => {
    const userObjectTest = {
        "email": {
            "value": req.body.email,
            "type": "email"
        },
        "password": {
            "value": req.body.password,
            "type": "password"
        }
    }
    const goLogin = checkFunctions.checkForm(userObjectTest);
    if (goLogin.valid) {
        bdd.promise("SELECT * FROM users WHERE email=? LIMIT 1", [req.body.email])
        .then(result => {
            if (result.length > 0) {
                bcrypt.compare(req.body.password, result[0].password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ objet: "password", message: "Mot de passe incorrect !" });
                    } else {
                        res.status(200).json({
                            currentUserId: result[0].id,
                            token: jwt.sign(
                                {userId: result[0].id},
                                'RANDOM_TOKEN_SECRET',
                                {expiresIn: '24h'}
                            ),
                            firstName: result[0].firstName,
                            lastName: result[0].lastName,
                            imageUrl: result[0].imageUrl,
                            admin: (result[0].admin == 0) ? false : true
                        });
                    }
                })
                .catch(error => res.status(500).json({ error }));
            } else {
                return res.status(401).json({ objet: "email", message: "Aucun compte n'est associé à cet email." });
            }
        })
       .catch(error => res.status(500).json({ error }));
    } else {
        return res.status(401).json({ objet: "email",message: "Impossible de se connecter à ce compte. Veuillez vérifier vos informations." });       
    }
};

exports.logout = (req, res, next) => {
    return res.status(200).json({ message: "Vous devriez être déconnecté et redirigé vers la page d'accueil."});
};