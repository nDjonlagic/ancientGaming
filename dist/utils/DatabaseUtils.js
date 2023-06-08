"use strict";
// utils/DatabaseUtils.ts
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
exports.DatabaseUtils = void 0;
class DatabaseUtils {
    static withTransaction(sequelize, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield sequelize.transaction();
            try {
                const result = yield callback(transaction);
                yield transaction.commit();
                return result;
            }
            catch (error) {
                yield transaction.rollback();
                throw error;
            }
        });
    }
}
exports.DatabaseUtils = DatabaseUtils;
