"use strict";
// index.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const database_1 = require("./database");
const UserResolver_1 = require("./resolvers/UserResolver");
const BetResolver_1 = require("./resolvers/BetResolver");
require("dotenv").config();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Initialize a connection to the database
        const sequelize = yield (0, database_1.createConnection)();
        // Initialize express application
        const app = (0, express_1.default)();
        // Create the Apollo Server
        const server = new apollo_server_express_1.ApolloServer({
            schema: yield (0, type_graphql_1.buildSchema)({
                resolvers: [UserResolver_1.UserResolver, BetResolver_1.BetResolver],
                validate: false,
            }),
            context: ({ req, res }) => ({ req, res, sequelize }),
        });
        // Call start before applyMiddleware
        yield server.start();
        server.applyMiddleware({ app, path: "/graphql" });
        // Sync Sequelize models to the database, and then start the server
        yield sequelize.sync();
        app.listen({ port: 4001 }, () => console.log(`Server ready at http://localhost:4001${server.graphqlPath}`));
    });
}
// Call main to start the server
main().catch((error) => {
    console.log(error, "error");
});
