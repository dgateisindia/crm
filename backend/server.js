require("dotenv").config();

const express =
require("express");

const cors =
require("cors");

const app =
express();

//tasks routes

const taskRoutes =
require("./routes/taskRoutes");


// Database Connection
const db =
require("./db");


// Routes
const authRoutes =
require("./routes/authRoutes");

const employeeRoutes =
require("./routes/employeeRoutes");

const leadRoutes =
require("./routes/leadRoutes");

const dashboardRoutes =
require("./routes/dashboardRoutes");

const managerRoutes =
require("./routes/managerRoutes");

const uploadRoutes =
require("./routes/uploadRoutes");

const followupRoutes =
require("./routes/followupRoutes");

const reportsRoutes =
require("./routes/reportsRoutes");

// Middleware
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use(express.json());


// API Routes
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

app.use(
  "/api/leads",
  uploadRoutes
);
app.use(
  "/api/dashboard",
  dashboardRoutes
);

//followup routes
app.use(
  "/api/followups",
  followupRoutes
);

app.use(
  "/api/managers",
  managerRoutes
);

//task routes
app.use(
  "/api/tasks",
  taskRoutes
);

//reports routes
app.use(
  "/api/reports",
  reportsRoutes
);

app.use(
  "/api/tasks",
  taskRoutes
);


// Test Route
app.get(
  "/",
  (req, res) => {

    res.send(
      "Backend Running Successfully"
    );
  }
);


// Database Test Route
app.get(
  "/api/test-db",
  (req, res) => {
    db.query(
      "SELECT * FROM employee_roles",
      (err, result) => {

        if (err) {

          //console.log(err);

          return res.status(500).json({
            success: false,
            message: "Database Error",
            error: err
          });

        }

        res.status(200).json({
          success: true,
          message: "Database Connected Successfully",
          data: result
        });

      }
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