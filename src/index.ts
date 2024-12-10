import "reflect-metadata";
import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import { config } from "dotenv";
config();
import "./database";
import { PORT } from "./config";
import {
  AuthResolver,
  EventResolver,
  OrganizerResolver,
  SessionResolver,
  SpeakerResolver,
  TicketTypeResolver,
  UserResolver,
  VenueResolver,
} from "./graphql/resolvers";
import { buildSchema } from "type-graphql";
import { formatError } from "./utils/error";
import context, { MyContext } from "./utils/context";
import { customAuthChecker } from "./helpers/auth.helper";

async function start() {
  const app = express();

  const schema = await buildSchema({
    resolvers: [
      AuthResolver,
      OrganizerResolver,
      UserResolver,
      VenueResolver,
      EventResolver,
      SessionResolver,
      SpeakerResolver,
      TicketTypeResolver,
    ],
    authChecker: customAuthChecker,
    validate: true,
  });

  const httpServer = http.createServer(app);
  const server = new ApolloServer<MyContext>({
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    schema,
    formatError,
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context,
    })
  );

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );
}

start().then(() =>
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
);
