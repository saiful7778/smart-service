import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

interface SubscriptionCancelledMailProps {
  adminName: string;
  appName: string;
  supportMail: string;
  tenantName: string;
  planCancelled: string;
  accessUntilDate: string;
  dataDeletionDate: string;
  dataExportUrl: string;
  reactivateUrl: string;
  feedbackUrl: string;
}

export default function SubscriptionCancelledMail({
  adminName,
  appName,
  supportMail,
  tenantName,
  planCancelled,
  accessUntilDate,
  dataDeletionDate,
  dataExportUrl,
  reactivateUrl,
}: SubscriptionCancelledMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Your subscription has been cancelled"
      supportMail={supportMail}
    >
      <EmailHeading>We&apos;re sorry to see you go</EmailHeading>
      <Text>Hello {adminName},</Text>
      <Text>
        Your <span className="font-bold">{planCancelled}</span> subscription for{" "}
        <span className="font-bold">{tenantName}</span> has been cancelled.
      </Text>

      <EmailInfoCard>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">
            Access Until
          </Column>
          <Column className="text-sm font-bold text-right text-foreground">
            {accessUntilDate}
          </Column>
        </Row>
        <Row>
          <Column className="text-xs text-muted-foreground">
            Data Deletion Date
          </Column>
          <Column className="text-sm font-bold text-right text-destructive">
            {dataDeletionDate}
          </Column>
        </Row>
      </EmailInfoCard>

      <Text className="text-sm font-semibold text-foreground mt-4">
        ⚠️ Important: Export Your Data
      </Text>
      <Text className="text-sm text-muted-foreground">
        All your business data (clients, invoices, history) will be permanently
        deleted on {dataDeletionDate}. Please export your data before this date.
      </Text>

      <Section className="text-center my-6">
        <EmailButton href={dataExportUrl}>Export My Data</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={dataExportUrl}>{dataExportUrl}</EmailLink>
      </Section>

      <Text className="text-sm text-muted-foreground">
        Changed your mind? You can easily reactivate your account and keep
        everything intact.
      </Text>

      <Section className="text-center my-6">
        <EmailButton href={reactivateUrl}>Reactivate Account</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={dataExportUrl}>{dataExportUrl}</EmailLink>
      </Section>
    </EmailLayout>
  );
}

SubscriptionCancelledMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  tenantName: "Tenant name",
  planCancelled: "Pro Plan",
  accessUntilDate: "2025-12-01",
  dataDeletionDate: "2025-12-31",
  dataExportUrl: "http://localhost:3000/dashboard/export",
  reactivateUrl: "http://localhost:3000/dashboard/subscription",
} as SubscriptionCancelledMailProps;
