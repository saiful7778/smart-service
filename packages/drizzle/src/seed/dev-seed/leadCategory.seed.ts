import { faker } from "@faker-js/faker";

import {
  InsertLeadCategory,
  LeadCategoryDataModel,
  LeadCategoryTable,
  OrganizationDataModel,
  OrgMemberDataModel,
} from "../../schemas";
import { db } from "../seed-db-client";

export const LEAD_CATEGORIES: Array<{ name: string; slug: string }> = [
  { name: "Cleaning", slug: "cleaning" },
  { name: "Repair", slug: "repair" },
  { name: "Maintenance", slug: "maintenance" },
  { name: "Installation", slug: "installation" },
  { name: "Painting", slug: "painting" },
  { name: "Plumbing", slug: "plumbing" },
  { name: "Electrical", slug: "electrical" },
  { name: "Carpentry", slug: "carpentry" },
  { name: "HVAC", slug: "hvac" },
  { name: "Pest Control", slug: "pest-control" },
];

export async function seedLeadCategory(
  orgs: Array<OrganizationDataModel>,
  orgMembers: Array<OrgMemberDataModel>
): Promise<Array<LeadCategoryDataModel>> {
  console.log("🌱 Seeding lead categories...");

  const leadCategoriesData: Array<InsertLeadCategory> = orgs.flatMap((org) => {
    const membersInOrg = orgMembers.filter((m) => m.organizationId === org.id);

    return LEAD_CATEGORIES.map((leadCategory) => {
      const creator =
        membersInOrg.length > 0
          ? faker.helpers.arrayElement(membersInOrg)
          : null;

      return {
        orgId: org.id,
        name: leadCategory.name,
        slug: leadCategory.slug,
        createdBy: creator ? creator.id : null,
        description: faker.lorem.sentence(),
      } satisfies InsertLeadCategory;
    });
  });

  const leadCategories = await db
    .insert(LeadCategoryTable)
    .values(leadCategoriesData)
    .returning();

  console.log(`✅ ${leadCategories.length} Lead categories seeded`);
  return leadCategories;
}
