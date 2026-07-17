"use client";

import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";
import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

import { ListMemberContractType } from "../../api/org.contract";
import { MemberUpdateDialog } from "../MemberUpdateDialog";

export function MemberTableRowAction({
  memberData,
}: {
  memberData: ListMemberContractType["output"]["data"]["data"][number];
}) {
  const authUser = useAuthStore((state) => state.user);
  const isAllowUpdate = usePermissionCheckWithOrg([
    "org.user.manage",
    "org.user.update",
  ]);

  const isCurrentUser = authUser.id === memberData.userId;
  return (
    <div className="flex items-center gap-2">
      {!isCurrentUser && isAllowUpdate && (
        <MemberUpdateDialog
          memberId={memberData.orgMemberId}
          roleIds={memberData.roles.map(({ id }) => id)}
        />
      )}
    </div>
  );
}
