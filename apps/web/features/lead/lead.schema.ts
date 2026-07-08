import z from "zod";

import {
  LeadSourceEnumSchema,
  LeadStatusEnumSchema,
} from "@workspace/drizzle/zod-db-enums";

export const leadAddressSchema = z.object({
  line1: z.string().min(1, "Address 1 is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip Code is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  placeId: z.string().optional(),
  isPrimary: z.boolean().optional(),
});
export type LeadAddressType = z.infer<typeof leadAddressSchema>;

export const createLeadSchema = z
  .object({
    customerId: z.uuid().optional(),
    customerName: z.string().optional(),
    customerEmail: z.string().optional(),
    customerPhone: z.string().optional(),
    isNewCustomer: z.boolean(),
    status: LeadStatusEnumSchema,
    source: LeadSourceEnumSchema,
    serviceType: z.string().optional(),
    description: z.string().optional(),
    addresses: z.array(leadAddressSchema),
    categories: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isNewCustomer) {
      const hasName = data.customerName && data.customerName.trim().length > 0;
      const hasEmail =
        data.customerEmail && data.customerEmail.trim().length > 0;
      const hasPhone =
        data.customerPhone && data.customerPhone.trim().length > 0;

      if (!hasName && !hasEmail && !hasPhone) {
        ctx.addIssue({
          code: "custom",
          message:
            "At least one of name, email, or phone is required for new customers",
          path: ["customerName"],
        });
      }

      if (hasEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.customerEmail!)) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid email format",
            path: ["customerEmail"],
          });
        }
      }

      if (hasPhone) {
        const phoneRegex = /^(\+1\s?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
        if (!phoneRegex.test(data.customerPhone!)) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid phone number",
            path: ["customerPhone"],
          });
        }
      }
    } else {
      if (!data.customerId) {
        ctx.addIssue({
          code: "custom",
          message: "customer is required",
          path: ["customerId"],
        });
      }
    }

    const primaryAddresses = data.addresses.filter(
      (address) => address.isPrimary
    );
    if (primaryAddresses.length !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "At least one address must be primary",
        path: ["addresses"],
      });
    }

    if (data.addresses.length > 3) {
      ctx.addIssue({
        code: "custom",
        message: "Maximum 3 addresses allowed",
        path: ["addresses"],
      });
    }
  });
export type CreateLeadType = z.infer<typeof createLeadSchema>;

export const generalInfoSchema = z.object({
  status: LeadStatusEnumSchema,
  serviceType: z.string().optional(),
  categories: z.array(z.string()).optional(),
  description: z.string().optional(),
});
export type GeneralInfoType = z.infer<typeof generalInfoSchema>;

export const leadCategoryCreateSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
});
export type LeadCategoryCreateType = z.infer<typeof leadCategoryCreateSchema>;

export const leadNoteSchema = z.object({
  leadId: z.uuid(),
  jobId: z.uuid().optional(),
  content: z.string().min(1, "Note content is required"),
});
export type LeadNoteType = z.infer<typeof leadNoteSchema>;

export const leadAddressesSchema = z.object({
  addresses: z.array(leadAddressSchema),
});
export type LeadAddressesType = z.infer<typeof leadAddressesSchema>;
