import { z } from "zod";

export const jobDescriptionSchema = z
  .string()
  .min(80, "Cole a descricao completa da vaga.")
  .max(20000, "A descricao da vaga esta muito longa.");

export const optimizeRequestSchema = z.object({
  resumeId: z.string().uuid()
});

export const exportRequestSchema = z.object({
  resumeId: z.string().uuid()
});
