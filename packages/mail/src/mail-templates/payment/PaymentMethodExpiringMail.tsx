import { Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import { EmailHeading, EmailLayout } from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface PaymentMethodExpiringMailProps {
  adminName: string;
  appName: string;
  supportMail: string;
  cardType: string;
  last4: string;
  expirationMonth: number;
  expirationYear: number;
  updatePaymentUrl: string;
}

export default function PaymentMethodExpiringMail({
  adminName,
  appName,
  supportMail,
  cardType,
  last4,
  expirationMonth,
  expirationYear,
  updatePaymentUrl,
}: PaymentMethodExpiringMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Action required: Update your expiring card"
      supportMail={supportMail}
    >
      <EmailHeading>⚠️ Your Payment Method is Expiring</EmailHeading>
      <Text>Hello {adminName},</Text>
      <Text>
        The {cardType} ending in{" "}
        <span className="font-mono font-bold">{last4}</span> on your account
        expires at the end of {expirationMonth}/{expirationYear}. To avoid
        service interruption, please update your payment details.
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

      <Text className="text-sm text-destructive font-semibold">
        If your payment fails, your subscription and access to your data may be
        temporarily suspended.
      </Text>
    </EmailLayout>
  );
}

PaymentMethodExpiringMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  cardType: "Visa",
  last4: "4242",
  expirationMonth: 12,
  expirationYear: 2025,
  updatePaymentUrl: "http://localhost:3000/dashboard/billing/payment-methods",
} as PaymentMethodExpiringMailProps;
