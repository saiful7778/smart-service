import { Metadata } from "next";

import { DashboardShell } from "@/components/shared/DashboardShell";

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
      title="Create Material"
      shortDescription="Create a new material"
    >
      <div className="max-w-4xl w-full mx-auto">
        <MaterialCreateForm />
      </div>
    </DashboardShell>
  );
}
