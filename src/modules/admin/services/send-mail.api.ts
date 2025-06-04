import {api} from "@/lib/api/api";
import {defineHandler, defineValidator} from "@/lib/api/handlers";
import {EmailData, EmailDataSchema} from "@/shared/schemas/email-data";
import {z} from "zod";
import {ApiResponse} from "@/types/api-response";

export default api(
  {
    group: "/admins/me",
    path: "/send-mail",
    method: "post",
    middleware: defineValidator("body", EmailDataSchema)
  },
  defineHandler<ApiResponse>(async (req) => {
    const data = req.validatedBody as EmailData;

    console.log(data);

    return {
      success: true,
      message: "Email sent successfully"
    }
  })
)
