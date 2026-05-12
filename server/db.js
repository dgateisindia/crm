const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "crm",
    port: 3307
});

db.connect((err) => {

    if (err) {
        console.log("Database Connection Failed");
        console.log(err);
    }

    else {
        console.log("Database Connected");
    }

});

module.exports = db;