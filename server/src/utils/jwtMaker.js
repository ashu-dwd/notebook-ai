import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/contants.js";

export const createJwtToken = (userEmail, id) => {
  const accessTokenPayload = {
    email: userEmail,
    userId: id,
    type: "access",
  };
  //console.log(accessTokenPayload);

  const refreshTokenPayload = {
    email: userEmail,
    userId: id,
    type: "refresh",
  };
  //console.log(refreshTokenPayload);
  // console.log(JWT_SECRET);

  try {
    const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(refreshTokenPayload, JWT_SECRET, {
      expiresIn: "7d",
    });
    return { accessToken, refreshToken };
    //return token;
  } catch (error) {
    console.log(error);
  }
};
