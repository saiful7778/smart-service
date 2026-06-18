"use client";

import { OrgRoleType } from "@workspace/lib/utils";

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
      {roleData.customRoleName && (
        <UpdateOrgRoleDialog
          roleId={roleData.id}
          defaultValues={{
            roleName: roleData.roleName as OrgRoleType,
            customRoleName: roleData.customRoleName,
            permissions: roleData.permissions.map(({ id }) => id),
            description: roleData.description ?? undefined,
          }}
        />
      )}
      {roleData.customRoleName && <DeleteOrgRole roleId={roleData.id} />}
    </div>
  );
}
