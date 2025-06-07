import { EventEmitter } from "node:events";
import logger from "#src/utils/logger";
import { onInvestmentCreate, onInvestmentTerminate, onInvestmentPauseToggle, onInvestmentClose } from "./handlers/investment.alert.js";
import { onDepositCreate } from "./handlers/deposit.alert.js";
import { onPasswordChange } from "./handlers/auth.alert.js";
import { onTransactionStatusUpdate } from "./handlers/transaction.alert.js";
class AlertEmitter {
    emitter = new EventEmitter();
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
export const alertEmitter = new AlertEmitter();
alertEmitter.on("error", (err) => {
    logger.error("Alert Emitter Error", err);
});
alertEmitter.on("investment:create", onInvestmentCreate);
alertEmitter.on("investment:close", onInvestmentClose);
alertEmitter.on("investment:terminate", onInvestmentTerminate);
alertEmitter.on("investment:pause-toggle", onInvestmentPauseToggle);
alertEmitter.on("transaction:status-update", onTransactionStatusUpdate);
alertEmitter.on("deposit:create", onDepositCreate);
alertEmitter.on("password:change", onPasswordChange);
