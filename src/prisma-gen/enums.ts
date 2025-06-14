/* !!! This is code generated by Prisma. Do not edit directly. !!! */
/* eslint-disable */
// @ts-nocheck
/**
 * This file exports all enum related types from the schema.
 *
 * 🟢 You can import this file directly.
 */
export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER"
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const KycStatus = {
  UNVERIFIED: "UNVERIFIED",
  PENDING: "PENDING",
  VERIFIED: "VERIFIED"
} as const;

export type KycStatus = (typeof KycStatus)[keyof typeof KycStatus];

export const InvestmentStatus = {
  OPEN: "OPEN",
  PAUSED: "PAUSED",
  CLOSED: "CLOSED",
  TERMINATED: "TERMINATED"
} as const;

export type InvestmentStatus = (typeof InvestmentStatus)[keyof typeof InvestmentStatus];

export const ProfitStatus = {
  FROZEN: "FROZEN",
  DISTRIBUTED: "DISTRIBUTED",
  PENDING: "PENDING"
} as const;

export type ProfitStatus = (typeof ProfitStatus)[keyof typeof ProfitStatus];

export const TransactionType = {
  DEPOSIT: "DEPOSIT",
  WITHDRAWAL: "WITHDRAWAL",
  INVESTMENT: "INVESTMENT",
  PROFIT: "PROFIT"
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionStatus = {
  PENDING: "PENDING",
  SUCCESSFUL: "SUCCESSFUL",
  FAILED: "FAILED"
} as const;

export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];
