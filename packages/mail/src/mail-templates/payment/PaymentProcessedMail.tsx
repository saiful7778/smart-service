import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface PaymentProcessedMailProps {
  adminName: string;
  appName: string;
  supportMail: string;
  tenantName: string;
  amount: string;
  planName: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  paymentMethod: string;
  transactionId: string;
  invoiceUrl: string;
}

export default function PaymentProcessedMail({
  adminName,
  appName,
  supportMail,
  tenantName,
  amount,
  planName,
  billingPeriodStart,
  billingPeriodEnd,
  paymentMethod,
  transactionId,
  invoiceUrl,
}: PaymentProcessedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText={`Payment receipt for ${amount}`}
      supportMail={supportMail}
    >
      <EmailHeading>🎉 Payment Receipt</EmailHeading>
      <Text>Hello {adminName},</Text>
      <Text>
        Your subscription payment for{" "}
        <span className="font-bold">{tenantName}</span> has been successfully
        processed.
      </Text>

      <EmailInfoCard>
        <Row className="items-center mb-3 border-b border-border pb-3">
          <Column>
            <Text className="text-xs text-muted-foreground m-0">
              Amount Charged
            </Text>
            <Text className="text-2xl font-bold m-0 text-foreground">
              {amount}
            </Text>
          </Column>
          <Column className="text-right">
            <Text className="text-xs text-muted-foreground m-0">Plan</Text>
            <Text className="text-sm font-bold m-0 text-foreground">
              {planName}
            </Text>
          </Column>
        </Row>
        <Row className="mb-1">
          <Column className="text-xs text-muted-foreground">
            Billing Period
          </Column>
          <Column className="text-xs text-right text-foreground">
            {billingPeriodStart} - {billingPeriodEnd}
          </Column>
        </Row>
        <Row className="mb-1">
          <Column className="text-xs text-muted-foreground">
            Payment Method
          </Column>
          <Column className="text-xs text-right text-foreground">
            {paymentMethod}
          </Column>
        </Row>
        <Row>
          <Column className="text-xs text-muted-foreground">
            Transaction ID
          </Column>
          <Column className="text-xs text-right font-mono text-foreground">
            {transactionId}
          </Column>
        </Row>
      </EmailInfoCard>

      <Section className="text-center my-6">
        <EmailButton href={invoiceUrl}>View Invoice</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={invoiceUrl}>{invoiceUrl}</EmailLink>
      </Section>
    </EmailLayout>
  );
}

PaymentProcessedMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  tenantName: "Tenant name",
  amount: "$49.00",
  planName: "Business Pro",
  billingPeriodStart: "Nov 1, 2023",
  billingPeriodEnd: "Dec 1, 2023",
  paymentMethod: "Visa ending 4242",
  transactionId: "txn_1234567890",
  invoiceUrl: "http://localhost:3000/dashboard/billing/invoices",
} as PaymentProcessedMailProps;
