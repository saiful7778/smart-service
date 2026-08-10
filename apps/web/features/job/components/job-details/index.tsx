"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Eye, FileText, Receipt, Users } from "lucide-react";

import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";

import { orpcTQClient } from "@/server/orpc.client";

import { AssignmentStep } from "./AssignmentStep";
import { AttachmentStep } from "./AttachmentStep";
import { DetailsStep } from "./details-step";
import { EstimateStep } from "./EstimateStep";

export function JobDetails({ jobId }: { jobId: string }) {
  const {
    data: { data },
  } = useSuspenseQuery(
    orpcTQClient.job.details.queryOptions({
      input: {
        jobId,
      },
    })
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="leading-normal">
        <h1 className="text-lg md:text-3xl font-bold">{data.title}</h1>
        <p className="text-muted-foreground text-sm">
          Detailed overview of job information and performance.
        </p>
      </div>
      <TabNavigation defaultValue="details" className="space-y-4 md:space-y-6">
        <TabNavigationList variant="line">
          <TabNavigationTrigger value="details">
            <Eye className="size-4" />
            <span>Overview</span>
          </TabNavigationTrigger>
          <TabNavigationTrigger value="estimates">
            <Receipt className="size-4" />
            <span>Estimates</span>
          </TabNavigationTrigger>
          <TabNavigationTrigger value="assignments">
            <Users className="size-4" />
            <span>Assignments</span>
          </TabNavigationTrigger>
          <TabNavigationTrigger value="attachments">
            <FileText className="size-4" />
            <span>Attachments</span>
          </TabNavigationTrigger>
        </TabNavigationList>

        <TabNavigationContent value="details">
          <DetailsStep jobId={jobId} />
        </TabNavigationContent>
        <TabNavigationContent value="estimates">
          <EstimateStep leadId={data.leadId} jobId={jobId} />
        </TabNavigationContent>
        <TabNavigationContent value="assignments">
          <AssignmentStep jobId={jobId} />
        </TabNavigationContent>
        <TabNavigationContent value="attachments">
          <AttachmentStep leadId={data.leadId} jobId={jobId} />
        </TabNavigationContent>
      </TabNavigation>
    </div>
  );
}
