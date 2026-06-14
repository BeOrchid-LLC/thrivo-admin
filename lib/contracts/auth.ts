import { z } from "zod";
import { idSchema } from "./common";

export const adminRoleSchema = z.enum(["admin", "support", "read-only"]);
export type AdminRole = z.infer<typeof adminRoleSchema>;

export const adminSchema = z.object({
  id: idSchema,
  email: z.string().email(),
  name: z.string().nullable(),
  role: adminRoleSchema,
});
export type Admin = z.infer<typeof adminSchema>;

export const sessionResponse = z.object({ admin: adminSchema });
export type SessionResponse = z.infer<typeof sessionResponse>;

export const requestOtpPayload = z.object({ email: z.string().email() });
export type RequestOtpPayload = z.infer<typeof requestOtpPayload>;

export const verifyOtpPayload = z.object({
  email: z.string().email(),
  code: z.string().min(4),
});
export type VerifyOtpPayload = z.infer<typeof verifyOtpPayload>;
