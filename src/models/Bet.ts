import { Field, ID, ObjectType, Float } from "type-graphql";
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType,
} from "sequelize-typescript";
import { User } from "./User";

@Table
@ObjectType()
export class Bet extends Model<Bet> {
  @Field(() => ID)
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Field(() => Float)
  @Column(DataType.FLOAT)
  betAmount: number;

  @Field(() => Float)
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    validate: {
      isBetweenZeroAndOneHundred(value: number) {
        if (value <= 0 || value >= 100) {
          throw new Error("Chance must be strictly between 0 and 100");
        }
      },
    },
  })
  chance: number;

  @Field(() => Float)
  @Column(DataType.FLOAT)
  payout: number;

  @Field()
  @Column(DataType.BOOLEAN)
  win: boolean;

  @Field()
  @Column(DataType.BOOLEAN)
  confirmed: boolean;

  @Field(() => ID)
  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;
}
