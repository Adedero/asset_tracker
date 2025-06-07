"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertEmitter = void 0;
const node_events_1 = require("node:events");
const logger_1 = __importDefault(require("#src/utils/logger"));
const investment_alert_1 = require("./handlers/investment.alert");
const deposit_alert_1 = require("./handlers/deposit.alert");
const auth_alert_1 = require("./handlers/auth.alert");
const transaction_alert_1 = require("./handlers/transaction.alert");
class AlertEmitter {
    emitter = new node_events_1.EventEmitter();
    emit(eventName, ...eventArg) {
        this.emitter.emit(eventName, ...eventArg);
    }
    on(eventName, handler) {
        this.emitter.on(eventName, handler);
    }
    off(eventName, handler) {
        this.emitter.off(eventName, handler);
    }
}
exports.alertEmitter = new AlertEmitter();
exports.alertEmitter.on("error", (err) => {
    logger_1.default.error("Alert Emitter Error", err);
});
exports.alertEmitter.on("investment:create", investment_alert_1.onInvestmentCreate);
exports.alertEmitter.on("investment:close", investment_alert_1.onInvestmentClose);
exports.alertEmitter.on("investment:terminate", investment_alert_1.onInvestmentTerminate);
exports.alertEmitter.on("investment:pause-toggle", investment_alert_1.onInvestmentPauseToggle);
exports.alertEmitter.on("transaction:status-update", transaction_alert_1.onTransactionStatusUpdate);
exports.alertEmitter.on("deposit:create", deposit_alert_1.onDepositCreate);
exports.alertEmitter.on("password:change", auth_alert_1.onPasswordChange);
