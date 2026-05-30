import { faker } from "@faker-js/faker";

import {
  FileDataModel,
  InsertLeadAttachment,
  LeadAttachmentDataModel,
  LeadAttachmentTable,
  LeadDataModel,
} from "../../schemas";
import { db } from "../seed-db-client";

export async function seedLeadAttachment(
  leads: Array<LeadDataModel>,
  files: Array<FileDataModel>
): Promise<Array<LeadAttachmentDataModel>> {
  console.log("🌱 Seeding lead attachments....");

  const leadAttachmentData: Array<InsertLeadAttachment> = [];

  for (const lead of leads) {
    const file = faker.helpers.arrayElement(files);

    if (lead.createdBy !== null) {
      leadAttachmentData.push({
        leadId: lead.id,
        uploadedBy: lead.createdBy,
        fileId: file.id,
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        category: faker.lorem.word(),
      } satisfies InsertLeadAttachment);
    }
  }

  const leadAttachments = await db
    .insert(LeadAttachmentTable)
    .values(leadAttachmentData)
    .returning();

  console.log(`✅ ${leadAttachments.length} Lead attachments seeded`);
  return leadAttachments;
}
