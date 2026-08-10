"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Eye, FileText, Mail, Package, Phone, Receipt } from "lucide-react";

import {
  DashboardShellDescription,
  DashboardShellHeader,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";
import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";
import { UserAvatar } from "@/components/UserAvatar";

import { orpcTQClient } from "@/server/orpc.client";

import { AttachmentStep } from "./AttachmentStep";
import { DetailsStep } from "./details-step";
import { EstimateStep } from "./EstimateStep";
import { JobStep } from "./job-step";

export function LeadDetails({ leadId }: { leadId: string }) {
  const {
    data: { data },
  } = useSuspenseQuery(
    orpcTQClient.lead.details.queryOptions({
      input: {
        leadId,
      },
    })
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-4">
        <DashboardShellHeader>
          <DashboardShellTitle>{data.customer.name}</DashboardShellTitle>
          <DashboardShellDescription>
            Detailed overview of lead information and performance.
          </DashboardShellDescription>
        </DashboardShellHeader>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground group">
              <div className="inline-flex size-8 items-center justify-center rounded-lg bg-muted/50 border shadow-sm">
                <Mail className="size-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground/50 leading-none">
                  Email Address
                </div>
                <div className="font-medium">
                  {data.customer.email || "N/A"}
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground group">
              <div className="inline-flex size-8 items-center justify-center rounded-lg bg-muted/50 border shadow-sm">
                <Phone className="size-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground/50 leading-none">
                  Phone Number
                </div>
                <div className="font-medium">
                  {data.customer.phone || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-bold leading-none">Created by</div>
            <div className="bg-card py-2 px-3 rounded-lg border shadow-sm">
              {data.createdByMember && (
                <UserAvatar
                  userName={data.createdByMember.name}
                  userEmail={data.createdByMember.email}
                  imageUrl={data.createdByMember.image}
                  userRoles={data.createdByMember.roles}
                  showDetails
                  showRoleDetails
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <TabNavigation defaultValue="details">
        <TabNavigationList variant="line">
          <TabNavigationTrigger value="details">
            <Eye className="size-4" />
            <span>Overview</span>
          </TabNavigationTrigger>

          <TabNavigationTrigger value="jobs">
            <Package className="size-4" />
            <span>Jobs</span>
          </TabNavigationTrigger>

          <TabNavigationTrigger value="estimates">
            <Receipt className="size-4" />
            <span>Estimates</span>
          </TabNavigationTrigger>

          <TabNavigationTrigger value="attachments">
            <FileText className="size-4" />
            <span>Attachments</span>
          </TabNavigationTrigger>
        </TabNavigationList>

        <TabNavigationContent value="details">
          <DetailsStep leadId={leadId} />
        </TabNavigationContent>
        <TabNavigationContent value="jobs">
          <JobStep leadId={leadId} />
        </TabNavigationContent>
        <TabNavigationContent value="estimates">
          <EstimateStep leadId={leadId} />
        </TabNavigationContent>
        <TabNavigationContent value="attachments">
          <AttachmentStep leadId={leadId} />
        </TabNavigationContent>
      </TabNavigation>
    </div>
  );
}
