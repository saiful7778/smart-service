import { type Metadata } from "next";

import { eq } from "drizzle-orm";
import { Building2, Mail, Shield, User } from "lucide-react";

import {
  InvitationTable,
  OrganizationMemberTable,
  OrganizationTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import { formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

import { db } from "@/lib/db";

import { AcceptInvitation } from "@/features/org/components/AcceptInvitation";

export const metadata: Metadata = {
  title: "Accept Invitation",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AcceptInvitationPage(
  props: PageProps<"/organization/accept-invitation">
) {
  const searchParams = await props.searchParams;

  const invitationId = searchParams?.invitationId as string | undefined;

  if (!invitationId) {
    return (
      <Card>
        <CardContent>
          <div className="text-center text-xl font-semibold text-destructive">
            &apos;invitationId&apos; is not found in search | query params
          </div>
        </CardContent>
      </Card>
    );
  }

  const [invitation] = await db
    .select({
      id: InvitationTable.id,
      email: InvitationTable.email,
      org: {
        id: OrganizationTable.id,
        name: OrganizationTable.name,
      },
      inviter: {
        id: UserTable.id,
        name: UserTable.name,
        email: UserTable.email,
      },
      role: InvitationTable.role,
      status: InvitationTable.status,
      expiresAt: InvitationTable.expiresAt,
    })
    .from(InvitationTable)
    .innerJoin(
      OrganizationTable,
      eq(InvitationTable.organizationId, OrganizationTable.id)
    )
    .innerJoin(
      OrganizationMemberTable,
      eq(InvitationTable.inviterId, OrganizationMemberTable.userId)
    )
    .innerJoin(UserTable, eq(OrganizationMemberTable.userId, UserTable.id))
    .where(eq(InvitationTable.id, invitationId))
    .limit(1);

  if (!invitation) {
    return (
      <Card>
        <CardContent>
          <div className="text-center text-xl font-semibold text-destructive">
            Invitation not found
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitation.status === "accepted") {
    return (
      <Card>
        <CardContent>
          <div className="text-center text-xl font-semibold text-destructive">
            Invitation already accepted
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitation.status === "expired") {
    return (
      <Card>
        <CardContent>
          <div className="text-center text-xl font-semibold text-destructive">
            Invitation expired
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitation.status === "rejected") {
    return (
      <Card>
        <CardContent>
          <div className="text-center text-xl font-semibold text-destructive">
            Invitation rejected
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitation.status === "canceled") {
    return (
      <Card>
        <CardContent>
          <div className="text-center text-xl font-semibold text-destructive">
            Invitation canceled
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold tracking-tight">
          Accept Invitation
        </CardTitle>
        <CardDescription className="text-center text-sm">
          You&apos;ve been invited to join{" "}
          <span className="font-semibold text-foreground">
            {invitation.org.name}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg border">
          <div className="flex items-center gap-3 px-3 my-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-background">
              <Building2 className="size-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Organization
              </span>
              <span className="text-sm font-semibold">
                {invitation.org.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-3 my-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-background">
              <User className="size-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Invited By
              </span>
              <span className="text-sm font-semibold">
                {invitation.inviter.name}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3 px-3 my-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-background">
              <Mail className="size-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Invited Email
              </span>
              <span className="text-sm font-semibold">{invitation.email}</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3 px-3 my-3">
            <div className="flex items-center gap-3 ">
              <div className="flex size-8 items-center justify-center rounded-md bg-background">
                <Shield className="size-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Assigned Role
                </span>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="px-3 py-1 font-bold capitalize"
            >
              {formatEnumValue(invitation.role)}
            </Badge>
          </div>
        </div>

        <AcceptInvitation invitationId={invitation.id} />

        <p className="text-center text-sm text-muted-foreground">
          By accepting this invitation, you agree to the organization&apos;s
          terms and conditions.
        </p>
      </CardContent>
    </Card>
  );
}
