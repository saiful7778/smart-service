"use client";

import { ListOrgRoleOutput } from "../../api/role.contract";
import { DeleteOrgRole } from "../DeleteOrgRole";
import { UpdateOrgRoleDialog } from "../UpdateOrgRoleDialog";

export function OrgRoleTableRowAction({
  roleData,
}: {
  roleData: ListOrgRoleOutput[number];
}) {
  "use no memo";
  return (
    <div className="flex gap-2 items-center">
      {roleData.type === "dynamic" && (
        <UpdateOrgRoleDialog
          roleId={roleData.id}
          defaultValues={{
            roleName: roleData.roleName,
            permissions: roleData.permissions.map(({ id }) => id),
            description: roleData.description ?? undefined,
          }}
        />
      )}
      {roleData.type === "dynamic" && <DeleteOrgRole roleId={roleData.id} />}
    </div>
  );
}
