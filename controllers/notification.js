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
    bdd.promise(queries.getAllActive,[req.params.currentUserId], "Impossible d'afficher les notifications.")
    .then(notifications => res.status(200).json(notifications))
    .catch(error => res.status(400).json({ error }));
};

exports.disableNotif = (req, res, next) => {
    bdd.promise(queries.disable, [req.params.notifId], "Impossible de désactiver la notification.")
    .then(() => res.status(201).json({ message: "La notification a bien été désactivée." }))
    .catch(error => res.status(400).json({ error }));
};

exports.enableNotif = (req, res, next) => {
    bdd.promise(queries.enable, [req.params.notifId], "Impossible d'activer la notification.")
    .then(() => res.status(201).json({ message: "La notification a bien été activée." }))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteNotif = (req, res, next) => {
    bdd.promise(queries.delete, [req.params.notifId], "Impossible de supprimer la notification.")
    .then(() => res.status(201).json({ message: "La notification a bien été supprimée." }))
    .catch(error => res.status(400).json({ error }));
};