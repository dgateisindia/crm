const express = require("express");
const db = require("./db");

require("./db");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("CRM Backend Running");
});

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    console.log("Email:", email);
    console.log("Password:", password);

    res.send("Login API Working");

});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});