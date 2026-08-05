import z from "zod";

import {
  selectFeedbackIssueReplySchema,
  selectFeedbackIssueSchema,
  selectUserSchema,
} from "@workspace/drizzle/schemas";
import {
  FeedbackIssueStatusEnumSchema,
  FeedbackIssueTypeEnumSchema,
} from "@workspace/drizzle/zod-db-enums";
import {
  apiOutputZodSchema,
  paginateInputZodSchema,
  paginateOutputZodSchema,
} from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { baseContract } from "@/server/orpc.contract-base";
import { InferContractRouterType } from "@/types/orpc.types";

import {
  feedbackIssueCreateSchema,
  feedbackIssueReplySchema,
  feedbackIssueStatusUpdateSchema,
} from "../feedback.schema";

const feedbackBaseContract = baseContract.errors({
  NOT_FOUND: {
    status: 404,
    success: false,
    message: API_MESSAGES.FEEDBACK.NOT_FOUND,
  },
});

const tags = ["Feedback"] as const;

export const feedbackUserSchema = selectUserSchema.pick({
  id: true,
  name: true,
  email: true,
  image: true,
});

const listFeedbackIssuesContract = feedbackBaseContract
  .route({
    path: "/feedback/issues/list",
    description:
      "List feedback issues (own issues for regular users, all for support agents)",
    tags,
  })
  .input(
    paginateInputZodSchema<typeof selectFeedbackIssueSchema>({
      searchFields: ["title"],
      orderFields: ["createdAt"],
      filter: z.object({
        type: FeedbackIssueTypeEnumSchema.optional(),
        status: FeedbackIssueStatusEnumSchema.optional(),
      }),
    })
  )
  .output(
    apiOutputZodSchema(
      paginateOutputZodSchema(
        selectFeedbackIssueSchema
          .pick({
            id: true,
            type: true,
            title: true,
            status: true,
            closedAt: true,
            createdAt: true,
            updatedAt: true,
          })
          .extend({
            createdByUser: feedbackUserSchema,
            replyCount: z.number(),
          })
      )
    )
  );
export type ListFeedbackIssuesContractType = InferContractRouterType<
  typeof listFeedbackIssuesContract
>;

const feedbackIssueDetailsContract = feedbackBaseContract
  .route({
    path: "/feedback/issues/details",
    description: "Get a single feedback issue with its replies",
    tags,
  })
  .input(
    z.object({
      issueId: z.uuid(),
    })
  )
  .output(
    apiOutputZodSchema(
      selectFeedbackIssueSchema
        .pick({
          id: true,
          title: true,
          description: true,
          type: true,
          status: true,
          closedAt: true,
          createdAt: true,
          updatedAt: true,
        })
        .extend({
          createdByUser: feedbackUserSchema,
          replies: z.array(
            selectFeedbackIssueReplySchema
              .pick({
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
              })
              .extend({
                createdByUser: feedbackUserSchema,
              })
          ),
        })
    )
  );
export type FeedbackIssueDetailsContractType = InferContractRouterType<
  typeof feedbackIssueDetailsContract
>;

const createFeedbackIssueContract = feedbackBaseContract
  .route({
    path: "/feedback/issues/create",
    description: "Create a new feedback issue",
    tags,
  })
  .input(feedbackIssueCreateSchema)
  .output(apiOutputZodSchema(selectFeedbackIssueSchema));
export type CreateFeedbackIssueContractType = InferContractRouterType<
  typeof createFeedbackIssueContract
>;

const replyFeedbackIssueContract = feedbackBaseContract
  .route({
    path: "/feedback/issues/reply",
    description: "Reply to a feedback issue",
    tags,
  })
  .input(feedbackIssueReplySchema)
  .output(apiOutputZodSchema(selectFeedbackIssueReplySchema));
export type ReplyFeedbackIssueContractType = InferContractRouterType<
  typeof replyFeedbackIssueContract
>;

const updateFeedbackIssueStatusContract = feedbackBaseContract
  .route({
    path: "/feedback/issues/update-status",
    description: "Update the status of a feedback issue",
    tags,
  })
  .input(feedbackIssueStatusUpdateSchema)
  .output(apiOutputZodSchema(selectFeedbackIssueSchema));
export type UpdateFeedbackIssueStatusContractType = InferContractRouterType<
  typeof updateFeedbackIssueStatusContract
>;

export const feedbackContract = {
  list: listFeedbackIssuesContract,
  details: feedbackIssueDetailsContract,
  create: createFeedbackIssueContract,
  reply: replyFeedbackIssueContract,
  updateStatus: updateFeedbackIssueStatusContract,
};
