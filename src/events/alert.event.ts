import { EventEmitter } from "node:events";
import logger from "#src/utils/logger";
import {
  onInvestmentCreate,
  onInvestmentTerminate,
  InvestmentAlertData,
  onInvestmentPauseToggle,
  onInvestmentClose
} from "./handlers/investment.alert.js";
import { DepositAlertData, onDepositCreate } from "./handlers/deposit.alert.js";
import { WithdrawalAlertData } from "./handlers/withdrawal.alert.js";
import { onPasswordChange, OnPasswordChangeAlertData } from "./handlers/auth.alert.js";
import { onTransactionStatusUpdate, TransactionAlertData } from "./handlers/transaction.alert.js";

interface AlertEvents {
  "investment:create": [data: InvestmentAlertData];
  "investment:close": [data: InvestmentAlertData];
  "investment:terminate": [data: InvestmentAlertData];
  "investment:pause-toggle": [data: InvestmentAlertData];

  "transaction:status-update": [data: TransactionAlertData];

  "deposit:create": [data: DepositAlertData];
  "withdrawal:create": [data: WithdrawalAlertData];

  "password:change": [data: OnPasswordChangeAlertData];

  error: [error: Error | unknown];
}

class AlertEmitter<TEvents extends Record<string, any>> {
  private emitter = new EventEmitter();

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...eventArg: TEvents[TEventName]
  ) {
    this.emitter.emit(eventName, ...(eventArg as []));
  }

  on<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.on(eventName, handler as any);
  }

  off<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.off(eventName, handler as any);
  }
}

export const alertEmitter = new AlertEmitter<AlertEvents>();

alertEmitter.on("error", (err) => {
  logger.error("Alert Emitter Error", err as Error);
});

alertEmitter.on("investment:create", onInvestmentCreate);
alertEmitter.on("investment:close", onInvestmentClose);
alertEmitter.on("investment:terminate", onInvestmentTerminate);
alertEmitter.on("investment:pause-toggle", onInvestmentPauseToggle);

alertEmitter.on("transaction:status-update", onTransactionStatusUpdate);

alertEmitter.on("deposit:create", onDepositCreate);

alertEmitter.on("password:change", onPasswordChange);
