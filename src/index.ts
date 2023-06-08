import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "./database";
import { UserResolver } from "./resolvers/UserResolver";
import { BetResolver } from "./resolvers/BetResolver";

require("dotenv").config();

async function main() {
  // Initialize a connection to the database
  const sequelize = await createConnection();

  // Initialize express application
  const app = express();

  // Create the Apollo Server
  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, BetResolver],
      validate: true,
    }),
    context: ({ req, res }) => ({ req, res, sequelize }),
  });

  // Call start before applyMiddleware
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  // Sync Sequelize models to the database, and then start the server
  await sequelize.sync();
  app.listen({ port: 4001 }, () =>
    console.log(`Server ready at http://localhost:4001${server.graphqlPath}`)
  );
}

// Call main to start the server
main().catch((error) => {
  console.log(error, "error");
});
