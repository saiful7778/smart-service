import { Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

interface PaymentFailedMailProps {
  adminName: string;
  appName: string;
  supportMail: string;
  tenantName: string;
  amountAttempted: string;
  failureReason: string;
  retryDate: string;
  gracePeriodDays: number;
  updatePaymentUrl: string;
}

export default function PaymentFailedMail({
  adminName,
  appName,
  supportMail,
  tenantName,
  amountAttempted,
  failureReason,
  retryDate,
  gracePeriodDays,
  updatePaymentUrl,
}: PaymentFailedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Action Required: Payment method failed"
      supportMail={supportMail}
    >
      <EmailHeading>⚠️ Payment Failed</EmailHeading>
      <Text>Hello {adminName},</Text>
      <Text>
        We were unable to process the subscription payment of{" "}
        <span className="font-bold">{amountAttempted}</span> for the{" "}
        <span className="font-bold">{tenantName}</span> account.
      </Text>

      <EmailInfoCard>
        <Text className="text-xs text-muted-foreground m-0 mb-1">Reason</Text>
        <Text className="text-sm font-semibold m-0 text-destructive">
          {failureReason}
        </Text>
      </EmailInfoCard>

      <Text>
        Please update your payment method to avoid service interruption. You
        have <span className="font-bold">{gracePeriodDays} days</span> before
        your account features are restricted. We will automatically retry on{" "}
        {retryDate}.
      </Text>

      <Section className="text-center my-6">
        <EmailButton href={updatePaymentUrl}>Update Payment Method</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={updatePaymentUrl}>{updatePaymentUrl}</EmailLink>
      </Section>

      <Text className="text-sm text-muted-foreground">
        If you need more time or have questions, please reach out to our support
        team.
      </Text>
    </EmailLayout>
  );
}

PaymentFailedMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  tenantName: "Tenant name",
  amountAttempted: "$1,234.56",
  failureReason: "Payment method failed",
  retryDate: "2026-06-02",
  gracePeriodDays: 10,
  updatePaymentUrl: "http://localhost:3000/dashboard",
} as PaymentFailedMailProps;
