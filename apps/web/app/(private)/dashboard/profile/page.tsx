import type { Metadata } from "next";
import Link from "next/link";

import { formatDate } from "date-fns";
import {
  Building2,
  CalendarDays,
  Check,
  Mail,
  Pencil,
  Shield,
  User,
} from "lucide-react";

import { formatEnumValue } from "@workspace/lib/utils";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

import { DashboardShell } from "@/components/shared/DashboardShell";
import {
  TabNavigation,
  TabNavigationContent,
  TabNavigationList,
  TabNavigationTrigger,
} from "@/components/tab-navigation";
import { UserAvatarImage } from "@/components/UserAvatar";

import { getAuthUserWithRolesAndPermissionsWithOrgCache } from "@/features/auth/data/getAuthUser";
import { PermissionWithOrg, RoleWithOrg } from "@/types";
import { nameInitials } from "@/utils/nameInitials";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const { user, roles, permissions } =
    await getAuthUserWithRolesAndPermissionsWithOrgCache();

  const systemRoles = roles.filter((r) => r.source === "SYSTEM");

  const orgRoles = roles.reduce(
    (acc, role) => {
      const key = role.orgSlug;
      const orgName = role.orgName;
      if (role.source === "ORG" && key && orgName) {
        if (!acc[key]) {
          acc[key] = { orgName, roles: [] };
        }
        acc[key].roles.push(role);
      }
      return acc;
    },
    {} as Record<string, { orgName: string; roles: RoleWithOrg[] }>
  );

  const systemPermissions = permissions.filter((p) => p.source === "SYSTEM");

  const orgPermissions = permissions.reduce(
    (acc, permission) => {
      const key = permission.orgSlug;
      const orgName = permission.orgName;
      if (permission.source === "ORG" && key && orgName) {
        if (!acc[key]) {
          acc[key] = { orgName, permissions: [] };
        }
        acc[key].permissions.push(permission);
      }
      return acc;
    },
    {} as Record<string, { orgName: string; permissions: PermissionWithOrg[] }>
  );

  return (
    <DashboardShell
      title="Profile"
      shortDescription="Your personal profile details"
    >
      <div className="flex items-center gap-4">
        <Avatar className="shrink-0 size-12">
          <UserAvatarImage image={user.image} alt={user.name} />
          <AvatarFallback>{nameInitials(user.name)}</AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-base font-semibold">{user.name}</h2>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Mail className="size-3" />
            <span className="text-xs">{user.email}</span>
          </div>
        </div>
      </div>

      <TabNavigation defaultValue="details">
        <TabNavigationList variant="line">
          <TabNavigationTrigger value="details">
            <User />
            <span>Details</span>
          </TabNavigationTrigger>

          <TabNavigationTrigger value="roles">
            <Shield />
            <span>Roles</span>
          </TabNavigationTrigger>

          <TabNavigationTrigger value="permissions">
            <Building2 />
            <span>Permissions</span>
          </TabNavigationTrigger>
        </TabNavigationList>

        <TabNavigationContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardAction>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        render={<Link href="/dashboard/settings/profile" />}
                      />
                    }
                  >
                    <Pencil />
                    <span className="sr-only">update profile</span>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>Update Profile</p>
                  </TooltipContent>
                </Tooltip>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2">
                <div>
                  <h4 className="font-semibold">Name</h4>
                  <div className="flex items-center gap-1">
                    <User className="size-3.5" />
                    <span>{user.name}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Email</h4>
                  <div className="flex items-center gap-1">
                    <Mail className="size-3.5" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Joined At</h4>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    <span>{formatDate(user.createdAt, "PP")}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Email Verified</h4>
                  <Badge
                    variant={user.emailVerified ? "default" : "outline"}
                    className="text-xs"
                  >
                    <Check className="size-3.5" />
                    <span>
                      {user.emailVerified ? "Verified" : "Not Verified"}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabNavigationContent>
        <TabNavigationContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="size-3" />
                  <span className="text-xs font-medium">SYSTEM</span>
                </h3>
                <Separator className="my-2" />
                <div className="flex flex-wrap items-center gap-2">
                  {systemRoles.map((role) => (
                    <Badge key={role.roleName}>
                      <User className="size-3.5" />
                      <span>{formatEnumValue(role.roleName)}</span>
                    </Badge>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="size-3" />
                  <span className="text-xs font-medium">ORGANIZATION</span>
                </h3>

                <Separator className="my-2" />

                <div className="flex flex-col gap-6">
                  {Object.keys(orgRoles).length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No roles assigned.
                    </p>
                  ) : (
                    Object.entries(orgRoles).map(
                      ([orgSlug, { orgName, roles }]) => (
                        <div key={orgSlug} className="space-y-2">
                          <h4 className="flex text-sm items-center gap-2">
                            <Building2 className="size-3" />
                            <span className="font-semibold">{orgName}</span>
                          </h4>
                          <div className="flex flex-wrap items-center gap-2">
                            {roles.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                No roles assigned in this organization.
                              </p>
                            ) : (
                              roles.map((role) => (
                                <Badge
                                  key={role.roleName + role.orgSlug}
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  <User className="size-3.5" />
                                  <span className="capitalize">{`${formatEnumValue(role.roleName)}`}</span>
                                </Badge>
                              ))
                            )}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </section>
            </CardContent>
          </Card>
        </TabNavigationContent>
        <TabNavigationContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <section>
                <h3 className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="size-3" />
                  <span className="text-xs font-medium">SYSTEM</span>
                </h3>
                <Separator className="my-2" />
                <div className="flex flex-wrap items-center gap-2">
                  {systemPermissions.map((perm) => (
                    <Badge
                      key={perm.name}
                      variant="outline"
                      className="font-mono text-xs"
                    >
                      <User className="size-3.5" />
                      <span className="capitalize">{`${perm.resource} - ${perm.action}`}</span>
                    </Badge>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="size-3" />
                  <span className="text-xs font-medium">ORGANIZATION</span>
                </h3>
                <Separator className="my-2" />
                <div className="flex flex-col gap-6">
                  {Object.keys(orgPermissions).length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No permissions assigned.
                    </p>
                  ) : (
                    Object.entries(orgPermissions).map(
                      ([orgSlug, { orgName, permissions }]) => (
                        <div key={orgSlug} className="space-y-2">
                          <h4 className="flex text-sm items-center gap-2">
                            <Building2 className="size-3" />
                            <span className="font-semibold">{orgName}</span>
                          </h4>
                          <div className="flex flex-wrap items-center gap-2">
                            {permissions.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                No permissions assigned in this organization.
                              </p>
                            ) : (
                              permissions.map((perm) => (
                                <Badge
                                  key={perm.name}
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  <User className="size-3.5" />
                                  <span className="capitalize">{`${formatEnumValue(perm.resource)} - ${perm.action}`}</span>
                                </Badge>
                              ))
                            )}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </section>
            </CardContent>
          </Card>
        </TabNavigationContent>
      </TabNavigation>
    </DashboardShell>
  );
}
