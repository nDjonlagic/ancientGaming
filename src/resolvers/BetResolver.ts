import { Sequelize } from "sequelize";
import { Resolver, Query, Arg, Int, Mutation, Float, Ctx } from "type-graphql";
import { Bet } from "../models/Bet";
import { User } from "../models/User";
import { DatabaseUtils } from "../utils/DatabaseUtils";
import { ErrorHelper } from "../utils/ErrorHelper";
import { CreateBetInput } from "../utils/validators/CreateBetInput";

interface Context {
  sequelize: Sequelize;
}

@Resolver()
export class BetResolver {
  @Query(() => Bet)
  async getBet(@Arg("id", () => Int) id: number): Promise<Bet> {
    return await Bet.findByPk(id);
  }

  @Query(() => [Bet])
  async getBetList(): Promise<Bet[]> {
    return await Bet.findAll();
  }

  @Query(() => [Bet])
  async getBestBetPerUser(
    @Ctx() context: Context,
    @Arg("limit", () => Int, { nullable: true }) limit?: number
  ): Promise<Bet[]> {
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
    @Arg("input", () => CreateBetInput) input: CreateBetInput,
    @Ctx() context: Context
  ): Promise<Bet> {
    const user = await User.findByPk(input.userId);
    if (!user) throw ErrorHelper.entityNotFound(User.name);

    if (user.balance < input.betAmount) throw ErrorHelper.insufficientBalance();

    const bet = await DatabaseUtils.withTransaction(
      context.sequelize,
      async (transaction) => {
        user.balance -= input.betAmount;
        await user.save({ transaction });

        return await Bet.create(
          {
            userId: input.userId,
            betAmount: input.betAmount,
            chance: input.chance,
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
  ): Promise<Bet> {
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
