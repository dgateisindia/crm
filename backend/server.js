require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Database Connection
const db = require("./db");

// Routes
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const leadRoutes = require("./routes/leadRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const managerRoutes = require("./routes/managerRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const followupRoutes = require("./routes/followupRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const taskRoutes = require("./routes/taskRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ==========================
// API Routes
// ==========================

app.use("/api/auth", authRoutes);

app.use("/api/employee", employeeRoutes);

app.use("/api/leads", leadRoutes);

app.use("/api/leads", uploadRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/followups", followupRoutes);

app.use("/api/managers", managerRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/reports", reportsRoutes);

// ==========================
// Database Test Route
// ==========================

app.get("/api/test-db", (req, res) => {
  db.query(
    "SELECT * FROM employee_roles",
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database Error",
          error: err,
        });
      }

      res.status(200).json({
        success: true,
        message: "Database Connected Successfully",
        data: result,
      });
    }
  );
});

// ==========================
// Serve React Frontend
// ==========================

app.use(
  express.static(
    path.join(__dirname, "../frontend/dist")
  )
);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));

});

// ==========================
// Server
// ==========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});