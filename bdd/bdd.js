const mysql = require('mysql');
const queries = require('./bdd.json');
require('dotenv').config();

const connInit = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,   
});

connInit.connect();

connInit.query("CREATE DATABASE IF NOT EXISTS "+process.env.DB_DATABASE+" /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */", function (err) {
    if (err) throw err;
    connInit.changeUser({database: process.env.DB_DATABASE}, function(err) {
        if (err) throw err;
        let i = 0;
        for (const table in queries.tables) {
            connInit.query(queries.tables[table], function(err, results) {
                if (err) throw err;
                i++;
                if (i == Object.keys(queries.tables).length) {
                    connInit.end();
                }
            });
        }
    });
});

// Création de la connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    multipleStatements: true,
    reconnect: true,
    connectionLimit: 10,
    waitForConnections : false
});

pool.promise = (sql, sql_params, erreur) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, sql_params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

module.exports = pool;
