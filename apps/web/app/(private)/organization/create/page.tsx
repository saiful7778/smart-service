import { Metadata } from "next";
import { redirect } from "next/navigation";

import { CreateOrgForm } from "@/features/org/components/forms/CreateOrgForm";
import type { RoutePathType } from "@/types";

export const metadata: Metadata = {
  title: "Create Organization",
};

export default async function OrgCreatePage(
  props: PageProps<"/organization/create">
) {
  const searchParams = await props.searchParams;
  const invitationId = searchParams?.invitationId as string | undefined;

  if (invitationId) {
    redirect(
      `/organization/accept-invitation?invitationId=${invitationId}` as RoutePathType
    );
  }

  return (
    <div className="flex items-center justify-center min-h-svh bg-muted/50 py-4">
      <div className="max-w-3xl w-full bg-background shadow-lg rounded-lg p-4 border">
        <h1 className="text-2xl font-bold text-center">Create Organization</h1>
        <CreateOrgForm />
      </div>
    </div>
  );
}
