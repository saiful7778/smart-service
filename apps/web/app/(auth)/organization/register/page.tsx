import { eq } from "drizzle-orm";
import { Building2, Mail } from "lucide-react";

import {
  InvitationTable,
  OrganizationMemberTable,
  OrganizationTable,
  UserTable,
} from "@workspace/drizzle/schemas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";

import { db } from "@/lib/db";

import { DEFAULT_AUTH_PATH } from "@/constants";
import RegisterForm from "@/features/auth/components/forms/RegisterForm";

export default async function RegisterPage(
  props: PageProps<"/organization/register">
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

  const redirectUrl =
    (searchParams?.redirect as string | undefined) ?? DEFAULT_AUTH_PATH;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold tracking-tight">
          Let&apos;s Get Started!
        </CardTitle>
        <CardDescription className="text-center text-sm">
          You&apos;ve been invited to join{" "}
          <span className="font-semibold text-foreground">
            {invitation.org.name}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent>
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
        </div>
      </CardContent>

      <CardContent>
        <RegisterForm
          redirect={redirectUrl}
          invitationId={invitationId}
          email={invitation.email}
        />
      </CardContent>

      <CardContent>
        <p className="text-center text-sm text-muted-foreground">
          By accepting this invitation, you agree to the organization&apos;s
          terms and conditions.
        </p>
      </CardContent>
    </Card>
  );
}
