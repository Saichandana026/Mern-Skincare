const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");


router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json("User already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json("User Registered Successfully");
  } catch (err) {
    res.status(500).json(err.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid Email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    res.json({
      userId: user._id,
      name: user.name,
      email: user.email
    });

  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});


router.post("/admin-login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Admin login:", email, password);

  const adminEmail = "admin@gmail.com";
  const adminPassword = "admin123";

  if (email === adminEmail && password === adminPassword) {
    return res.json({ success: true, message: "Login success" });
  } else {
    return res.status(401).json({ success: false, 
      message: "Invalid credentials" });
  }
});


module.exports = router;