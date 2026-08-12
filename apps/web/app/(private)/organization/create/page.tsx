import { Metadata } from "next";
import { redirect } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { env } from "@/lib/env";

import { LinkButton } from "@/components/LinkButton";

import { DEFAULT_AUTH_PATH } from "@/constants";
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
  const redirectTo = searchParams?.redirectTo as string | undefined;

  if (invitationId) {
    redirect(
      `/organization/accept-invitation?invitationId=${invitationId}` as RoutePathType
    );
  }

  const redirectUrl = new URL(
    redirectTo || DEFAULT_AUTH_PATH,
    env.NEXT_PUBLIC_SITE_URL
  );

  return (
    <div className="flex items-center justify-center min-h-svh bg-muted/50 py-4">
      <div className="max-w-3xl w-full bg-background shadow-lg rounded-lg p-4 border">
        {redirectTo && (
          <div>
            <LinkButton href={redirectUrl.toString() as RoutePathType}>
              <ArrowLeft />
              <span>Go Back</span>
            </LinkButton>
          </div>
        )}
        <h1 className="text-2xl font-bold text-center">Create Organization</h1>
        <CreateOrgForm />
      </div>
    </div>
  );
}
