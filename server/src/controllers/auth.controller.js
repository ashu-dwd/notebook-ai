import bcrypt from "bcrypt";
import { createJwtToken } from "../utils/jwtMaker.js";
import { runQuery } from "../database/sqlLite.db.js";
import { success } from "zod";
import { da } from "zod/v4/locales";

export const handleUserSignUp = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body);
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "All fields are required" });
  }

  // Check if user already exists
  const existingUser = runQuery(`SELECT * FROM userData WHERE email = ?`, [
    email,
  ]);
  //console.log(existingUser);

  if (existingUser.length > 0) {
    return res
      .status(409)
      .json({ success: false, error: "User already exists" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = runQuery(
    `
    INSERT INTO userData (name, email, password)
    VALUES (?, ?, ?)
  `,
    [name, email, hashedPassword]
  );

  // Generate JWT
  const token = createJwtToken(email);

  return res
    .status(201)
    .json({ success: true, data: { token }, message: "SignUp successful" });
};

export const handleUserLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Please provide email and password" });
  }

  // Check if user exists
  const user = runQuery(`SELECT * FROM userData WHERE email = ?`, [email]);
  if (user.length === 0) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user[0].password);
  if (!isPasswordValid) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid email or password" });
  }

  // Generate JWT
  const token = createJwtToken(user[0].email);

  return res
    .status(200)
    .json({ success: true, data: { token }, message: "Login successful" });
};
