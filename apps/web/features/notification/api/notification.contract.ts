import {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";
import z from "zod";

import {
  selectNotificationSchema,
  selectNotificationSettingsSchema,
} from "@workspace/drizzle/schemas";
import {
  NotificationCategoryEnumSchema,
  NotificationLevelEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { baseContract } from "@/server/orpc.contract-base";

import { notificationUpdateSchema } from "../notification.schema";

const tags = ["Notification"] as const;

const listNotificationContract = baseContract
  .route({
    path: "/notifications/list",
    description: "Get all user notifications",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectNotificationSchema>({
      searchFields: ["title"],
      orderFields: ["createdAt"],
      filter: z.object({
        level: NotificationLevelEnumSchema.optional(),
        category: NotificationCategoryEnumSchema.optional(),
        isRead: z.boolean().optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(paginateOutputZodSchema(selectNotificationSchema))
  );
export type ListNotificationInput = InferContractRouterInputs<
  typeof listNotificationContract
>;
export type ListNotificationOutput = InferContractRouterOutputs<
  typeof listNotificationContract
>["data"];

const settingsDetailsContract = baseContract
  .route({
    method: "GET",
    path: "/notifications/settings",
    description: "Get user notification settings",
    tags,
  })
  .output(
    apiOutputZodSchema(
      z.array(
        selectNotificationSettingsSchema.pick({
          category: true,
          emailEnabled: true,
          pushEnabled: true,
          inAppEnabled: true,
        })
      )
    )
  );
export type SettingsDetailsInput = InferContractRouterInputs<
  typeof settingsDetailsContract
>;
export type SettingsDetailsOutput = InferContractRouterOutputs<
  typeof settingsDetailsContract
>["data"];

const updateSettingsContract = baseContract
  .route({
    path: "/notifications/settings/update",
    description: "Update a specific notification channel setting",
    tags,
  })
  .input(notificationUpdateSchema)
  .output(apiOutputZodSchema(z.null()));
export type UpdateSettingsInput = InferContractRouterInputs<
  typeof updateSettingsContract
>;
export type UpdateSettingsOutput = InferContractRouterOutputs<
  typeof updateSettingsContract
>["data"];

const markAsReadContract = baseContract
  .route({
    path: "/notifications/mark-as-read",
    description: "Mark a notification as read",
    tags,
  })
  .input(z.object({ ids: z.array(z.uuid()) }))
  .output(apiOutputZodSchema(z.null()));
export type MarkAsReadInput = InferContractRouterInputs<
  typeof markAsReadContract
>;
export type MarkAsReadOutput = InferContractRouterOutputs<
  typeof markAsReadContract
>["data"];

const subscribePushNotificationContract = baseContract
  .route({
    path: "/notifications/push-subscription/subscribe",
    description: "Subscribe to push notifications",
    tags,
  })
  .input(
    z.object({
      endpoint: z.url(),
      p256dh: z.string(),
      auth: z.string(),
      expirationTime: z.number().nullable().optional(),
    })
  )
  .output(apiOutputZodSchema(z.null()));
export type SubscribePushNotificationInput = InferContractRouterInputs<
  typeof subscribePushNotificationContract
>;
export type SubscribePushNotificationOutput = InferContractRouterOutputs<
  typeof subscribePushNotificationContract
>["data"];

const unsubscribePushNotificationContract = baseContract
  .route({
    path: "/notifications/push-subscription/unsubscribe",
    description: "Unsubscribe from push notifications",
    tags,
  })
  .output(apiOutputZodSchema(z.null()));
export type UnsubscribePushNotificationInput = InferContractRouterInputs<
  typeof unsubscribePushNotificationContract
>;
export type UnsubscribePushNotificationOutput = InferContractRouterOutputs<
  typeof unsubscribePushNotificationContract
>["data"];

export const notificationContract = {
  list: listNotificationContract,
  settings: settingsDetailsContract,
  updateSettings: updateSettingsContract,
  markAsRead: markAsReadContract,
  subscribe: subscribePushNotificationContract,
  unsubscribe: unsubscribePushNotificationContract,
};
