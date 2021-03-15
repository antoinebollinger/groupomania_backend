const mysql = require('mysql');
const queries = require('./bdd.json');
require('dotenv').config();

// Création de la connection
const bdd = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
    reconnect: true
});
bdd.connect((err) => {
    if(err) {throw err;}
});

// Création d'une fonction Promise
bdd.promise = (sql, sql_params, erreur) => {
    return new Promise((resolve, reject) => {
        bdd.query(sql, sql_params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Création de la base de données et des tables si elles n'existent pas
bdd.promise("CREATE DATABASE IF NOT EXISTS "+process.env.DB_DATABASE+" /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */", [], "Impossible de créer la base de données")
.then(results => {
    bdd.changeUser({database: process.env.DB_DATABASE}, function(err) {
        if (err) throw err;
        for (const table in queries.tables) {
            bdd.query(queries.tables[table], function(err, results) {
                if (err) throw err;
            });
        }
    });
})
.catch(error => {throw error;});

module.exports = bdd;