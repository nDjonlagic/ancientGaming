import { Resolver, Query, Arg, Int, Mutation, Float } from "type-graphql";
import { User } from "../models/User";

@Resolver()
export class UserResolver {
  @Query(() => User)
  getUser(@Arg("id", () => Int) id: number) {
    return User.findByPk(id);
  }

  @Query(() => [User])
  getUserList() {
    return User.findAll();
  }

  @Mutation(() => User)
  async createUser(
    @Arg("name", () => String) name: string,
    @Arg("balance", () => Float) balance: number
  ) {
    const user = await User.create({
      name,
      balance,
    });

    return user;
  }
}
