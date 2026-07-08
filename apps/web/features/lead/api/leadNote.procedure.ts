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

import { createLeadHistory } from "../leadHistory.data";
import { leadImpl } from "./lead.procedure";

export const listLeadNotesProcedure = leadImpl.note.list
  .use(
    orgMemberPermissionsMiddleware([
      "org.lead_note.manage",
      "org.lead_note.read",
    ])
  )
  .handler(async ({ context, input }) => {
    const [leadData] = await context.db
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

    if (!leadData) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.LEAD.NOT_FOUND,
      });
    }

    const whereSql = [eq(LeadNoteTable.leadId, leadData.id)];

    const jobId = input?.jobId;

    if (jobId) {
      const [jobData] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        )
        .limit(1);

      if (!jobData) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }

      whereSql.push(eq(LeadNoteTable.jobId, jobData.id));
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

    const [totalCount, notes] = await Promise.all([
      context.db.$count(
        context.db
          .select({
            id: LeadNoteTable.id,
          })
          .from(LeadNoteTable)
          .where(
            and(
              eq(LeadNoteTable.leadId, input.leadId),
              eq(LeadNoteTable.orgId, context.org.id)
            )
          )
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
  .use(
    orgMemberPermissionsMiddleware([
      "org.lead_note.manage",
      "org.lead_note.create",
    ])
  )
  .handler(async ({ context, input }) => {
    const [leadData] = await context.db
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

    if (!leadData) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.LEAD.NOT_FOUND,
      });
    }

    const jobId = input?.jobId;

    if (jobId) {
      const [jobData] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        )
        .limit(1);

      if (!jobData) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
    }

    const noteData = await context.db.transaction(async (tx) => {
      const [note] = await tx
        .insert(LeadNoteTable)
        .values({
          leadId: input.leadId,
          orgId: context.org.id,
          content: input.content,
          createdBy: context.orgMember.id,
          ...(jobId && { jobId }),
        })
        .returning();

      if (!note) {
        tx.rollback();
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: API_MESSAGES.LEAD.NOTES.NOT_CREATE,
        });
      }

      await createLeadHistory(
        {
          leadId: input.leadId,
          eventType: input?.jobId ? "job_note_added" : "lead_note_added",
          ...(input?.jobId ? { jobId: input?.jobId } : {}),
          triggeredBy: context.orgMember.id,
          triggeredByType: "organization_member",
          title: "Note added",
          relatedEntityType: input.jobId ? "job" : "lead",
          relatedEntityId: input.jobId ?? leadData.id,
        },
        tx
      );

      return note;
    });

    return apiResponse(API_MESSAGES.LEAD.NOTES.CREATE, noteData);
  });

export const leadNoteUpdateProcedure = leadImpl.note.update
  .use(
    orgMemberPermissionsMiddleware([
      "org.lead_note.manage",
      "org.lead_note.update",
    ])
  )
  .handler(async ({ context, input }) => {
    const [leadData] = await context.db
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

    if (!leadData) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.LEAD.NOT_FOUND,
      });
    }

    const whereSql = [
      eq(LeadNoteTable.id, input.leadNoteId),
      eq(LeadNoteTable.leadId, leadData.id),
      eq(LeadNoteTable.orgId, context.org.id),
    ];

    const jobId = input?.jobId;

    if (jobId) {
      const [jobData] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        )
        .limit(1);

      if (!jobData) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }

      whereSql.push(eq(LeadNoteTable.jobId, jobData.id));
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

    const note = await context.db.transaction(async (tx) => {
      const [note] = await tx
        .update(LeadNoteTable)
        .set({
          content: input.content,
        })
        .where(eq(LeadNoteTable.id, noteData.id))
        .returning();

      if (!note) {
        tx.rollback();
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: API_MESSAGES.LEAD.NOTES.NOT_UPDATE,
        });
      }

      await createLeadHistory(
        {
          leadId: input.leadId,
          eventType: noteData.jobId ? "job_note_updated" : "lead_note_updated",
          ...(noteData.jobId ? { jobId: noteData.jobId } : {}),
          triggeredBy: context.orgMember.id,
          triggeredByType: "organigation_member",
          title: "Note updated",
          relatedEntityType: noteData.jobId ? "job" : "lead",
          relatedEntityId: noteData.jobId ?? noteData.leadId,
        },
        tx
      );

      return note;
    });

    return apiResponse(API_MESSAGES.LEAD.NOTES.UPDATE, note);
  });

export const leadNoteDeleteProcedure = leadImpl.note.delete
  .use(
    orgMemberPermissionsMiddleware([
      "org.lead_note.manage",
      "org.lead_note.delete",
    ])
  )
  .handler(async ({ context, input }) => {
    const [leadData] = await context.db
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

    if (!leadData) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.LEAD.NOT_FOUND,
      });
    }

    const whereSql = [
      eq(LeadNoteTable.id, input.leadNoteId),
      eq(LeadNoteTable.leadId, leadData.id),
      eq(LeadNoteTable.orgId, context.org.id),
    ];

    const jobId = input?.jobId;

    if (jobId) {
      const [jobData] = await context.db
        .select({ id: JobTable.id })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.id, jobId),
            eq(JobTable.orgId, context.org.id),
            isNull(JobTable.deletedAt)
          )
        )
        .limit(1);

      if (!jobData) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }

      whereSql.push(eq(LeadNoteTable.jobId, jobData.id));
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

    await context.db.transaction(async (tx) => {
      await tx.delete(LeadNoteTable).where(eq(LeadNoteTable.id, noteData.id));

      await createLeadHistory(
        {
          leadId: input.leadId,
          eventType: noteData.jobId ? "job_note_deleted" : "lead_note_deleted",
          ...(noteData.jobId ? { jobId: noteData.jobId } : {}),
          triggeredBy: context.orgMember.id,
          triggeredByType: "organigation_member",
          title: "Note deleted",
          relatedEntityType: noteData.jobId ? "job" : "lead",
          relatedEntityId: noteData.jobId ?? noteData.leadId,
        },
        tx
      );
    });

    return apiResponse(API_MESSAGES.LEAD.NOTES.DELETE, null);
  });
