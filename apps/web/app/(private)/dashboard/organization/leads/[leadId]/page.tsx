import { Metadata } from "next";

import { Eye, FileText, Mail, Package, Phone, Receipt } from "lucide-react";

import { getQueryClient, HydrateClient } from "@/lib/tanstack/query/hydration";

import { DashboardShell } from "@/components/shared/DashboardShell";
import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";
import { UserAvatar } from "@/components/UserAvatar";

import {
  DEFAULT_INFINITE_PAGE_SIZE,
  DEFAULT_INFINITE_PAGE_START,
} from "@/constants";
import { AttachmentStep } from "@/features/lead/components/lead-details/AttachmentStep";
import { DetailsStep } from "@/features/lead/components/lead-details/details-step";
import { EstimateStep } from "@/features/lead/components/lead-details/EstimateStep";
import { JobStep } from "@/features/lead/components/lead-details/job-step";
import { orpcTQClient } from "@/server/orpc.client";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Lead details",
};

export default async function SingleLeadDetailsPage(
  props: PageProps<"/dashboard/organization/leads/[leadId]">
) {
  await requireUserPermissionsWithOrgCache([
    "org.lead.manage",
    "org.lead.read",
  ]);

  const { leadId } = await props.params;

  const queryclient = getQueryClient();

  const { data } = await queryclient.fetchQuery(
    orpcTQClient.lead.details.queryOptions({
      input: {
        leadId,
      },
    })
  );

  await queryclient.prefetchInfiniteQuery(
    orpcTQClient.lead.note.list.infiniteOptions({
      input: (pageParam) => ({
        leadId,
        order: "desc",
        orderField: "createdAt",
        page: pageParam,
        limit: DEFAULT_INFINITE_PAGE_SIZE,
      }),
      getNextPageParam: ({ data }) => data.meta.nextPage ?? undefined,
      initialPageParam: DEFAULT_INFINITE_PAGE_START,
    })
  );

  return (
    <HydrateClient client={queryclient}>
      <DashboardShell
        className="max-w-5xl mx-auto w-full"
        backUrl="/dashboard/organization/leads"
        title={data.customer.name}
        shortDescription="Detailed overview of lead information and performance."
      >
        {/* Header Section start */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col gap-3">
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
          <TabNavigationContent value="attachments">
            <AttachmentStep leadId={leadId} />
          </TabNavigationContent>
          <TabNavigationContent value="estimates">
            <EstimateStep leadId={leadId} />
          </TabNavigationContent>
        </TabNavigation>
      </DashboardShell>
    </HydrateClient>
  );
}
