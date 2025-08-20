import bcrypt from "bcrypt";
import { createJwtToken } from "../utils/jwtMaker.js";
import { runQuery } from "../database/sqlLite.db.js";
import cookieParser from "cookie-parser";

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
  const newUser = await runQuery(
    `
    INSERT INTO userData (name, email, password)
    VALUES (?, ?, ?)
  `,
    [name, email, hashedPassword]
  );
  console.log(newUser);

  // Generate JWT
  const { accessToken, refreshToken } = createJwtToken(
    email,
    newUser.lastInsertRowid
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // Only send cookie over HTTPS
    sameSite: "strict", // Protect against CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(201).json({
    success: true,
    data: { accessToken },
    message: "SignUp successful",
  });
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
  const { accessToken, refreshToken } = createJwtToken(
    user[0].email,
    user[0].userId
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // Only send cookie over HTTPS
    sameSite: "strict", // Protect against CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(200).json({
    success: true,
    data: { accessToken },
    message: "Login successful",
  });
};
