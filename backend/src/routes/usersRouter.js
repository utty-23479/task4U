const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticateToken = require("../middlewares/authenticateToken");

const JWT_SECRET = process.env.JWT_SECRET;

router.get("/protected-route", authenticateToken, (req, res) => {
  res.json({ message: "You have access to this route", user: req.user });
});

router.get("/check-blocked", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT status FROM users WHERE id = $1", [
      req.user.id,
    ]);
    const isBlocked = result.rows[0].status === "blocked";
    res.json({ isBlocked });
  } catch (error) {
    console.error("Error checking block status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY last_login_time DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!password) return res.status(400).json({ error: "Password is required" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.status === "active") {
      console.log(user.status);
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "1h",
      });
      console.log("user activo");

      try {
        const { data, error } = await supabase
          .from("users")
          .update({ last_login_time: new Date().toISOString() })
          .eq("id", user.id)
          .select();
        console.log("fecha actualizada");

        if (error) {
          console.error("Error updating last_login_time:", {
            message: error.message,
            details: error.details,
            code: error.code,
          });
          return res.status(500).json({
            error: "failed to update login time",
            details: error.message,
          });
        }
      } catch (updateError) {
        console.error("Supabase update error:", updateError);
      }

      return res.json({
        success: true,
        token,
        userinfo: { status: user.status, email: user.email },
      });
    } else {
      return res.status(401).json({ error: "User blocked" });
    }
  } catch (error) {
    console.error("Error logging in: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/registeruser", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({
      error: "All fields (firstname, lastname, email, password) are required",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password) VALUES($1, $2, $3)`,
      [`${firstname} ${lastname}`, email, hashedPassword],
    );
    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error inserting user: ", error);
    if (error.code === "23505")
      return res
        .status(409)
        .json({ success: false, error: "Email already exists" });
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

router.patch("/block", async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) {
    return res.status(400).json({ error: "No user IDs provided" });
  }
  try {
    await pool.query("UPDATE users SET status = 'blocked' WHERE id = ANY($1)", [
      ids,
    ]);
    res.json({ success: true, message: "Users blocked successfully" });
  } catch (error) {
    console.error("Error blocking users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/unblock", async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) {
    return res.status(400).json({ error: "No user IDs provided" });
  }
  try {
    await pool.query("UPDATE users SET status = 'active' WHERE id = ANY($1)", [
      ids,
    ]);
    const requesterBlocked = ids.includes(req.user.id);
    res.json({
      success: true,
      message: "Users unblocked successfully",
      requesterBlocked,
    });
  } catch (error) {
    console.error("Error unblocking users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/", async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) {
    return res.status(400).json({ error: "No user IDs provided" });
  }
  try {
    await pool.query("DELETE FROM users WHERE id = ANY($1)", [ids]);
    res.json({ success: true, message: "Users deleted successfully" });
  } catch (error) {
    console.error("Error deleting users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
