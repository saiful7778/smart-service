import { ORPCError } from "@orpc/client";
import { and, eq, isNull } from "drizzle-orm";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  JobTable,
  LeadNoteTable,
  LeadTable,
  OrganizationMemberTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";

import { leadImpl } from "./lead.procedure";

export const listLeadNotesProcedure = leadImpl.note.list
  .use((...args) => {
    const { leadId, jobId } = args[1];
    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_note.manage", "org.lead_note.read"]
        : jobId
          ? ["org.job_note.manage", "org.job_note.read"]
          : [
              "org.lead_note.manage",
              "org.lead_note.read",
              "org.job_note.manage",
              "org.job_note.read",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }
    const whereSql = [];

    if (input?.leadId) {
      const [existLead] = await context.db
        .select({ id: LeadTable.id })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.id, input.leadId),
            eq(LeadTable.orgId, context.org.id),
            isNull(LeadTable.deletedAt)
          )
        )
        .limit(1);

      if (!existLead) {
        throw errors.NOT_FOUND();
      }
      whereSql.push(eq(LeadNoteTable.leadId, existLead.id));
    }

    if (input?.jobId) {
      const [existJob] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, input.jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        );

      if (!existJob) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
      whereSql.push(eq(LeadNoteTable.jobId, existJob.id));
    }

    const { limit, offset, orderBy, page, where } = buildPaginateOptions(
      { createdAt: LeadNoteTable.createdAt },
      input
    );

    if (where) {
      whereSql.push(where);
    }

    const joinedQuery = context.db
      .select({
        id: LeadNoteTable.id,
        leadId: LeadNoteTable.leadId,
        content: LeadNoteTable.content,
        createdAt: LeadNoteTable.createdAt,
        updatedAt: LeadNoteTable.updatedAt,
        createdBy: {
          userId: UserTable.id,
          name: UserTable.name,
          email: UserTable.email,
          image: UserTable.image,
        },
        job: {
          id: JobTable.id,
          title: JobTable.title,
        },
      })
      .from(LeadNoteTable)
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, LeadNoteTable.createdBy)
      )
      .innerJoin(UserTable, eq(UserTable.id, OrganizationMemberTable.userId))
      .leftJoin(JobTable, eq(JobTable.id, LeadNoteTable.jobId))
      .where(and(...whereSql))
      .groupBy(
        LeadNoteTable.id,
        OrganizationMemberTable.id,
        UserTable.id,
        JobTable.id
      );

    const whereTotalSql = [];

    if (input?.leadId) {
      whereTotalSql.push(eq(LeadNoteTable.leadId, input.leadId));
    }

    whereTotalSql.push(eq(LeadNoteTable.orgId, context.org.id));

    const [totalCount, notes] = await Promise.all([
      context.db.$count(
        context.db
          .select({
            id: LeadNoteTable.id,
          })
          .from(LeadNoteTable)
          .where(and(...whereTotalSql))
      ),
      joinedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, notes.length, page, limit);

    return apiResponse(API_MESSAGES.LEAD.NOTES.GET_ALL, {
      meta,
      data: notes,
    });
  });

export const leadNoteCreateProcedure = leadImpl.note.create
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_note.manage", "org.lead_note.create"]
        : jobId
          ? ["org.job_note.manage", "org.job_note.create"]
          : [
              "org.lead_note.manage",
              "org.lead_note.create",
              "org.job_note.manage",
              "org.job_note.create",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    let leadId: string | undefined = undefined;
    let jobId: string | undefined = undefined;

    if (input?.leadId) {
      const [existLead] = await context.db
        .select({ id: LeadTable.id })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.id, input.leadId),
            eq(LeadTable.orgId, context.org.id),
            isNull(LeadTable.deletedAt)
          )
        )
        .limit(1);

      if (!existLead) {
        throw errors.NOT_FOUND();
      }
      leadId = existLead.id;
    }

    if (input?.jobId) {
      const [existJob] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, input.jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        );

      if (!existJob) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
      jobId = existJob.id;
    }

    const [noteData] = await context.db
      .insert(LeadNoteTable)
      .values({
        leadId,
        jobId,
        orgId: context.org.id,
        content: input.content,
        createdBy: context.orgMember.id,
      })
      .returning();

    if (!noteData) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.LEAD.NOTES.NOT_CREATE,
      });
    }

    return apiResponse(API_MESSAGES.LEAD.NOTES.CREATE, noteData);
  });

export const leadNoteUpdateProcedure = leadImpl.note.update
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_note.manage", "org.lead_note.update"]
        : jobId
          ? ["org.job_note.manage", "org.job_note.update"]
          : [
              "org.lead_note.manage",
              "org.lead_note.update",
              "org.job_note.manage",
              "org.job_note.update",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    const whereSql = [
      eq(LeadNoteTable.id, input.leadNoteId),
      eq(LeadNoteTable.orgId, context.org.id),
    ];

    if (input?.leadId) {
      const [existLead] = await context.db
        .select({ id: LeadTable.id })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.id, input.leadId),
            eq(LeadTable.orgId, context.org.id),
            isNull(LeadTable.deletedAt)
          )
        )
        .limit(1);

      if (!existLead) {
        throw errors.NOT_FOUND();
      }
      whereSql.push(eq(LeadNoteTable.jobId, existLead.id));
    }

    if (input?.jobId) {
      const [existJob] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, input.jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        );

      if (!existJob) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
      whereSql.push(eq(LeadNoteTable.jobId, existJob.id));
    }

    const [noteData] = await context.db
      .select({
        id: LeadNoteTable.id,
        leadId: LeadNoteTable.leadId,
        jobId: LeadNoteTable.jobId,
        createdBy: LeadNoteTable.createdBy,
      })
      .from(LeadNoteTable)
      .where(and(...whereSql))
      .limit(1);

    if (!noteData) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.LEAD.NOTES.NOT_FOUND,
      });
    }

    if (noteData.createdBy !== context.orgMember.id) {
      throw new ORPCError("FORBIDDEN", {
        message: API_MESSAGES.LEAD.NOTES.NOT_ALLOWED_UPDATE,
      });
    }

    const [note] = await context.db
      .update(LeadNoteTable)
      .set({
        content: input.content,
      })
      .where(eq(LeadNoteTable.id, noteData.id))
      .returning();

    if (!note) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.LEAD.NOTES.NOT_UPDATE,
      });
    }

    return apiResponse(API_MESSAGES.LEAD.NOTES.UPDATE, note);
  });

export const leadNoteDeleteProcedure = leadImpl.note.delete
  .use((...args) => {
    const { leadId, jobId } = args[1];
    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_note.manage", "org.lead_note.delete"]
        : jobId
          ? ["org.job_note.manage", "org.job_note.delete"]
          : [
              "org.lead_note.manage",
              "org.lead_note.delete",
              "org.job_note.manage",
              "org.job_note.delete",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    const whereSql = [
      eq(LeadNoteTable.id, input.leadNoteId),
      eq(LeadNoteTable.orgId, context.org.id),
    ];

    if (input?.leadId) {
      const [existLead] = await context.db
        .select({ id: LeadTable.id })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.id, input.leadId),
            eq(LeadTable.orgId, context.org.id),
            isNull(LeadTable.deletedAt)
          )
        )
        .limit(1);

      if (!existLead) {
        throw errors.NOT_FOUND();
      }
      whereSql.push(eq(LeadNoteTable.leadId, existLead.id));
    }

    if (input?.jobId) {
      const [existJob] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, input.jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        );

      if (!existJob) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
      whereSql.push(eq(LeadNoteTable.jobId, existJob.id));
    }

    const [noteData] = await context.db
      .select({
        id: LeadNoteTable.id,
        leadId: LeadNoteTable.leadId,
        jobId: LeadNoteTable.jobId,
        createdBy: LeadNoteTable.createdBy,
      })
      .from(LeadNoteTable)
      .where(and(...whereSql))
      .limit(1);

    if (!noteData) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.LEAD.NOTES.NOT_FOUND,
      });
    }

    if (noteData.createdBy !== context.orgMember.id) {
      throw new ORPCError("FORBIDDEN", {
        message: API_MESSAGES.LEAD.NOTES.NOT_ALLOWED_DELETE,
      });
    }

    await context.db
      .delete(LeadNoteTable)
      .where(eq(LeadNoteTable.id, noteData.id));

    return apiResponse(API_MESSAGES.LEAD.NOTES.DELETE, null);
  });
