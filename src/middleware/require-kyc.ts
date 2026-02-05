import { HttpException } from "#src/lib/api/http";
import prisma from "#src/lib/prisma/prisma";
import { NextFunction, Request, Response } from "express";

export default async function requireKyc(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = req.user?.id;
  if (!userId) {
    throw HttpException.unauthorized("Unauthorized");
  }
  const userAccount = await prisma.account.findFirst({
    where: {
      userId
    },
    select: {
      kycStatus: true
    }
  });
  let message = "";

  switch (userAccount?.kycStatus) {
    case "VERIFIED":
      message =
        "Your KYC status is verified, and you should be able to view this page. If you are not able to view this page, please contact support.";
      break;
    case "PENDING":
      message = "Your KYC status is pending. Try again later.";
      break;
    case "UNVERIFIED":
      message =
        "Your KYC documents are not verified or were rejected. Please upload new documents.";
      break;
    default:
      message = "Your KYC status is unknown";
      break;
  }

  if (userAccount?.kycStatus !== "VERIFIED") {
    throw HttpException.forbidden(
      `To view this page, your KYC status must be verified. ${message}`
    );
  }
  next();
}
