import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  buildPaginateOptions,
  buildPaginationMeta,
} from "@workspace/drizzle/paginate-query";
import {
  InsertOrgTask,
  JobTable,
  OrganizationMemberTable,
  OrgMemberRoleTable,
  OrgTaskTable,
  RoleTable,
  UpdateOrgTask,
  UserTable,
} from "@workspace/drizzle/schemas";
import { jsonbAgg } from "@workspace/drizzle/sql-helpers";
import { apiResponse } from "@workspace/lib/utils";

import { API_MESSAGES } from "@/constants/apiMessage";
import { orgMemberPermissionsMiddleware } from "@/server/middleware/org.middleware";

import { taskImpl } from "./task.procedure";

const AssignedMember = alias(OrganizationMemberTable, "assigned_member");
const CreatedMember = alias(OrganizationMemberTable, "created_memeber");

const AssignedMemberRole = alias(OrgMemberRoleTable, "assigned_member_role");
const CreatedMemberRole = alias(OrgMemberRoleTable, "created_memeber_role");

const AssignedUser = alias(UserTable, "assigned_user");
const CreatedUser = alias(UserTable, "created_user");

const AssignedUserRole = alias(RoleTable, "assigned_user_role");
const CreatedUserRole = alias(RoleTable, "created_user_role");

export const listOrgTasksProcedure = taskImpl.org.list
  .use(orgMemberPermissionsMiddleware(["org.task.manage", "org.task.list"]))
  .handler(async ({ context, input }) => {
    const { where, orderBy, offset, page, limit } = buildPaginateOptions(
      {
        title: OrgTaskTable.title,
        status: OrgTaskTable.status,
        priority: OrgTaskTable.priority,
        dueDate: OrgTaskTable.dueDate,
        createdAt: OrgTaskTable.createdAt,
      },
      input
    );

    const joindedQuery = context.db
      .select({
        id: OrgTaskTable.id,
        title: OrgTaskTable.title,
        description: OrgTaskTable.description,
        status: OrgTaskTable.status,
        priority: OrgTaskTable.priority,
        dueDate: OrgTaskTable.dueDate,
        createdAt: OrgTaskTable.createdAt,
        updatedAt: OrgTaskTable.updatedAt,
        job: {
          id: JobTable.id,
          title: JobTable.title,
        },
        assignedByMember: {
          userId: AssignedUser.id,
          orgMemberId: AssignedMember.id,
          name: AssignedUser.name,
          email: AssignedUser.email,
          image: AssignedUser.image,
          roles: jsonbAgg({
            id: AssignedUserRole.id,
            roleName: AssignedUserRole.roleName,
          }).as("assigned_member_roles"),
        },
        createdByMember: {
          userId: CreatedUser.id,
          orgMemberId: CreatedMember.id,
          name: CreatedUser.name,
          email: CreatedUser.email,
          image: CreatedUser.image,
          roles: jsonbAgg({
            id: CreatedUserRole.id,
            roleName: CreatedUserRole.roleName,
          }).as("created_member_roles"),
        },
      })
      .from(OrgTaskTable)
      .leftJoin(JobTable, eq(JobTable.id, OrgTaskTable.jobId))
      .leftJoin(AssignedMember, eq(AssignedMember.id, OrgTaskTable.assignedBy))
      .leftJoin(AssignedUser, eq(AssignedUser.id, AssignedMember.userId))
      .leftJoin(
        AssignedMemberRole,
        eq(AssignedMemberRole.memberId, AssignedMember.id)
      )
      .leftJoin(
        AssignedUserRole,
        eq(AssignedUserRole.id, AssignedMemberRole.roleId)
      )
      .innerJoin(CreatedMember, eq(CreatedMember.id, OrgTaskTable.createdBy))
      .innerJoin(CreatedUser, eq(CreatedUser.id, CreatedMember.userId))
      .innerJoin(
        CreatedMemberRole,
        eq(CreatedMemberRole.memberId, CreatedMember.id)
      )
      .innerJoin(
        CreatedUserRole,
        eq(CreatedUserRole.id, CreatedMemberRole.roleId)
      )
      .where(and(eq(OrgTaskTable.orgId, context.org.id), where))
      .groupBy(
        OrgTaskTable.id,
        JobTable.id,
        AssignedMember.id,
        AssignedUser.id,
        CreatedMember.id,
        CreatedUser.id
      )
      .$dynamic();

    const [totalCount, tasks] = await Promise.all([
      context.db.$count(
        context.db
          .select({ id: OrgTaskTable.id })
          .from(OrgTaskTable)
          .where(eq(OrgTaskTable.orgId, context.org.id))
      ),
      joindedQuery.orderBy(orderBy).limit(limit).offset(offset),
    ]);

    const meta = buildPaginationMeta(totalCount, tasks.length, page, limit);

    return apiResponse(API_MESSAGES.TASK.GET_ALL, {
      meta,
      data: tasks.map(({ assignedByMember, ...task }) => ({
        ...task,
        assignedByMember: assignedByMember?.userId
          ? {
              userId: assignedByMember.userId!,
              orgMemberId: assignedByMember.orgMemberId!,
              name: assignedByMember.name!,
              email: assignedByMember.email!,
              image: assignedByMember.image!,
              roles: assignedByMember.roles!,
            }
          : null,
      })),
    });
  });

export const orgTaskDetailsProcedure = taskImpl.org.details
  .use(orgMemberPermissionsMiddleware(["org.task.manage", "org.task.read"]))
  .handler(async ({ context, input, errors }) => {
    const [taskData] = await context.db
      .select({
        id: OrgTaskTable.id,
        title: OrgTaskTable.title,
        description: OrgTaskTable.description,
        status: OrgTaskTable.status,
        priority: OrgTaskTable.priority,
        dueDate: OrgTaskTable.dueDate,
        createdAt: OrgTaskTable.createdAt,
        updatedAt: OrgTaskTable.updatedAt,
        job: {
          id: JobTable.id,
          title: JobTable.title,
        },
        assignedByMember: {
          userId: AssignedUser.id,
          orgMemberId: AssignedMember.id,
          name: AssignedUser.name,
          email: AssignedUser.email,
          image: AssignedUser.image,
          roles: jsonbAgg({
            id: AssignedUserRole.id,
            roleName: AssignedUserRole.roleName,
          }).as("assigned_member_roles"),
        },
        createdByMember: {
          userId: CreatedUser.id,
          orgMemberId: CreatedMember.id,
          name: CreatedUser.name,
          email: CreatedUser.email,
          image: CreatedUser.image,
          roles: jsonbAgg({
            id: CreatedUserRole.id,
            roleName: CreatedUserRole.roleName,
          }).as("created_member_roles"),
        },
      })
      .from(OrgTaskTable)
      .leftJoin(JobTable, eq(JobTable.id, OrgTaskTable.jobId))
      .innerJoin(CreatedMember, eq(CreatedMember.id, OrgTaskTable.createdBy))
      .innerJoin(CreatedUser, eq(CreatedUser.id, CreatedMember.userId))
      .innerJoin(
        CreatedMemberRole,
        eq(CreatedMemberRole.memberId, CreatedMember.id)
      )
      .innerJoin(
        CreatedUserRole,
        eq(CreatedUserRole.id, CreatedMemberRole.roleId)
      )
      .leftJoin(AssignedMember, eq(AssignedMember.id, OrgTaskTable.assignedBy))
      .leftJoin(AssignedUser, eq(AssignedUser.id, AssignedMember.userId))
      .leftJoin(
        AssignedMemberRole,
        eq(AssignedMemberRole.memberId, AssignedMember.id)
      )
      .leftJoin(
        AssignedUserRole,
        eq(AssignedUserRole.id, AssignedMemberRole.roleId)
      )
      .where(
        and(
          eq(OrgTaskTable.orgId, context.org.id),
          eq(OrgTaskTable.id, input.taskId)
        )
      )
      .groupBy(
        OrgTaskTable.id,
        JobTable.id,
        AssignedMember.id,
        CreatedMember.id,
        AssignedUser.id,
        CreatedUser.id
      )
      .limit(1);

    if (!taskData) throw errors.NOT_FOUND();

    const { assignedByMember, ...restTaskData } = taskData;

    return apiResponse(API_MESSAGES.TASK.GET_DETAILS, {
      ...restTaskData,
      assignedByMember: assignedByMember?.userId
        ? {
            userId: assignedByMember.userId!,
            orgMemberId: assignedByMember.orgMemberId!,
            name: assignedByMember.name!,
            email: assignedByMember.email!,
            image: assignedByMember.image!,
            roles: assignedByMember.roles!,
          }
        : null,
    });
  });

export const orgTaskCreateProcedure = taskImpl.org.create
  .use(orgMemberPermissionsMiddleware(["org.task.manage", "org.task.create"]))
  .handler(async ({ context, input }) => {
    const [task] = await context.db
      .insert(OrgTaskTable)
      .values({
        title: input.title,
        description: input.description,
        status: "todo",
        priority: input.priority,
        dueDate: input.dueDate,
        orgId: context.org.id,
        assignedBy: input.assignedBy ?? null,
        createdBy: context.orgMember.id,
      } satisfies InsertOrgTask)
      .returning({
        id: OrgTaskTable.id,
        title: OrgTaskTable.title,
        description: OrgTaskTable.description,
        status: OrgTaskTable.status,
        priority: OrgTaskTable.priority,
        dueDate: OrgTaskTable.dueDate,
        createdAt: OrgTaskTable.createdAt,
        updatedAt: OrgTaskTable.updatedAt,
      });

    if (!task) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.TASK.NOT_CREATE,
      });
    }

    return apiResponse(API_MESSAGES.TASK.CREATE, task);
  });

export const orgTaskUpdateProcedure = taskImpl.org.update
  .use(orgMemberPermissionsMiddleware(["org.task.manage", "org.task.update"]))
  .handler(async ({ context, input, errors }) => {
    const { taskId, ...restInput } = input;

    const [taskData] = await context.db
      .select({
        id: OrgTaskTable.id,
      })
      .from(OrgTaskTable)
      .where(eq(OrgTaskTable.id, taskId))
      .limit(1);

    if (!taskData) throw errors.NOT_FOUND();

    const set: UpdateOrgTask = {};

    if (restInput.title !== undefined) set.title = restInput.title;
    if (restInput.description !== undefined)
      set.description = restInput.description;
    if (restInput.status !== undefined) set.status = restInput.status;
    if (restInput.priority !== undefined) set.priority = restInput.priority;
    if (restInput.dueDate !== undefined) set.dueDate = restInput.dueDate;

    const [updatedData] = await context.db
      .update(OrgTaskTable)
      .set(set)
      .where(
        and(
          eq(OrgTaskTable.orgId, context.org.id),
          eq(OrgTaskTable.id, taskData.id)
        )
      )
      .returning({
        id: OrgTaskTable.id,
        title: OrgTaskTable.title,
        description: OrgTaskTable.description,
        status: OrgTaskTable.status,
        priority: OrgTaskTable.priority,
        dueDate: OrgTaskTable.dueDate,
        createdAt: OrgTaskTable.createdAt,
        updatedAt: OrgTaskTable.updatedAt,
      });

    if (!updatedData) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.TASK.NOT_UPDATE,
      });
    }

    return apiResponse(API_MESSAGES.TASK.UPDATE, updatedData);
  });

export const orgTaskDeleteProcedure = taskImpl.org.delete
  .use(orgMemberPermissionsMiddleware(["org.task.manage", "org.task.delete"]))
  .handler(async ({ context, input, errors }) => {
    const [taskData] = await context.db
      .select({
        id: OrgTaskTable.id,
      })
      .from(OrgTaskTable)
      .where(
        and(
          eq(OrgTaskTable.orgId, context.org.id),
          eq(OrgTaskTable.id, input.taskId)
        )
      )
      .limit(1);

    if (!taskData) throw errors.NOT_FOUND();

    await context.db
      .delete(OrgTaskTable)
      .where(eq(OrgTaskTable.id, taskData.id));

    return apiResponse(API_MESSAGES.TASK.DELETE, null);
  });
