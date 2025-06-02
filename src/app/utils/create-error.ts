import { HttpException } from "@/lib/api/http";

export default function createError(data: any) {
  return new HttpException(data?.statusCode || 500, data?.message || "Internal Server Error", {
    errorCode: data?.errorCode,
    data: data?.data
  });
}
