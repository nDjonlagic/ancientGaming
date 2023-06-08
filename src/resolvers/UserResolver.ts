import { Resolver, Query, Arg, Int, Mutation, Float } from "type-graphql";
import { User } from "../models/User";
import { ErrorHelper } from "../utils/ErrorHelper";

@Resolver()
export class UserResolver {
  @Query(() => User)
  async getUser(@Arg("id", () => Int) id: number): Promise<User> {
    const user = await User.findByPk(id);
    if (!user) throw ErrorHelper.entityNotFound(User.name);
    return user;
  }

  @Query(() => [User])
  async getUserList(): Promise<User[]> {
    return await User.findAll();
  }

  @Mutation(() => User)
  async createUser(
    @Arg("name", () => String) name: string,
    @Arg("balance", () => Float) balance: number
  ): Promise<User> {
    if (balance < 0) throw ErrorHelper.invalidBalance();
    const user = await User.create({
      name,
      balance,
    });

    return user;
  }
}
