import { faker } from "@faker-js/faker";

import {
  InsertOrgTask,
  JobDataModel,
  OrganizationDataModel,
  OrgMemberDataModel,
  OrgTaskDataModel,
  OrgTaskTable,
} from "../../schemas";
import {
  TaskPriorityEnumSchema,
  TaskStatusEnumSchema,
} from "../../schemas/enums/zod-db-enums";
import { db } from "../seed-db-client";

export async function seedOrgTask(
  orgs: Array<OrganizationDataModel>,
  orgMembers: Array<OrgMemberDataModel>,
  jobs: Array<JobDataModel>
): Promise<Array<OrgTaskDataModel>> {
  console.log("🌱 Seeding tasks...");

  const orgTasks: Array<InsertOrgTask> = [];

  orgs.forEach((org) => {
    const orgMembersOfOrg = orgMembers.filter(
      ({ organizationId }) => organizationId === org.id
    );

    if (orgMembersOfOrg.length === 0) return;

    const taskCount = faker.number.int({ min: 3, max: 8 });

    for (let i = 0; i < taskCount; i++) {
      const assignee = faker.helpers.arrayElement(orgMembersOfOrg);
      const createdBy = faker.helpers.arrayElement(orgMembersOfOrg);
      const job = faker.helpers.arrayElement(jobs);

      orgTasks.push({
        orgId: org.id,
        jobId: job.id,
        title: faker.lorem.sentence({ min: 3, max: 6 }),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(TaskStatusEnumSchema.options),
        priority: faker.helpers.arrayElement(TaskPriorityEnumSchema.options),
        dueDate: faker.date.future(),
        assignedBy: assignee.userId,
        createdBy: createdBy.userId,
      } satisfies InsertOrgTask);
    }
  });

  const tasks = await db.insert(OrgTaskTable).values(orgTasks).returning();

  console.log(`✅ ${tasks.length} Tasks seeded`);
  return tasks;
}
