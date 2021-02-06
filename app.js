const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const helmet = require("helmet");

// Création de l'app
const app = express();

// Sécurisation avec le package Helmet
app.use(helmet());

// Protection contre les injections sur MongoDB
app.use(mongoSanitize({ replaceWith: "_" }));

// Appel des routes
//const userRoutes = require('./routes/user'); // Utilisateur
//const sauceRoutes = require('./routes/sauce'); // Sauce

// Connection à la bdd
mongoose.connect('mongodb+srv://user:phsm6ZnNiDYFdDzl@cluster0.dq28w.mongodb.net/groupomania?retryWrites=true&w=majority',
    { useNewUrlParser: true,
    useUnifiedTopology: true })
        .then(() => console.log('Connexion à MongoDB réussie !'))
        .catch(() => console.log('Connexion à MongoDB échouée !'));

// Définition Headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Utilisation de Body Parser
app.use(bodyParser.json());

// Gestionnaire du dossier Images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Définition des routes
//app.use('/api/auth', userRoutes); // Utilisateurs
//app.use('/api/sauces', sauceRoutes); // Sauces

// Export
module.exports = app;