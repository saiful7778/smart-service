import { Section, Text } from "react-email";

import { formatEnumValue, type OrgRoleType } from "@workspace/lib/utils";

import { EmailButton } from "../../shared/EmailButton";
import { EmailLayout } from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface OrgInvitationMailProps {
  userEmail: string;
  inviterName: string;
  orgName: string;
  role: OrgRoleType;
  inviteUrl: string;
  appName: string;
  supportMail: string;
}

const roleConfig: Record<
  OrgRoleType,
  { color: string; description: string | undefined }
> = {
  MEMBER: {
    color: "text-blue-600",
    description: "Read-only access to organization data",
  },
  STAFF: {
    color: "text-blue-600",
    description: "Can access and manage organization resources",
  },
  DISPATCHER: {
    color: "text-blue-600",
    description: "Can access and manage organization resources",
  },
  TEAM_LEAD: {
    color: "text-blue-600",
    description: "Can access and manage organization resources",
  },
  MANAGER: {
    color: "text-blue-600",
    description: "Can access and manage organization resources",
  },
  ORG_SUPPORT_AGENT: {
    color: "text-blue-600",
    description: "Can access and manage organization resources",
  },
  ORG_ADMIN: {
    color: "text-red-600",
    description:
      "Full access to manage organization settings, members, and billing",
  },
  OWNER: {
    color: "text-green-600",
    description:
      "Full access to manage organization settings, members, and billing",
  },
};

export default function OrgInvitationMail({
  userEmail,
  inviterName,
  orgName,
  role,
  inviteUrl,
  appName,
  supportMail,
}: OrgInvitationMailProps) {
  const styleConfig = roleConfig[role] ?? {
    color: "text-blue-600",
    description: undefined,
  };

  return (
    <EmailLayout
      appName={appName}
      previewText={`${inviterName} invited you to join ${orgName} on ${appName}`}
      supportMail={supportMail}
    >
      <Text>Hello,</Text>

      <Text>
        <strong>{inviterName}</strong> has invited{" "}
        <strong>{`${userEmail} (you)`}</strong> to join the organization{" "}
        <strong>{orgName}</strong> on {appName} as a{" "}
        <strong className={styleConfig.color}>{formatEnumValue(role)}</strong>.
      </Text>

      {styleConfig.description && (
        <Section className="bg-muted rounded-lg p-4">
          <Text className="font-bold m-0">Role Details:</Text>
          <Text className="text-sm m-0 text-muted-foreground">
            {styleConfig.description}
          </Text>
        </Section>
      )}

      <Section className="text-center my-4">
        <EmailButton href={inviteUrl}>Accept Invitation</EmailButton>
      </Section>

      <Text>
        If the button above doesn&apos;t work, copy and paste this link into
        your browser:
      </Text>

      <EmailLink href={inviteUrl}>{inviteUrl}</EmailLink>

      <Text className="text-sm text-muted-foreground">
        If you weren&apos;t expecting this invitation, you can safely ignore
        this email. You won&apos;t be added to the organization unless you
        accept the invitation.
      </Text>
    </EmailLayout>
  );
}

OrgInvitationMail.PreviewProps = {
  userEmail: "john.smith@example.com",
  inviterName: "Jane Smith",
  orgName: "Acme Corp",
  role: "ORG_ADMIN",
  inviteUrl: "http://localhost:3000/accept-invitation?invitationId=abc123",
  appName: "App Name",
  supportMail: "help@app-name.com",
} as OrgInvitationMailProps;
