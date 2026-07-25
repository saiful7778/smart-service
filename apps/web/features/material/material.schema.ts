import z from "zod";

export const materialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string(),
  unit: z.string().min(1, "Unit is required").max(50, "Unit is too long"),
  unitPrice: z.string().refine((value) => {
    if (!value) return true;
    return Number(value) >= 0;
  }, "Unit price must be greater than or equal to 0"),
  costPrice: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return Number(value) >= 0;
    }, "Cost price must be greater than or equal to 0"),
  stockQuantity: z.string().refine((value) => {
    if (!value) return true;
    return Number(value) >= 0;
  }, "Stock quantity must be greater than or equal to 0"),
  minimumStockLevel: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return Number(value) >= 0;
    }, "Minimum stock level must be greater than or equal to 0"),
});
export type MaterialType = z.infer<typeof materialSchema>;
