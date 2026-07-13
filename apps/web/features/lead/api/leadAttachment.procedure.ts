import { ORPCError } from "@orpc/client";
import { and, eq, isNull } from "drizzle-orm";

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

import { API_MESSAGES } from "@/constants/apiMessage";
import { userProfileColumns } from "@/features/user/user.api-schema";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";

import { leadImpl } from "./lead.procedure";

export const leadAttachmentCreateProcedure = leadImpl.attachment.create
  .use((...args) => {
    const { leadId, jobId } = args[1];

    return orgMemberPermissionsMiddleware(
      leadId
        ? ["org.lead_attachment.manage", "org.lead_attachment.create"]
        : jobId
          ? ["org.job_attachment.manage", "org.job_attachment.create"]
          : [
              "org.lead_attachment.manage",
              "org.lead_attachment.create",
              "org.job_attachment.manage",
              "org.job_attachment.create",
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

    const [existFile] = await context.db
      .select({ id: FileTable.id })
      .from(FileTable)
      .where(
        and(
          eq(FileTable.id, input.fileId),
          eq(FileTable.uploadedBy, context.user.id),
          isNull(FileTable.deletedAt)
        )
      )
      .limit(1);

    if (!existFile) {
      throw errors.BAD_REQUEST({
        message: API_MESSAGES.UPLOAD.NOT_FOUND,
      });
    }

    const [attachment] = await context.db
      .insert(LeadAttachmentTable)
      .values({
        leadId,
        jobId,
        fileId: existFile.id,
        title: input.title,
        description: input.description,
        category: input.category,
        uploadedBy: context.orgMember.id,
      })
      .returning();

    if (!attachment) {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.LEAD.ATTACHMENT.NOT_CREATE,
      });
    }

    return apiResponse(API_MESSAGES.LEAD.ATTACHMENT.CREATE, attachment);
  });

export const listLeadAttachmentProcedure = leadImpl.attachment.list
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
      isNull(LeadAttachmentTable.deletedAt),
      isNull(FileTable.deletedAt)
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

    return apiResponse(API_MESSAGES.LEAD.ATTACHMENT.GET_DETAILS, attachments);
  });

export const leadAttachmentDeleteProcedure = leadImpl.attachment.delete
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

    const whereSQL = [isNull(LeadAttachmentTable.deletedAt)];

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

    const [existAttachment] = await context.db
      .select({
        id: LeadAttachmentTable.id,
        uploadedBy: LeadAttachmentTable.uploadedBy,
        file: {
          id: FileTable.id,
          key: FileTable.key,
        },
      })
      .from(LeadAttachmentTable)
      .innerJoin(FileTable, eq(FileTable.id, LeadAttachmentTable.fileId))
      .where(and(...whereSQL))
      .limit(1);

    if (!existAttachment) {
      throw new ORPCError("NOT_FOUND", {
        message: API_MESSAGES.LEAD.ATTACHMENT.NOT_FOUND,
      });
    }

    if (existAttachment.uploadedBy !== context.orgMember.id) {
      throw new ORPCError("BAD_REQUEST", {
        message: API_MESSAGES.LEAD.ATTACHMENT.NOT_ALLOWED_DELETE,
      });
    }

    await context.db.transaction(async (tx) => {
      await tx
        .update(FileTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.user.id,
        })
        .where(eq(FileTable.id, existAttachment.file.id));

      await tx
        .update(LeadAttachmentTable)
        .set({
          deletedAt: new Date(),
          deletedBy: context.orgMember.id,
        })
        .where(eq(LeadAttachmentTable.id, existAttachment.id));
    });

    return apiResponse(API_MESSAGES.LEAD.ATTACHMENT.DELETE, null);
  });
