import { Request } from "express";
import { getUserFromToken } from "../helpers/auth.helper";
import { createLoaders, Loaders } from "./dataloader";

export default async ({ req }: { req: Request }) => {
  let context: MyContext = {
    loaders: createLoaders(),
  };
  if (req.headers.authorization) {
    const token = req.headers["authorization"].split(" ")[1];

    if (token) {
      const user = await getUserFromToken(token);

      if (user) {
        return {
          id: user.id,
          role: user.role,
          organizerId: user.organizerProfileId ? user.organizerProfileId : null,
          ...context,
        };
      }
    }
  }
  return {
    ...context,
    id: null,
    role: null,
    organizerId: null,
  };
};

export interface MyContext {
  id?: string | null;
  role?: string | null;
  organizerId?: string | null;
  loaders: Loaders;
}
