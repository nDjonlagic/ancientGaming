"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Bet_1 = require("../models/Bet");
const User_1 = require("../models/User");
const sequelize_1 = require("sequelize");
const DatabaseUtils_1 = require("../utils/DatabaseUtils");
let BetResolver = exports.BetResolver = class BetResolver {
    getBet(id) {
        return Bet_1.Bet.findByPk(id);
    }
    getBetList() {
        return Bet_1.Bet.findAll();
    }
    getBestBetPerUser(limit) {
        return Bet_1.Bet.findAll({
            attributes: ["userId", [(0, sequelize_1.fn)("MAX", (0, sequelize_1.col)("payout")), "maxPayout"]],
            group: ["userId"],
            order: [[(0, sequelize_1.fn)("MAX", (0, sequelize_1.col)("payout")), "DESC"]],
            limit,
            raw: true,
        });
    }
    createBet(userId, betAmount, chance, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findByPk(userId);
            if (!user)
                throw new Error("User not found");
            if (user.balance < betAmount)
                throw new Error("Insufficient balance");
            const bet = yield DatabaseUtils_1.DatabaseUtils.withTransaction(context.sequelize, (transaction) => __awaiter(this, void 0, void 0, function* () {
                user.balance -= betAmount;
                yield user.save({ transaction });
                return yield Bet_1.Bet.create({
                    userId,
                    betAmount,
                    chance,
                    confirmed: false,
                    payout: 0,
                    win: false,
                }, { transaction });
            }));
            return bet;
        });
    }
    confirmBet(betId, context) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DatabaseUtils_1.DatabaseUtils.withTransaction(context.sequelize, (transaction) => __awaiter(this, void 0, void 0, function* () {
                const bet = yield Bet_1.Bet.findByPk(betId, { transaction });
                if (!bet)
                    throw new Error("Bet not found");
                if (bet.confirmed)
                    throw new Error("Bet is already confirmed");
                const user = yield User_1.User.findByPk(bet.userId, { transaction });
                if (!user)
                    throw new Error("User not found");
                bet.win = Math.random() <= bet.chance / 100;
                bet.payout = bet.win ? bet.betAmount / (bet.chance / 100) : 0;
                bet.confirmed = true;
                user.balance += bet.payout;
                yield user.save({ transaction });
                return yield bet.save({ transaction });
            }));
        });
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => Bet_1.Bet),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BetResolver.prototype, "getBet", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Bet_1.Bet]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BetResolver.prototype, "getBetList", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Bet_1.Bet]),
    __param(0, (0, type_graphql_1.Arg)("limit", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], BetResolver.prototype, "getBestBetPerUser", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Bet_1.Bet),
    __param(0, (0, type_graphql_1.Arg)("userId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("betAmount", () => type_graphql_1.Float)),
    __param(2, (0, type_graphql_1.Arg)("chance", () => type_graphql_1.Float)),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number, Object]),
    __metadata("design:returntype", Promise)
], BetResolver.prototype, "createBet", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Bet_1.Bet),
    __param(0, (0, type_graphql_1.Arg)("betId", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], BetResolver.prototype, "confirmBet", null);
exports.BetResolver = BetResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], BetResolver);
