const express = require("express");
const router = express.Router();
const supabase = require("../config/db"); // Usamos Supabase aquí
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticateToken = require("../middlewares/authenticateToken");

const JWT_SECRET = process.env.JWT_SECRET;

router.get("/protected-route", authenticateToken, (req, res) => {
  res.json({ message: "You have access to this route", user: req.user });
});

router.get("/check-blocked", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("status")
      .eq("id", req.user.id)
      .single();

    if (error) throw error;
    const isBlocked = data.status === "blocked";
    res.json({ isBlocked });
  } catch (error) {
    console.error("Error checking block status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("last_login_time", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!password) return res.status(400).json({ error: "Password is required" });

  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) throw error;
    if (!users) return res.status(404).json({ error: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, users.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (users.status === "active") {
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          last_login_time: new Date().toISOString(),
        })
        .eq("id", users.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating last_login_time:", updateError);
      }
      const token = jwt.sign({ id: users.id, email: users.email }, JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.json({
        success: true,
        token,
        userinfo: { status: users.status, email: users.email },
      });
    } else {
      return res.status(401).json({ error: "User blocked" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
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
    const { error } = await supabase.from("users").insert([
      {
        name: `${firstname} ${lastname}`,
        email,
        password: hashedPassword,
        status: "active",
      },
    ]);

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/block", async (req, res) => {
  const { ids } = req.body;

  if (!ids || ids.length === 0) {
    return res.status(400).json({ error: "No user IDs provided" });
  }

  try {
    const { error } = await supabase
      .from("users")
      .update({ status: "blocked" })
      .in("id", ids);

    if (error) throw error;

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
    const { error } = await supabase
      .from("users")
      .update({ status: "active" })
      .in("id", ids);

    if (error) throw error;

    res.json({
      success: true,
      message: "Users unblocked successfully",
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
    const { error } = await supabase.from("users").delete().in("id", ids);

    if (error) throw error;

    res.json({ success: true, message: "Users deleted successfully" });
  } catch (error) {
    console.error("Error deleting users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
