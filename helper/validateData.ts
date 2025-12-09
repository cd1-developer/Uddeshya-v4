import { z } from "zod";

function validateData<T extends z.ZodTypeAny>(schema: T, data: unknown) {
  type schemaType = z.infer<typeof schema>;
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const errorMessage = JSON.parse(parsed.error.message)[0].message;
    return { success: false, message: errorMessage };
  }
  return { success: true, data: parsed.data as schemaType };
}
export default validateData;
