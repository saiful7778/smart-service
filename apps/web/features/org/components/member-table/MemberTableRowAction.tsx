import { hasPermissionWithOrg } from "@/lib/permission";

import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";
import { useOrgStore } from "@/stores/zustand/org/OrgStoreContext";

import { ListMemberOutput } from "../../api/org.contract";
import { MemberUpdateDialog } from "../MemberUpdateDialog";

export function MemberTableRowAction({
  memberData,
}: {
  memberData: ListMemberOutput["data"][number];
}) {
  const activeOrg = useOrgStore((state) => state.activeOrg!);
  const authUser = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);

  const isCurrentUser = authUser.id === memberData.userId;
  return (
    <div className="flex items-center gap-2">
      {!isCurrentUser &&
        hasPermissionWithOrg(
          permissions,
          ["org.user.manage", "org.user.update"],
          {
            orgId: activeOrg.id,
            userId: authUser.id,
          }
        ) && (
          <MemberUpdateDialog
            memberId={memberData.orgMemberId}
            roleNames={memberData.roles.map((role) => role.roleName)}
          />
        )}
    </div>
  );
}
