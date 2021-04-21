const mysql = require('mysql');
const queries = require('./bdd.json');
require('dotenv').config();

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

pool.getConnection((err, connection) => {
    connection.query("CREATE DATABASE IF NOT EXISTS "+process.env.DB_DATABASE+" /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */", function (err) {
        if (err) throw err;
        connection.changeUser({database: process.env.DB_DATABASE}, function(err) {
            if (err) throw err;
            for (const table in queries.tables) {
                connection.query(queries.tables[table], function(err, results) {
                    if (err) throw err;
                });
            }
        });
    })
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

console.log(pool);

module.exports = pool;