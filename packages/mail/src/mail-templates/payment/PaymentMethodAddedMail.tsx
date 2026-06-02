import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

interface PaymentMethodAddedMailProps {
  adminName: string;
  appName: string;
  supportMail: string;
  paymentType: string;
  last4: string;
  addedBy: string;
  managePaymentMethodsUrl: string;
}

export default function PaymentMethodAddedMail({
  adminName,
  appName,
  supportMail,
  paymentType,
  last4,
  addedBy,
  managePaymentMethodsUrl,
}: PaymentMethodAddedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="A new payment method was added"
      supportMail={supportMail}
    >
      <EmailHeading>Payment Method Added</EmailHeading>
      <Text>Hello {adminName},</Text>
      <Text>
        A new payment method was successfully added to your account by{" "}
        <span className="font-semibold">{addedBy}</span>.
      </Text>

      <EmailInfoCard>
        <Row className="items-center">
          <Column>
            <Text className="text-xs text-muted-foreground m-0">
              New Payment Method
            </Text>
            <Text className="text-sm font-bold m-0 text-foreground">
              {paymentType} ending in {last4}
            </Text>
          </Column>
        </Row>
      </EmailInfoCard>

      <Text className="text-sm text-muted-foreground">
        If you did not authorize this change, please contact our support team
        immediately.
      </Text>

      <Section className="text-center my-6">
        <EmailButton href={managePaymentMethodsUrl}>
          Manage Payment Methods
        </EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={managePaymentMethodsUrl}>
          {managePaymentMethodsUrl}
        </EmailLink>
      </Section>
    </EmailLayout>
  );
}

PaymentMethodAddedMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  paymentType: "Visa",
  last4: "4242",
  addedBy: "John Doe",
  managePaymentMethodsUrl:
    "http://localhost:3000/dashboard/billing/payment-methods",
} as PaymentMethodAddedMailProps;
