import { ORPCError } from "@orpc/client";
import { implement } from "@orpc/server";
import { asc, desc, eq, sql } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  FeedbackIssueReplyTable,
  FeedbackIssueTable,
  InsertFeedbackIssue,
  InsertFeedbackIssueReply,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse, formatEnumValue } from "@workspace/lib/utils";

import { env } from "@/lib/env";
import { mailProvider } from "@/lib/mail";
import { hasPermission } from "@/lib/permission";

import { API_MESSAGES } from "@/constants/apiMessage";
import { sendNotification } from "@/features/notification/data/sendNotification";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/server/middleware/auth.middleware";
import { errorMiddleware } from "@/server/middleware/error.middleware";
import { loggerMiddleware } from "@/server/middleware/logger.middleware";
import { privateRateLimitMiddleware } from "@/server/middleware/rateLimit.middleware";
import { ORPCContext } from "@/types/orpc.types";

import { notifySupportAgents } from "../data/supportAgents";
import { feedbackContract } from "./feedback.contract";

export const feedbackImpl = implement(feedbackContract)
  .$context<ORPCContext>()
  .use(loggerMiddleware)
  .use(errorMiddleware)
  .use(privateRateLimitMiddleware)
  .use(authMiddleware);

export const listFeedbackIssuesProcedure = feedbackImpl.list
  .use(userPermissionMiddleware(["system.feedback.list", "self.feedback.list"]))
  .handler(async ({ context, input }) => {
    const { page, limit, offset, where } = buildPaginateOptions(
      {
        title: FeedbackIssueTable.title,
        createdAt: FeedbackIssueTable.createdAt,
        type: FeedbackIssueTable.type,
        status: FeedbackIssueTable.status,
      },
      input
    );

    const joinedQuery = context.db
      .select({
        id: FeedbackIssueTable.id,
        type: FeedbackIssueTable.type,
        title: FeedbackIssueTable.title,
        status: FeedbackIssueTable.status,
        closedAt: FeedbackIssueTable.closedAt,
        createdAt: FeedbackIssueTable.createdAt,
        updatedAt: FeedbackIssueTable.updatedAt,
        createdByUser: {
          id: UserTable.id,
          name: UserTable.name,
          email: UserTable.email,
          image: UserTable.image,
        },
        replyCount: sql<number>`coalesce((
          select count(${FeedbackIssueReplyTable.id})::int
          from ${FeedbackIssueReplyTable}
          where ${FeedbackIssueReplyTable.issueId} = ${FeedbackIssueTable.id}
        ), 0)`.as("reply_count"),
      })
      .from(FeedbackIssueTable)
      .innerJoin(UserTable, eq(UserTable.id, FeedbackIssueTable.createdBy))
      .where(where)
      .$dynamic();

    const [totalCount, issues] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: FeedbackIssueTable.id })
          .from(FeedbackIssueTable)
      ),
      joinedQuery
        .orderBy(desc(FeedbackIssueTable.createdAt))
        .offset(offset)
        .limit(limit),
    ]);

    const meta = buildPaginationMeta(totalCount, issues.length, page, limit);

    return apiResponse(API_MESSAGES.FEEDBACK.GET_ALL, {
      meta,
      data: issues,
    });
  });

export const feedbackIssueDetailsProcedure = feedbackImpl.details
  .use(userPermissionMiddleware(["system.feedback.read", "self.feedback.read"]))
  .handler(async ({ context, input, errors }) => {
    const [issueData] = await context.db
      .select({
        id: FeedbackIssueTable.id,
        title: FeedbackIssueTable.title,
        description: FeedbackIssueTable.description,
        type: FeedbackIssueTable.type,
        status: FeedbackIssueTable.status,
        closedAt: FeedbackIssueTable.closedAt,
        createdAt: FeedbackIssueTable.createdAt,
        updatedAt: FeedbackIssueTable.updatedAt,
        createdByUser: {
          id: UserTable.id,
          name: UserTable.name,
          email: UserTable.email,
          image: UserTable.image,
        },
      })
      .from(FeedbackIssueTable)
      .innerJoin(UserTable, eq(UserTable.id, FeedbackIssueTable.createdBy))
      .where(eq(FeedbackIssueTable.id, input.issueId))
      .limit(1);

    if (!issueData) {
      throw errors.NOT_FOUND();
    }

    const replies = await context.db
      .select({
        id: FeedbackIssueReplyTable.id,
        content: FeedbackIssueReplyTable.content,
        createdAt: FeedbackIssueReplyTable.createdAt,
        updatedAt: FeedbackIssueReplyTable.updatedAt,
        createdByUser: {
          id: UserTable.id,
          name: UserTable.name,
          email: UserTable.email,
          image: UserTable.image,
        },
      })
      .from(FeedbackIssueReplyTable)
      .innerJoin(UserTable, eq(UserTable.id, FeedbackIssueReplyTable.createdBy))
      .where(eq(FeedbackIssueReplyTable.issueId, issueData.id))
      .orderBy(asc(FeedbackIssueReplyTable.createdAt));

    return apiResponse(API_MESSAGES.FEEDBACK.GET_DETAILS, {
      ...issueData,
      replies,
    });
  });

export const createFeedbackIssueProcedure = feedbackImpl.create
  .use(userPermissionMiddleware(["self.feedback.create"]))
  .handler(async ({ context, input }) => {
    const [issueData] = await context.db
      .insert(FeedbackIssueTable)
      .values({
        createdBy: context.user.id,
        type: input.type,
        title: input.title,
        description: input.description,
        status: "OPEN",
      } satisfies InsertFeedbackIssue)
      .returning();

    if (!issueData) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.FEEDBACK.NOT_CREATE,
      });
    }

    const issueUrl = `${env.NEXT_PUBLIC_SITE_URL}/dashboard/support/${issueData.id}`;

    await mailProvider.sendFeedbackIssueSubmittedMail({
      to: context.user.email,
      userName: context.user.name,
      issueTitle: issueData.title,
      issueType: issueData.type,
      issueUrl,
    });

    await notifySupportAgents({
      database: context.db,
      supabaseClient: context.supabaseClient,
      actorId: context.user!.id,
      payload: {
        category: "SUPPORT",
        level: "INFO",
        title: "New feedback issue",
        message: `${context.user.name} submitted a new ${formatEnumValue(issueData.type)}: ${issueData.title}`,
        data: { issueId: issueData.id },
      },
    });

    return apiResponse(API_MESSAGES.FEEDBACK.CREATE, issueData);
  });

export const replyFeedbackIssueProcedure = feedbackImpl.reply
  .use(
    userPermissionMiddleware(["system.feedback.update", "self.feedback.manage"])
  )
  .handler(async ({ context, input, errors }) => {
    const [issueData] = await context.db
      .select({
        id: FeedbackIssueTable.id,
        title: FeedbackIssueTable.title,
        description: FeedbackIssueTable.description,
        type: FeedbackIssueTable.type,
        status: FeedbackIssueTable.status,
        createdBy: FeedbackIssueTable.createdBy,
        closedAt: FeedbackIssueTable.closedAt,
        createdAt: FeedbackIssueTable.createdAt,
        updatedAt: FeedbackIssueTable.updatedAt,
      })
      .from(FeedbackIssueTable)
      .where(eq(FeedbackIssueTable.id, input.issueId))
      .limit(1);

    if (!issueData) {
      throw errors.NOT_FOUND();
    }

    const isOwner = issueData.createdBy === context.user.id;

    const isAgent = hasPermission(
      context.permissions ?? [],
      ["system.feedback.update"],
      { userId: context.user.id }
    );

    if (!isOwner && !isAgent) {
      throw errors.FORBIDDEN();
    }

    const [replyData] = await context.db
      .insert(FeedbackIssueReplyTable)
      .values({
        issueId: issueData.id,
        createdBy: context.user.id,
        content: input.content,
      } satisfies InsertFeedbackIssueReply)
      .returning();

    if (!replyData) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.FEEDBACK.NOT_CREATE,
      });
    }

    const issueUrl = `${env.NEXT_PUBLIC_SITE_URL}/dashboard/support/${replyData.id}`;

    if (!isOwner) {
      const [owner] = await context.db
        .select({ email: UserTable.email, name: UserTable.name })
        .from(UserTable)
        .where(eq(UserTable.id, replyData.createdBy))
        .limit(1);

      if (owner) {
        await mailProvider.sendFeedbackIssueRepliedMail({
          to: owner.email,
          userName: owner.name,
          issueTitle: issueData.title,
          issueType: issueData.type,
          replyAuthor: context.user.name,
          replyContent: input.content,
          issueUrl,
        });

        await sendNotification({
          database: context.db,
          supabaseClient: context.supabaseClient,
          payload: {
            recipientId: issueData.createdBy,
            actorId: context.user.id,
            category: "SUPPORT",
            level: "INFO",
            title: `Reply on "${issueData.title}"`,
            message: `${context.user.name} replied to your issue`,
            data: { issueId: issueData.id },
          },
        });
      }
    } else {
      await notifySupportAgents({
        database: context.db,
        supabaseClient: context.supabaseClient,
        actorId: context.user.id,
        payload: {
          category: "SUPPORT",
          level: "INFO",
          title: `New reply on "${issueData.title}"`,
          message: `${context.user.name} replied`,
          data: { issueId: issueData.id },
        },
      });
    }

    return apiResponse(API_MESSAGES.FEEDBACK.REPLY, replyData);
  });

export const updateFeedbackIssueStatusProcedure = feedbackImpl.updateStatus
  .use(userPermissionMiddleware(["system.feedback.update"]))
  .handler(async ({ context, input, errors }) => {
    const [issueData] = await context.db
      .select({
        id: FeedbackIssueTable.id,
        title: FeedbackIssueTable.title,
        description: FeedbackIssueTable.description,
        type: FeedbackIssueTable.type,
        status: FeedbackIssueTable.status,
        createdBy: FeedbackIssueTable.createdBy,
        closedAt: FeedbackIssueTable.closedAt,
        createdAt: FeedbackIssueTable.createdAt,
        updatedAt: FeedbackIssueTable.updatedAt,
      })
      .from(FeedbackIssueTable)
      .where(eq(FeedbackIssueTable.id, input.issueId))
      .limit(1);

    if (!issueData) {
      throw errors.NOT_FOUND();
    }

    const isAgent = hasPermission(
      context.permissions ?? [],
      ["system.feedback.update"],
      { userId: context.user.id }
    );

    const isOwner = issueData.createdBy === context.user.id;
    const isOwnerClosingOwn = isOwner && input.status === "CLOSED";

    if (!isAgent && !isOwnerClosingOwn) {
      throw errors.FORBIDDEN();
    }

    const [updated] = await context.db
      .update(FeedbackIssueTable)
      .set({
        status: input.status,
        closedAt: input.status === "CLOSED" ? new Date() : null,
      })
      .where(eq(FeedbackIssueTable.id, issueData.id))
      .returning();

    if (!updated) {
      throw errors.NOT_FOUND();
    }

    if (!isOwner) {
      const [owner] = await context.db
        .select({ email: UserTable.email, name: UserTable.name })
        .from(UserTable)
        .where(eq(UserTable.id, issueData.createdBy))
        .limit(1);

      const issueUrl = `${env.NEXT_PUBLIC_SITE_URL}/dashboard/support/${issueData.id}`;

      if (owner) {
        await mailProvider.sendFeedbackIssueStatusChangedMail({
          to: owner.email,
          userName: owner.name,
          issueTitle: issueData.title,
          issueType: issueData.type,
          newStatus: updated.status,
          issueUrl,
        });

        await sendNotification({
          database: context.db,
          supabaseClient: context.supabaseClient,
          payload: {
            recipientId: issueData.createdBy,
            actorId: context.user!.id,
            category: "SUPPORT",
            level: "INFO",
            title: `Status updated on "${issueData.title}"`,
            message: `Your issue is now ${formatEnumValue(updated.status)}`,
            data: { issueId: issueData.id },
          },
        });
      }
    }

    return apiResponse(API_MESSAGES.FEEDBACK.UPDATE_STATUS, updated);
  });
