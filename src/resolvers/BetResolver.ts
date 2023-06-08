import { Sequelize } from "sequelize";
import { Resolver, Query, Arg, Int, Mutation, Float, Ctx } from "type-graphql";
import { Bet } from "../models/Bet";
import { User } from "../models/User";
import { DatabaseUtils } from "../utils/DatabaseUtils";
import { ErrorHelper } from "../utils/ErrorHelper";

interface Context {
  sequelize: Sequelize;
}

@Resolver()
export class BetResolver {
  @Query(() => Bet)
  getBet(@Arg("id", () => Int) id: number) {
    return Bet.findByPk(id);
  }

  @Query(() => [Bet])
  getBetList() {
    return Bet.findAll();
  }

  @Query(() => [Bet])
  async getBestBetPerUser(
    @Ctx() context: Context,
    @Arg("limit", () => Int, { nullable: true }) limit?: number
  ) {
    const replacements: any = {};
    let limitQuery = "";

    if (limit) {
      replacements.limit = limit;
      limitQuery = "LIMIT :limit";
    }

    const result = await context.sequelize.query(
      `
      SELECT "Bets".*
      FROM "Bets"
      INNER JOIN (
          SELECT "userId", MAX("payout") AS "maxPayout"
          FROM "Bets"
          GROUP BY "userId"
      ) AS "maxBets"
      ON "Bets"."userId" = "maxBets"."userId" AND "Bets"."payout" = "maxBets"."maxPayout"
      ORDER BY "Bets"."payout" DESC
      ${limitQuery}
      `,
      {
        replacements,
        model: Bet,
        mapToModel: true,
      }
    );

    return result;
  }

  @Mutation(() => Bet)
  async createBet(
    @Arg("userId", () => Int) userId: number,
    @Arg("betAmount", () => Float) betAmount: number,
    @Arg("chance", () => Float) chance: number,
    @Ctx() context: Context
  ) {
    if (chance <= 0 || chance >= 100) throw ErrorHelper.invalidChanceRange();

    const user = await User.findByPk(userId);
    if (!user) throw ErrorHelper.entityNotFound(User.name);

    if (user.balance < betAmount) throw ErrorHelper.insufficientBalance();

    if (betAmount <= 0) throw ErrorHelper.invalidBetAmount();

    const bet = await DatabaseUtils.withTransaction(
      context.sequelize,
      async (transaction) => {
        user.balance -= betAmount;
        await user.save({ transaction });

        return await Bet.create(
          {
            userId,
            betAmount,
            chance,
            confirmed: false, // We set the confirmed field as false initially
            payout: 0,
            win: false,
          },
          { transaction }
        );
      }
    );

    return bet;
  }

  @Mutation(() => Bet)
  async confirmBet(
    @Arg("betId", () => Int) betId: number,
    @Ctx() context: Context
  ) {
    return await DatabaseUtils.withTransaction(
      context.sequelize,
      async (transaction) => {
        const bet = await Bet.findByPk(betId, { transaction });
        if (!bet) throw ErrorHelper.entityNotFound(Bet.name);

        if (bet.confirmed) throw ErrorHelper.invalidBetState();

        const user = await User.findByPk(bet.userId, { transaction });
        if (!user) throw ErrorHelper.entityNotFound(User.name);

        bet.win = Math.random() <= bet.chance / 100;
        bet.payout = bet.win ? bet.betAmount / (bet.chance / 100) : 0;
        bet.confirmed = true;

        user.balance += bet.payout;
        await user.save({ transaction });

        return await bet.save({ transaction });
      }
    );
  }
}
