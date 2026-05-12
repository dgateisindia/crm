const express = require("express");

const db = require("./db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("CRM Backend Running");
});

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql =
        "SELECT * FROM users WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, result) => {

        if (err) {

            res.status(500).json({
                message: "Database Error"
            });

        }

        else {

            if (result.length > 0) {

                res.json({
                    success: true,
                    message: "Login Successful",
                    user: result[0]
                });

            }

            else {

                res.json({
                    success: false,
                    message: "Invalid Credentials"
                });

            }

        }

    });

});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});