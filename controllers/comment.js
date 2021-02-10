//const User = require('../models/comment');
const bdd = require("../bdd");

exports.createComment = (req, res, next) => {
    return res.status(200).json({ message: "Commentaire créé avec succès !"})
};

exports.deleteComment = (req, res, next) => {
    return res.status(200).json({ message: "Commentaire supprimé avec succès !"})
};