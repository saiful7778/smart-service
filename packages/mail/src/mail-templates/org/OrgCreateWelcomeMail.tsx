import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface OrgCreateWelcomeMailProps {
  adminName: string;
  appName: string;
  tenantName: string;
  supportMail: string;
  dashboardUrl: string;
  trialEndDate?: string;
}

export default function OrgCreateWelcomeMail({
  adminName,
  appName,
  tenantName,
  supportMail,
  dashboardUrl,
  trialEndDate,
}: OrgCreateWelcomeMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Welcome to your new account"
      supportMail={supportMail}
    >
      <EmailHeading>
        Welcome to {appName}, {adminName}!
      </EmailHeading>
      <Text>
        Your organization <span className="font-bold">{tenantName}</span> has
        been successfully created. You are just a few steps away from
        streamlining your service business.
      </Text>

      {trialEndDate && (
        <EmailInfoCard>
          <Text className="text-sm font-bold m-0 text-foreground">
            🎉 Your free trial is active!
          </Text>
          <Text className="text-xs text-muted-foreground m-0 mt-1">
            You have full access until {trialEndDate}. No credit card required
            right now.
          </Text>
        </EmailInfoCard>
      )}

      <EmailHeading>Get started in 3 easy steps:</EmailHeading>

      <EmailInfoCard>
        <Row className="items-start">
          <Column className="w-8 text-primary font-bold text-sm">1.</Column>
          <Column>
            <Text className="text-sm m-0 font-semibold">
              Complete your business profile
            </Text>
            <Text className="text-xs text-muted-foreground m-0">
              Add your logo, branding, and business hours.
            </Text>
          </Column>
        </Row>
        <Row className="items-start mt-3">
          <Column className="w-8 text-primary font-bold text-sm">2.</Column>
          <Column>
            <Text className="text-sm m-0 font-semibold">
              Add your services & team
            </Text>
            <Text className="text-xs text-muted-foreground m-0">
              Define what you offer and invite your staff.
            </Text>
          </Column>
        </Row>
        <Row className="items-start mt-3">
          <Column className="w-8 text-primary font-bold text-sm">3.</Column>
          <Column>
            <Text className="text-sm m-0 font-semibold">
              Book your first client
            </Text>
            <Text className="text-xs text-muted-foreground m-0">
              Start taking appointments and getting paid.
            </Text>
          </Column>
        </Row>
      </EmailInfoCard>

      <Section className="text-center my-6">
        <EmailButton href={dashboardUrl}>Go to Dashboard</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={dashboardUrl}>{dashboardUrl}</EmailLink>
      </Section>
    </EmailLayout>
  );
}

OrgCreateWelcomeMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  tenantName: "Tenant name",
  supportMail: "help@app-name.com",
  dashboardUrl: "https://localhost:3000/dashboard",
  trialEndDate: "2026-06-02",
} as OrgCreateWelcomeMailProps;
