import { z } from "zod";
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(["donor", "ngo"]),
});
export const ngoSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().min(20).max(2000),
  contactEmail: z.email(),
  contactPhone: z.string().max(40).optional(),
  primarySdg: z.coerce.number().int().min(1).max(17),
});
export const campaignSchema = z.object({
  title: z.string().min(4).max(180),
  description: z.string().min(30).max(5000),
  targetAmount: z.coerce.number().positive(),
  deadline: z.coerce.date().min(new Date()),
  sdg: z.coerce.number().int().min(1).max(17),
});
export const pledgeSchema = z.object({
  amount: z.coerce.number().positive().max(10_000_000),
});
