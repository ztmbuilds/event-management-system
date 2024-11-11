import * as jwt from "jsonwebtoken";
import { MyContext } from "../utils/context";
import { AuthChecker } from "type-graphql";
import userService from "../services/user.service";
import { UnauthorizedError } from "../utils/error";

interface TokenPayload extends jwt.JwtPayload {
  id: string;
}

export async function getUserFromToken(token: string) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
  const user = await userService.getUserById(decoded.id, {
    role: true,
    id: true,
  });

  if (decoded.id) {
    return user;
  } else {
    return null;
  }
}

// export function authenticated(next: GraphQLFieldResolver<any, MyContext>) {
//   return (
//     root: any,
//     args: any,
//     context: MyContext,
//     info: GraphQLResolveInfo
//   ) => {
//     if (!context.user) {
//       throw new UnauthorizedError("Unauthenticated");
//     }
//     return next(root, args, context, info);
//   };
// }

export const customAuthChecker: AuthChecker<MyContext> = (
  { root, args, context, info },
  roles: string[]
) => {
  if (!context.role || !roles.includes(context.role)) return false;

  return true;
};
