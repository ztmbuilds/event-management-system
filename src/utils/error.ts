import { GraphQLError, GraphQLFormattedError } from "graphql";
import { NODE_ENV } from "../config";
import { unwrapResolverError } from "@apollo/server/errors";
import { ApolloServerErrorCode } from "@apollo/server/errors";

abstract class BaseError extends Error {
  code: string;
  statusCode: number = 500;
  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message, "NOT_FOUND", 404);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string) {
    super(message, "CONFLICT", 409);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(message, "UNAUTHORIZED", 401);
  }
}

export function formatError(
  formattedError: GraphQLFormattedError,
  error: unknown
): GraphQLFormattedError {
  if (NODE_ENV === "development") {
    return formattedError;
  } else if (NODE_ENV === "production") {
    //known errors

    const originalError = unwrapResolverError(error);

    if (originalError instanceof BaseError) {
      return new GraphQLError(originalError.message, {
        extensions: {
          code: originalError.code,
          http: {
            status: originalError.statusCode,
          },
        },
      });
    }

    //if it is a built in apollo error code, just return it
    if (isApolloErrorCode(formattedError.extensions.code)) {
      return formattedError;
    }

    //TODO: handle other known errors

    //unknown errors
    return new GraphQLError("Internal server error", {
      extensions: {
        code: "INTERNAL_SERVER_ERROR",
        http: {
          status: 500,
        },
      },
    });
  }
}

const isApolloErrorCode = (code: unknown) => {
  return Object.values(ApolloServerErrorCode).includes(
    code as ApolloServerErrorCode
  );
};
