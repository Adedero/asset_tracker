"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailDataSchema = exports.AttachmentSchema = exports.AddressSchema = void 0;
const zod_1 = require("zod");
exports.AddressSchema = zod_1.z.object({
    name: zod_1.z.string({ message: "Recipient name must be a string" }).optional(),
    address: zod_1.z
        .string({ message: "Recipient address must be a string" })
        .email({ message: "Invalid recipient email address" })
});
exports.AttachmentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    filename: zod_1.z.string(),
    path: zod_1.z.string(),
    cid: zod_1.z.string().optional()
});
exports.EmailDataSchema = zod_1.z
    .object({
    from: exports.AddressSchema,
    to: zod_1.z.array(exports.AddressSchema, { message: "No email recipient(s) selected" }),
    cc: zod_1.z.array(exports.AddressSchema).optional(),
    bcc: zod_1.z.array(exports.AddressSchema).optional(),
    subject: zod_1.z.string().optional(),
    html: zod_1.z.string({ message: "Email message is empty!" }),
    attachments: zod_1.z.array(exports.AttachmentSchema)
})
    .strip();
