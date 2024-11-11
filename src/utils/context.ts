import { Request } from "express";
import { getUserFromToken } from "../helpers/auth.helper";

export default async ({ req }: { req: Request }) => {
  if (req.headers.authorization) {
    const token = req.headers["authorization"].split(" ")[1];

    if (token) {
      const { id, role } = await getUserFromToken(token);

      return {
        id,
        role,
      };
    }
    return null;
  }
  return null;
};

export interface MyContext {
  id: string;
  role: string;
}
