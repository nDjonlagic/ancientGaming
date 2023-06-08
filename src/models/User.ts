import { Field, ID, ObjectType, Float } from "type-graphql";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  DataType,
} from "sequelize-typescript";
import { Bet } from "./Bet";

@Table
@ObjectType()
export class User extends Model<User> {
  @Field(() => ID)
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Field()
  @Column(DataType.STRING)
  name: string;

  @Field(() => Float)
  @Column(DataType.FLOAT)
  balance: number;

  @HasMany(() => Bet)
  bets: Bet[];
}
