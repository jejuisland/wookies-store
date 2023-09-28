const mysql = require('mysql2');
require('dotenv').config()

// Database configuration
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ', err);
    } else {
        console.log('Database connected');
    }
});

module.exports = db; // Export the db connection