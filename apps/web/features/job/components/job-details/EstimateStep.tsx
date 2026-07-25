import { LeadEstimate } from "@/features/lead/components/lead-estimate";

export function EstimateStep({
  leadId,
  jobId,
}: {
  leadId: string | null | undefined;
  jobId: string;
}) {
  return <LeadEstimate leadId={leadId} jobId={jobId} />;
}
