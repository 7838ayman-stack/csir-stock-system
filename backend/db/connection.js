const mysql = require("mysql2");
require("dotenv").config({ override: true }); // THIS CLEARS THE CACHE!

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    }
});

connection.connect((err) => {
    if (err) {
        console.log("Database Connection Failed");
        console.log(err);
        return;
    }
    console.log("MySQL Connected Successfully to TiDB Cloud!");
});

module.exports = connection;