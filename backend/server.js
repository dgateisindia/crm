require("dotenv").config();

const express =
require("express");

const cors =
require("cors");

const authRoutes =
require("./routes/authRoutes");

const employeeRoutes =
require("./routes/employeeRoutes");

const leadRoutes =
require("./routes/leadRoutes");

const app =
express();


// Middleware
app.use(cors());

app.use(
  express.json()
);


// Routes
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/employee",
  employeeRoutes
);

app.use(
  "/api/leads",
  leadRoutes
);


// Test Route
app.get(
  "/",
  (req, res) => {

    res.send(
      "Backend Running"
    );
  }
);


// Server
const PORT =
process.env.PORT ||
5000;

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    );
  }
);