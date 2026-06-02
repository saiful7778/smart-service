import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

interface SubscriptionReactivatedMailProps {
  adminName: string;
  appName: string;
  supportMail: string;
  tenantName: string;
  planName: string;
  nextBillingDate: string;
  dashboardUrl: string;
}

export default function SubscriptionReactivatedMail({
  adminName,
  appName,
  supportMail,
  tenantName,
  planName,
  nextBillingDate,
  dashboardUrl,
}: SubscriptionReactivatedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Welcome back! Your account is reactivated."
      supportMail={supportMail}
    >
      <EmailHeading>🎉 Welcome Back!</EmailHeading>
      <Text>Hello {adminName},</Text>
      <Text>
        Great to see you again! The{" "}
        <span className="font-bold">{planName}</span> subscription for{" "}
        <span className="font-bold">{tenantName}</span> has been successfully
        reactivated. All your data is exactly where you left it.
      </Text>

      <EmailInfoCard>
        <Row>
          <Column className="text-xs text-muted-foreground">
            Next Billing Date
          </Column>
          <Column className="text-sm font-bold text-right text-foreground">
            {nextBillingDate}
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

SubscriptionReactivatedMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  tenantName: "Tenant name",
  planName: "Business Pro",
  nextBillingDate: "Dec 1, 2023",
  dashboardUrl: "http://localhost:3000/dashboard",
} as SubscriptionReactivatedMailProps;
