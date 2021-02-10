const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require("helmet");

// Création de l'app
const app = express();

// Sécurisation avec le package Helmet
app.use(helmet());

// Utilisation de Body Parser
app.use(bodyParser.json());

// Définition Headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Gestionnaire du dossier Images
app.use('/images', express.static(path.join(__dirname, 'images')));

// ---------- Appel et définition des routes ----------------- //

// Auth : inscription et connection
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
// User : gestion du profil de l'utilisateur
const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);
// Post : gestion des posts
const postRoutes = require('./routes/post');
app.use('/api/post', postRoutes);

// Export
module.exports = app;