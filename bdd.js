const mysql = require('mysql');
require('dotenv').config();

const bdd = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
bdd.connect((err) => {
    if(err) {throw err;}
    console.log('Mysql: Connected');
});
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

module.exports = bdd;