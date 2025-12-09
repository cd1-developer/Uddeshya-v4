import z from "zod";
export const signupSchema = z.object({
  username: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  gender: z
    .enum(["Male", "Female"], { error: "Gender can be Male or Female" })
    .optional(),
  dateOfBirth: z.date({ error: "Date of birth is required" }).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
