"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVAILABLE_EMAILS = exports.APP_NAME = exports.MIN_ACCOUNT_BALANCE = exports.AVG_PROCESSING_TIME = exports.DUPLICATE_TRANSACTION_CHECK_TIME = exports.MIN_DEPOSIT_AMOUNT = exports.MAX_DEPOSIT_AMOUNT = exports.errorCodes = exports.OTP_LENGTH = exports.OTP_EXPIRY_TIME = exports.MAX_USERNAME_LENGTH = exports.MIN_USERNAME_LENGTH = exports.MAX_PASSWORD_LENGTH = exports.MIN_PASSWORD_LENGTH = exports.MIN_USER_AGE = exports.JWT_REFRESH_TOKEN_EXPIRY = exports.JWT_ACCESS_TOKEN_EXPIRY = exports.INTERNAL_REQUEST_ALLOWED_TIME_DIFF = exports.GET_REQUEST_DATA_LIMIT = void 0;
exports.GET_REQUEST_DATA_LIMIT = 20;
exports.INTERNAL_REQUEST_ALLOWED_TIME_DIFF = 5 * 60 * 1000;
exports.JWT_ACCESS_TOKEN_EXPIRY = "15m";
exports.JWT_REFRESH_TOKEN_EXPIRY = "30d";
exports.MIN_USER_AGE = 15;
exports.MIN_PASSWORD_LENGTH = 8;
exports.MAX_PASSWORD_LENGTH = 20;
exports.MIN_USERNAME_LENGTH = 3;
exports.MAX_USERNAME_LENGTH = 20;
exports.OTP_EXPIRY_TIME = "1 hour";
exports.OTP_LENGTH = 6;
exports.errorCodes = {
    EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED"
};
exports.MAX_DEPOSIT_AMOUNT = 100000;
exports.MIN_DEPOSIT_AMOUNT = 10;
exports.DUPLICATE_TRANSACTION_CHECK_TIME = 3 * 60 * 1000; //3 minutes
exports.AVG_PROCESSING_TIME = "1 day";
exports.MIN_ACCOUNT_BALANCE = 25;
exports.APP_NAME = "My Assets Tracker";
exports.AVAILABLE_EMAILS = {
    Finance: "finance@myassetstracker.com",
    Support: "support@myassetstracker.com"
};
