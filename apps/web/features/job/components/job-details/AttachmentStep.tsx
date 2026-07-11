import { LeadAttachment } from "@/features/lead/components/lead-attachment";

export function AttachmentStep({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string;
}) {
  return <LeadAttachment leadId={leadId} jobId={jobId} />;
}
