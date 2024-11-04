import * as jwt from "jsonwebtoken";
import { UserService } from "../services/user.service";
import { GraphQLFieldResolver, GraphQLResolveInfo } from "graphql";
import { MyContext } from "../utils/context";
import { UnauthorizedError } from "../utils/error";
import { AuthChecker } from "type-graphql";

interface TokenPayload extends jwt.JwtPayload {
  id: string;
}

export async function getUserFromToken(token: string) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
  const user = await new UserService().getUser(decoded.id);
  if (user) {
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
  if (!context.user) {
    return false;
  }

  return true;
};
