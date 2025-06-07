import { z } from "zod";
export const AddressSchema = z.object({
    name: z.string({ message: "Recipient name must be a string" }).optional(),
    address: z
        .string({ message: "Recipient address must be a string" })
        .email({ message: "Invalid recipient email address" })
});
export const AttachmentSchema = z.object({
    id: z.string(),
    filename: z.string(),
    path: z.string(),
    cid: z.string().optional()
});
export const EmailDataSchema = z
    .object({
    from: AddressSchema,
    to: z.array(AddressSchema, { message: "No email recipient(s) selected" }),
    cc: z.array(AddressSchema).optional(),
    bcc: z.array(AddressSchema).optional(),
    subject: z.string().optional(),
    html: z.string({ message: "Email message is empty!" }),
    attachments: z.array(AttachmentSchema)
})
    .strip();
