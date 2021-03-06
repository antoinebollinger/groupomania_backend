const bdd = require("../bdd/bdd");
const queries = require('../queries/user.json');
const checkFunctions = require("../middleware/functions");
const bcrypt = require('bcrypt');
const path = require('path');

//cloudinary
const cloud = require('../middleware/cloudinary-config');

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

exports.getRandUsers = (req, res, next) => {
    bdd.promise(queries.getRand,[req.params.currentUserId, parseFloat(req.params.nbRand)], "Impossible d'afficher les utilisateurs.")
    .then(users => res.status(200).json(users))
    .catch(error => res.status(400).json({ error }));
};

exports.getUsersWithFilter = (req, res, next) => {
    bdd.promise(queries.getUsersWithFilter,[req.params.currentUserId, `%${req.params.filter}%`, `%${req.params.filter}%`, `%${req.params.filter}%`], "Impossible d'afficher les utilisateurs.")
    .then(users => res.status(200).json(users))
    .catch(error => res.status(400).json({ error }));
};

exports.userWantsNotifs = (req, res, next) => {
    const queryMessage = (req.body.notification == 1) ? "Notifications activées avec succès" : "Notifications désactivées avec succès" ;
    bdd.promise(queries.userWantsNotifs, [req.body.notification, req.params.currentUserId])
    .then(() => res.status(201).json({ message: queryMessage }))
    .catch(error => res.status(500).json({ error }));    
};

exports.resetActiveNotifs = (req, res, next) => {
    bdd.promise(queries.resetActiveNotifs, [req.params.currentUserId])
    .then(() => res.status(201).json({ message: 'Remise à zéro du compteur des notifications' }))
    .catch(error => res.status(500).json({ error }));  
}

exports.updateUser = (req, res, next) => {
    const userObject = JSON.parse(req.body.user);
    const userObjectTest = {
        "email": {
            "value": userObject.email,
            "type": "email"
        },
        "firstName": {
            "value": userObject.firstName,
            "type": "text"
        },
        "lastName": {
            "value": userObject.lastName,
            "type": "text"
        },
        "fonction": {
            "value": userObject.fonction,
            "type": "textEmpty"
        }
    };
    const goUpdate = checkFunctions.checkForm(userObjectTest);
    if (goUpdate.valid) {
        bdd.promise(queries.update.check, [req.params.currentUserId])
        .then(async (result) => {
            if (result.length > 0) {
                if (req.file && result[0].imageUrl != process.env.API_DEFAULT_IMAGE) {
                    const deleteImage = result[0].imageUrl;
                    const deleteImageId = path.parse(deleteImage.substring(deleteImage.lastIndexOf('/') + 1)).name;
                    await cloud.destroyer(process.env.API_FOLDER+'/'+deleteImageId);
                }               
                const userImageUrl = (req.file) ? await cloud.uploader(req.file, 200) : result[0].imageUrl;
                bdd.promise(queries.update.update, [userObject.email, userObject.firstName, userObject.lastName, userObject.fonction, userImageUrl, req.params.currentUserId])
                .then(() => res.status(201).json({ message: "Compte modifié avec succès.", newUrl: userImageUrl }))
                .catch(error => res.status(500).json({ error }));

            } else {
                return res.status(401).json({ message: "Aucun compte associé n'a été trouvé." });
            }
        })
        .catch(error => res.status(500).json({ error }));
    } else {
        return res.status(401).json({ message: "Impossible de modifier ce compte. Veuillez vérifier vos informations." });        
    }
};

exports.updatePwd = (req, res, next) => {
    bdd.promise(queries.updatePwd.check, [req.params.currentUserId])
    .then(result => {
        if (result.length > 0) {
            bcrypt.compare(req.body.oldPwd, result[0].password)
            .then(valid => {
                if (!valid) {
                    return res.status(401).json({ objet: "password", message: "Mot de passe incorrect !" });
                } else {
                    if (req.body.newPwd1 != req.body.newPwd2) {
                        return res.status(401).json({ objet: "password", message: "Les nouveaux mots de passe ne correspondent pas." });
                    } else {
                        const userObjectTest = {
                            "newPwd1": {
                                "value": req.body.newPwd1,
                                "type": "password"
                            },
                            "newPwd2": {
                                "value": req.body.newPwd2,
                                "type": "password"
                            }
                        };
                        const goUpdate = checkFunctions.checkForm(userObjectTest);
                        if (goUpdate.valid) {
                            bcrypt.hash(req.body.newPwd1, 10) 
                            .then(hash => {
                                bdd.promise(queries.updatePwd.update, [hash, req.params.currentUserId])
                                .then(() => res.status(201).json({ message: "Mot de passe modifié avec succès." }))
                                .catch(error => res.status(500).json({ error }));
                            })
                            .catch(error => res.status(500).json({ error }));
                        } else {
                            return res.status(401).json({ message: "Impossible de modifier le mot de passe. Veuillez vérifier vos informations." });
                        }
                    }
                }
            })
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
        let imgToDelete = []; 
        if (result[0].imgProfil != process.env.API_DEFAULT_IMAGE) {imgToDelete.push(result[0].imgProfil);}
        result.forEach(element => {
            if (req.body.deleteDatas && element.imgPosts != '') {
                imgToDelete.push(element.imgPosts);
            }
        });
        if (result.length > 0) {
            bcrypt.compare(req.body.password, result[0].password)
            .then(valid => {
                if (!valid && !req.body.admin) {
                    return res.status(401).json({ message: "Mot de passe incorrect !" });
                } else {
                    imgToDelete.forEach(async (element) => {
                        let deleteImageId = path.parse(element.substring(element.lastIndexOf('/') + 1)).name;
                        await cloud.destroyer(process.env.API_FOLDER+'/'+deleteImageId);          
                    })
                    let query = (req.body.deleteDatas) ? queries.delete.delete.userAndDatas : queries.delete.delete.onlyUser ;
                    let queryMessage = (req.body.admin) ? `Vous venez de supprimer l'utilisateur ${req.body.email}.` : ((req.body.deleteDatas) ? "Votre compte et toutes les publications associées, commentaires et likes ont bien été supprimés. Vous allez être redirigé vers l'accueil." : "Votre compte a bien été supprimé. Vous allez être redirigé vers l'accueil.");
                    bdd.promise(query, [req.params.currentUserId, req.body.email])
                    .then(() => res.status(201).json({ message: queryMessage }))
                    .catch(error => res.status(500).json({ error }));
                }
            })
            .catch(error => res.status(500).json({ error, message: "Problème d'admin"+req.body.admin }));
        } else {
            return res.status(401).json({ message: "Aucun compte associé n'a été trouvé." });
        }
    })
    .catch(error => res.status(500).json({ error }));   
};