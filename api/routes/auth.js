const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

const User = require("../models/User");
const router = express.Router();
const config = require("../config");

const COOKIE_MAX_AGE = 31557600000;
const JWT_MAX_AGE = "1y";

router.post(
  "/signup",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters long"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      }

      // Create new user
      const user = new User({ name, email, password });
      await user.save();

      // Generate token
      const token = jwt.sign({ _id: user._id }, config.SECRET, {
        expiresIn: JWT_MAX_AGE,
      });

      // Set cookie options
      let cookieOptions = { maxAge: COOKIE_MAX_AGE, httpOnly: true };
      if (config.ENVIRONMENT === "development")
        cookieOptions = {
          ...cookieOptions,
          secure: false, // Set to false for localhost development
          sameSite: "lax", // Set to lax for localhost development
        };
      else
        cookieOptions = {
          ...cookieOptions,
          secure: true,
          sameSite: "none",
        };

      res.cookie("jwt", token, cookieOptions);

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

router.post(
  "/signin",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate token
      let cookieOptions = { maxAge: COOKIE_MAX_AGE, httpOnly: true };
      if (config.ENVIRONMENT === "development")
        cookieOptions = {
          ...cookieOptions,
          secure: false, // Set to false for localhost development
          sameSite: "lax", // Set to lax for localhost development
        };
      else
        cookieOptions = {
          ...cookieOptions,
          secure: true,
          sameSite: "none",
        };

      const token = jwt.sign({ _id: user._id }, config.SECRET, {
        expiresIn: JWT_MAX_AGE,
      });
      res.cookie("jwt", token, cookieOptions);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  }
);

router.get(
  "/signin_token",
  passport.authenticate(["user"], { session: false }),
  async (req, res) => {
    try {
      let { user } = req;
      user.set({ last_login_at: Date.now() });
      user = await user.save();
      return res.status(200).send({ user, token: req.cookies.jwt, ok: true });
    } catch (error) {
      console.error("Signin token error:", error);
      return res.status(500).send({ ok: false, message: "Server error" });
    }
  }
);

router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.status(200).send({ ok: true });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).send({ ok: false, error });
  }
});

module.exports = router;
