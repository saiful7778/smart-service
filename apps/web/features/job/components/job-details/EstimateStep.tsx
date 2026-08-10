import { LeadEstimate } from "@/features/lead/components/lead-estimate";

export function EstimateStep({ jobId }: { jobId: string }) {
  return <LeadEstimate leadId={undefined} jobId={jobId} />;
}
