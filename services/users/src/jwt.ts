import { sign, verify } from "jsonwebtoken";

const signJwt = (userId: string) => {
  return sign({ userId }, process.env.API_SECRET);
};

const verifyJwt = (token: string) => {
  return verify(token, process.env.API_SECRET) as { userId: string };
};

export { signJwt, verifyJwt };
