const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/db");
const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: ["http://localhost:5000", "http://localhost:5173"],
    credentials: true,
  }),
);

//Middleware of autentication/validation DON'T KNOW WHAT THAT IS

// app.get("/", (req, res) => {
//   res.json({ message: "Getting info from Task4 Backend" });
// });

app.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY last_login_time DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

//register

//login

// Listing users

//block users

//unblock users

//delete users

app.listen(port, () => console.log(`Server listening on port ${port}`));
