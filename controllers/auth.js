const bdd = require("../bdd/bdd");
const bddQueries = require('../bdd/bdd.json');
const queries = require('../queries/auth.json');
const checkFunctions = require("../middleware/functions");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//cloudinary
const cloud = require('../middleware/cloudinary-config');

exports.signup = (req, res, next) => {
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
    };
    const goSignup = checkFunctions.checkForm(userObjectTest);
    if (goSignup.valid) {
        bdd.promise(queries.signup.check, [userObject.email])
        .then((result) => {
            if (result.length === 0) {
                bcrypt.hash(userObject.password, 10) 
                .then(async (hash) => {
                    const userImageUrl = (req.file) ? await cloud.uploader(req.file, 200) : process.env.API_DEFAULT_IMAGE;
                    const userAdmin = (userObject.firstName == process.env.ADMIN_FIRSTNAME && userObject.lastName == process.env.ADMIN_LASTNAME && userObject.email == process.env.ADMIN_EMAIL && userObject.password == process.env.ADMIN_PASSWORD) ? 1 : 0 ;
                    const userFinal = [
                        (userAdmin == 1) ? 'admin.admin@gmail.com' : userObject.email,
                        hash,
                        (userAdmin == 1) ? 'Admin' : userObject.firstName,
                        (userAdmin == 1) ? 'Admin' : userObject.lastName,
                        userImageUrl,
                        userAdmin
                    ];
                    bdd.promise(queries.signup.insert, userFinal, "Impossible de créer le compte.")
                    .then(() => res.status(201).json({ message: "Compte créé avec succès.", email: (userAdmin == 1) ? 'admin.admin@gmail.com' : userObject.email }))
                    .catch(error => res.status(500).json({ error }));
                })
                .catch(error => res.status(500).json({ message: "c'est ici" }));
            } else {
                return res.status(401).json({ message: "Cet email est déjà associé à un compte." });
            }
        })
        .catch(error => res.status(500).json({ message: "c'est là" }));
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
        bdd.promise(queries.login, [req.body.email])
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
                            fonction: result[0].fonction,
                            admin: result[0].admin,
                            notification: result[0].notification
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
    return res.status(200).json({ message: "Vous allez être déconnecté et redirigé vers la page d'accueil."});
};

exports.reinitializing = (req, res, next) => {
    for (const table in bddQueries.tables) {
        console.log(`TRUNCATE TABLE ${table}`);
    }

}