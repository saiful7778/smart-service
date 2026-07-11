import { LeadAttachment } from "../lead-attachment";

export function AttachmentStep({ leadId }: { leadId: string }) {
  return <LeadAttachment leadId={leadId} jobId={undefined} />;
}
