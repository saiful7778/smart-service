import { ORPCError } from "@orpc/client";
import { and, eq, isNotNull, isNull } from "drizzle-orm";

import {
  FileTable,
  JobTable,
  LeadAttachmentTable,
  LeadTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  RoleTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { apiResponse } from "@workspace/lib/utils";

import { privateStorage } from "@/lib/storage";

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileColumns } from "@/features/user/user.api-schema";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";

import { leadImpl } from "./lead.procedure";

export const listLeadAttachmentBinProcedure = leadImpl.attachment.bin.list
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_attachment.manage", "org.lead_attachment.list"]
        : jobId
          ? ["org.job_attachment.manage", "org.job_attachment.list"]
          : [
              "org.lead_attachment.manage",
              "org.lead_attachment.list",
              "org.job_attachment.manage",
              "org.job_attachment.list",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    const whereSQL = [];

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
      whereSQL.push(eq(LeadAttachmentTable.leadId, existLead.id));
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
      whereSQL.push(eq(LeadAttachmentTable.jobId, existJob.id));
    }

    whereSQL.push(
      isNotNull(LeadAttachmentTable.deletedAt),
      isNotNull(FileTable.deletedAt)
    );

    const attachments = await context.db
      .select({
        id: LeadAttachmentTable.id,
        leadId: LeadAttachmentTable.leadId,
        jobId: LeadAttachmentTable.jobId,
        title: LeadAttachmentTable.title,
        description: LeadAttachmentTable.description,
        category: LeadAttachmentTable.category,
        uploadedAt: LeadAttachmentTable.uploadedAt,
        uploadedBy: userProfileColumns,
        file: {
          id: FileTable.id,
          key: FileTable.key,
          filename: FileTable.filename,
          originalName: FileTable.originalName,
          mimeType: FileTable.mimeType,
          size: FileTable.size,
          url: FileTable.url,
          uploadedAt: FileTable.uploadedAt,
        },
      })
      .from(LeadAttachmentTable)
      .innerJoin(FileTable, eq(FileTable.id, LeadAttachmentTable.fileId))
      .innerJoin(
        OrganizationMemberTable,
        eq(OrganizationMemberTable.id, LeadAttachmentTable.uploadedBy)
      )
      .innerJoin(UserTable, eq(UserTable.id, OrganizationMemberTable.userId))
      .innerJoin(
        OrgMemberRoleTable,
        eq(OrgMemberRoleTable.memberId, OrganizationMemberTable.id)
      )
      .innerJoin(RoleTable, eq(RoleTable.id, OrgMemberRoleTable.roleId))
      .where(and(...whereSQL))
      .groupBy(
        LeadAttachmentTable.id,
        OrganizationMemberTable.id,
        UserTable.id,
        FileTable.id
      );

    return apiResponse(API_MESSAGES.LEAD.ATTACHMENT.BIN.GET_ALL, attachments);
  });

export const leadAttachmentRestoreProcedure = leadImpl.attachment.bin.restore
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_attachment.manage", "org.lead_attachment.update"]
        : jobId
          ? ["org.job_attachment.manage", "org.job_attachment.update"]
          : [
              "org.lead_attachment.manage",
              "org.lead_attachment.update",
              "org.job_attachment.manage",
              "org.job_attachment.update",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    const whereSql = [
      eq(LeadAttachmentTable.id, input.attachmentId),
      isNotNull(LeadAttachmentTable.deletedAt),
      isNotNull(FileTable.deletedAt),
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
      whereSql.push(eq(LeadAttachmentTable.leadId, existLead.id));
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
      whereSql.push(eq(LeadAttachmentTable.jobId, existJob.id));
    }

    const [leadAttachment] = await context.db
      .select({
        id: LeadAttachmentTable.id,
        file: {
          id: FileTable.id,
        },
      })
      .from(LeadAttachmentTable)
      .innerJoin(FileTable, eq(FileTable.id, LeadAttachmentTable.fileId))
      .where(and(...whereSql))
      .limit(1);

    console.log({ leadAttachment });

    if (!leadAttachment) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.LEAD.ATTACHMENT.NOT_FOUND,
      });
    }

    await context.db.transaction(async (tx) => {
      await tx
        .update(FileTable)
        .set({
          deletedAt: null,
          deletedBy: null,
        })
        .where(eq(FileTable.id, leadAttachment.file.id));

      await tx
        .update(LeadAttachmentTable)
        .set({
          deletedAt: null,
          deletedBy: null,
        })
        .where(eq(LeadAttachmentTable.id, leadAttachment.id));
    });

    return apiResponse(API_MESSAGES.LEAD.ATTACHMENT.BIN.RESTORE, null);
  });

export const leadAttachmentBinDeleteProcedure = leadImpl.attachment.bin.delete
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_attachment.manage", "org.lead_attachment.delete"]
        : jobId
          ? ["org.job_attachment.manage", "org.job_attachment.delete"]
          : [
              "org.lead_attachment.manage",
              "org.lead_attachment.delete",
              "org.job_attachment.manage",
              "org.job_attachment.delete",
            ]
    )(...args);
  })
  .handler(async ({ context, input, errors }) => {
    if (!input?.leadId && !input?.jobId) {
      throw errors.BAD_REQUEST();
    }

    const whereSql = [
      eq(LeadAttachmentTable.id, input.attachmentId),
      isNotNull(LeadAttachmentTable.deletedAt),
      isNotNull(FileTable.deletedAt),
    ];

    if (input?.leadId) {
      const [existLead] = await context.db
        .select({
          id: LeadTable.id,
        })
        .from(LeadTable)
        .where(
          and(
            eq(LeadTable.orgId, context.org.id),
            eq(LeadTable.id, input.leadId),
            isNull(LeadTable.deletedAt)
          )
        )
        .limit(1);

      if (!existLead) {
        throw errors.NOT_FOUND();
      }
      whereSql.push(eq(LeadAttachmentTable.leadId, existLead.id));
    }

    if (input?.jobId) {
      const [existJob] = await context.db
        .select({
          id: JobTable.id,
        })
        .from(JobTable)
        .where(
          and(
            eq(JobTable.orgId, context.org.id),
            eq(JobTable.id, input.jobId),
            isNull(JobTable.deletedAt)
          )
        )
        .limit(1);

      if (!existJob) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.JOB.NOT_FOUND,
        });
      }
      whereSql.push(eq(LeadAttachmentTable.jobId, existJob.id));
    }

    const [leadAttachment] = await context.db
      .select({
        id: LeadAttachmentTable.id,
        file: {
          id: FileTable.id,
          key: FileTable.key,
          entityType: FileTable.entityType,
        },
      })
      .from(LeadAttachmentTable)
      .innerJoin(FileTable, eq(FileTable.id, LeadAttachmentTable.fileId))
      .where(and(...whereSql))
      .limit(1);

    if (!leadAttachment) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.LEAD.ATTACHMENT.NOT_FOUND,
      });
    }

    await context.db.transaction(async (tx) => {
      await tx
        .delete(LeadAttachmentTable)
        .where(eq(LeadAttachmentTable.id, leadAttachment.id));

      await tx
        .delete(FileTable)
        .where(eq(FileTable.id, leadAttachment.file.id));

      try {
        await privateStorage.delete(
          leadAttachment.file.key,
          leadAttachment.file.entityType
        );
      } catch (err) {
        context.logger.error({ err }, "Error deleting file");
        tx.rollback();
      }
    });

    return apiResponse(API_MESSAGES.LEAD.ATTACHMENT.BIN.DELETE, null);
  });
