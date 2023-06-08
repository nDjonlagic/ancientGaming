import { Field, InputType, Float } from "type-graphql";
import { IsNotEmpty, Min } from "class-validator";

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsNotEmpty()
  name: string;

  @Field(() => Float)
  @Min(0, { message: "Balance cannot be less than 0" })
  balance: number;
}
