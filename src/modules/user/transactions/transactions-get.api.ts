import { api } from "#src/lib/api/api";
import { defineHandler } from "#src/lib/api/handlers";
import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { ParsedQuery } from "#src/middleware/parse-request-query";
import { Transaction } from "#src/prisma-gen/index";
import { ApiResponse } from "#src/types/api-response";

export interface TransactionsGetApiResponse extends ApiResponse {
  transactions: Transaction[];
}

export interface TransactionGetApiResponse extends ApiResponse {
  transaction: Transaction;
}

export default api(
  {
    group: "/users/me",
    path: "/transactions{/:transaction_id}",
    method: "get"
  },
  defineHandler(async (req) => {
    const userId = req.user!.id;
    const transaction_id = req.params.transaction_id?.toString();

    const parsedQuery: ParsedQuery<Transaction> | undefined = req.parsedQuery;

    if (transaction_id) {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transaction_id, userId }
      });

      if (!transaction) {
        throw HttpException.notFound("Not found");
      }

      const payload: TransactionGetApiResponse = {
        success: true,
        message: "Successful",
        transaction
      };

      return payload;
    }

    const transactions = await prisma.transaction.findMany({
      //@ts-ignore
      where: { userId, ...(parsedQuery?.where || {}) },
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

    const payload: TransactionsGetApiResponse = {
      success: true,
      message: "Successful",
      transactions
    };

    return payload;
  })
);
