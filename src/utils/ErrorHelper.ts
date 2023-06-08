import { ApolloError } from "apollo-server-express";

export enum ErrorCodes {
  ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  INVALID_BET_AMOUNT = "INVALID_BET_AMOUNT",
  INVALID_CHANCE_RANGE = "INVALID_CHANCE_RANGE",
  INVALID_BET_STATE = "INVALID_BET_STATE",
  INVALID_BALANCE = "INVALID_BALANCE",
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

  static invalidBetAmount(): ApolloError {
    return new ApolloError(
      "Bet amount must be positive",
      ErrorCodes.INVALID_BET_AMOUNT
    );
  }

  static invalidChanceRange(): ApolloError {
    return new ApolloError(
      "Chance must be between 0 and 100 (exclusive)",
      ErrorCodes.INVALID_CHANCE_RANGE
    );
  }

  static invalidBetState(): ApolloError {
    return new ApolloError(
      "Bet already confirmed",
      ErrorCodes.INVALID_BET_STATE
    );
  }

  static invalidBalance(): ApolloError {
    return new ApolloError("Invalid balance", ErrorCodes.INVALID_BALANCE);
  }
}
