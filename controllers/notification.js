const bdd = require("../bdd/bdd");
const queries = require("../queries/notification.json");

exports.createNotif = (req, res, next) => {
    bdd.promise(queries.create, [req.body.currentUserId, req.body.postId, req.body.commentId])
    .then(() => res.status(201).json({ message: "Notification créée avec succès." }))
    .catch(error => res.status(400).json({ error }));
};

exports.getNotif = (req, res, next) => {  
    bdd.promise(queries.getAll,[req.params.currentUserId], "Impossible d'afficher les notifications.")
    .then(notifications => res.status(200).json(notifications))
    .catch(error => res.status(400).json({ error }));
};

exports.getActiveNotif = (req, res, next) => {
    bdd.promise(queries.getAllActive,[req.params.currentUserId, req.params.currentUserId], "Impossible d'afficher les notifications.")
    .then(notifications => res.status(200).json(notifications))
    .catch(error => res.status(400).json({ error }));
};

exports.unactiveNotif = (req, res, next) => {
    bdd.promise(queries.unactive, [req.params.notifId, req.body.currentUserId], "Impossible de désactiver la notification.")
    .then(() => res.status(201).json({ message: "La notification a bien été désactivée." }))
    .catch(error => res.status(400).json({ error }));
};

exports.activeNotif = (req, res, next) => {
    bdd.promise(queries.active, [req.params.notifId, req.body.currentUserId], "Impossible d'activer la notification.")
    .then(() => res.status(201).json({ message: "La notification a bien été activée." }))
    .catch(error => res.status(400).json({ error }));
};