import { Resolver, Query, Arg, Int, Mutation, Float } from "type-graphql";
import { User } from "../models/User";
import { ErrorHelper } from "../utils/ErrorHelper";
import { CreateUserInput } from "../utils/validators/CreateUserInput";

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
    @Arg("data", () => CreateUserInput) data: CreateUserInput
  ): Promise<User> {
    return await User.create(data);
  }
}
