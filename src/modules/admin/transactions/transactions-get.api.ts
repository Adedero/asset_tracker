import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { Transaction, User } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";

export interface TransactionsGetApiResponse extends ApiResponse {
  transactions: Transaction[];
}

export interface TranactionWithUser extends Transaction {
  user: User;
}

export interface TransactionGetApiResponse extends ApiResponse {
  transaction: TranactionWithUser;
}

export default api(
  {
    group: "/admins/me",
    path: "/transactions{/:transaction_id}",
    method: "get"
  },
  defineHandler<TransactionsGetApiResponse | TransactionGetApiResponse>(async (req) => {
    const transaction_id = req.params.transaction_id?.toString();

    const parsedQuery: ParsedQuery<Transaction> | undefined = req.parsedQuery;

    if (transaction_id) {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transaction_id },
        include: { user: true, ...(parsedQuery?.populate || {}) }
      });

      if (!transaction) {
        throw HttpException.notFound("Transaction not found");
      }

      const payload = {
        success: true,
        message: "Successful",
        transaction
      };

      return payload;
    }

    const transactions = await prisma.transaction.findMany({
      //@ts-ignore
      where: { ...(parsedQuery?.where || {}) },
      include: { user: true },
      /*  //@ts-ignore
      select: {
        ...(parsedQuery?.select || {}),
        ...(parsedQuery?.populate || {}),
        ...(parsedQuery?.exclude || {})
      }, */
      orderBy: parsedQuery?.sort,
      take: parsedQuery?.take,
      skip: parsedQuery?.skip
    });

    const payload = {
      success: true,
      message: "Successful",
      transactions
    };

    return payload;
  })
);
