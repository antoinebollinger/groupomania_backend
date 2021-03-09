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
            bdd.promise(queries.update.update, [userObject.email, userObject.firstName, userObject.lastName, userObject.fonction, userImageUrl, req.params.currentUserId])
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
        let imgToDelete = [result[0].imgProfil];   
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
                    imgToDelete.forEach(element => {
                        let filename = element.split('/images/')[1]
                        if (filename != 'user.png') {
                            fs.unlink(`images/${filename}`,() => {});
                        }              
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