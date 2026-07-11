import { LeadAttachment } from "@/features/lead/components/lead-attachment";

export function AttachmentStep({ jobId }: { jobId: string }) {
  return <LeadAttachment leadId={undefined} jobId={jobId} />;
}
