import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/contants.js";

export const createJwtToken = (userEmail) => {
  const payload = { email: userEmail };
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    return token;
  } catch (error) {
    console.log(error);
  }
};
