import { LeadEstimate } from "../lead-estimate";

export function EstimateStep({ leadId }: { leadId: string }) {
  return <LeadEstimate leadId={leadId} jobId={undefined} />;
}
