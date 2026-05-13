const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

const employeeRoutes =
require("./routes/employeeRoutes");

// Middleware
app.use(cors());
app.use(express.json()); // IMPORTANT

// Routes
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// Server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});


//import employee
app.use("/api/employee", employeeRoutes);


app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);