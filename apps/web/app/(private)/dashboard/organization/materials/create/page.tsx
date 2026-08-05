import { Metadata } from "next";

import { DashboardShell } from "@/components/shared/dashboard-shell";
import {
  DashboardShellDescription,
  DashboardShellTitle,
} from "@/components/shared/dashboard-shell/DashboardShellHeader";

import { MaterialCreateForm } from "@/features/material/components/MaterialCreateForm";
import { requireUserPermissionsWithOrgCache } from "@/utils/user-utils";

export const metadata: Metadata = {
  title: "Create Material",
};

export default async function MaterialCreatePage() {
  await requireUserPermissionsWithOrgCache([
    "org.material.manage",
    "org.material.create",
  ]);

  return (
    <DashboardShell
      header={
        <div>
          <DashboardShellTitle>Create Material</DashboardShellTitle>
          <DashboardShellDescription>
            Create a new material
          </DashboardShellDescription>
        </div>
      }
    >
      <div className="max-w-4xl w-full mx-auto">
        <MaterialCreateForm />
      </div>
    </DashboardShell>
  );
}
