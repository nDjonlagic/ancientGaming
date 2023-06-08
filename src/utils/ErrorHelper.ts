import { ApolloError } from "apollo-server-express";

export enum ErrorCodes {
  ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  INVALID_BET_STATE = "INVALID_BET_STATE",
}

export class ErrorHelper {
  static entityNotFound(entityName: string): ApolloError {
    return new ApolloError(
      `${entityName} not found`,
      ErrorCodes.ENTITY_NOT_FOUND
    );
  }

  static insufficientBalance(): ApolloError {
    return new ApolloError(
      "Insufficient balance",
      ErrorCodes.INSUFFICIENT_BALANCE
    );
  }

  static invalidBetState(): ApolloError {
    return new ApolloError(
      "Bet already confirmed",
      ErrorCodes.INVALID_BET_STATE
    );
  }
}
