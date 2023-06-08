import { IsInt, IsPositive, Min, Max } from "class-validator";
import { InputType, Field, Int, Float } from "type-graphql";

@InputType()
export class CreateBetInput {
  @Field(() => Int)
  @IsInt()
  @IsPositive()
  userId: number;

  @Field(() => Float)
  @IsPositive()
  betAmount: number;

  @Field(() => Float)
  @Min(0.0001)
  @Max(99.9999)
  chance: number;
}
