import { Request } from "express";
import { getUserFromToken } from "../helpers/auth.helper";
import { User } from "../entities/user.entity";

export default async ({ req }: { req: Request }) => {
  let token = null;
  let user = null;

  token = req.headers["authorization"].split(" ")[1];

  if (token) {
    user = await getUserFromToken(token);
  }

  return {
    user,
    token,
  };
};

export interface MyContext {
  token: string;
  user: User;
}
