import { faker } from "@faker-js/faker";

import {
  InsertJob,
  JobDataModel,
  JobTable,
  LeadDataModel,
  OrgMemberDataModel,
} from "../../schemas";
import { JOB_STATUS } from "../../schemas/enums/enum-values";
import { db } from "../seed-db-client";

export async function seedJob(
  leads: Array<LeadDataModel>,
  orgMembers: Array<OrgMemberDataModel>
): Promise<Array<JobDataModel>> {
  console.log("🌱 Seeding jobs...");

  const jobsData: Array<InsertJob> = leads
    .filter(() => faker.datatype.boolean(0.7)) // 70% of leads get a job
    .map((lead) => {
      const creator = faker.helpers.arrayElement(
        orgMembers.filter((m) => m.organizationId === lead.orgId)
      );

      return {
        orgId: lead.orgId,
        leadId: lead.id,
        title: faker.lorem.words(3),
        description: faker.lorem.sentences(2),
        status: faker.helpers.arrayElement(JOB_STATUS),
        createdBy: creator?.id ?? lead.createdBy,
        expectedRevenue: faker.commerce.price({ min: 100, max: 5000 }),
        invoicedRevenue: faker.commerce.price({ min: 0, max: 4000 }),
        receivedRevenue: faker.commerce.price({ min: 0, max: 3000 }),
      } satisfies InsertJob;
    });

  if (jobsData.length === 0) return [];

  const jobs = await db.insert(JobTable).values(jobsData).returning();

  console.log(`✅ ${jobs.length} Jobs seeded`);
  return jobs;
}
