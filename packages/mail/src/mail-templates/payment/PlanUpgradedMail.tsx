import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface PlanUpgradedMailProps {
  adminName: string;
  appName: string;
  supportMail: string;
  oldPlan: string;
  newPlan: string;
  newFeatures: string[];
  proratedCharge: string;
  nextBillingAmount: string;
  effectiveDate: string;
  exploreFeaturesUrl: string;
}

export default function PlanUpgradedMail({
  adminName,
  appName,
  supportMail,
  oldPlan,
  newPlan,
  newFeatures,
  proratedCharge,
  nextBillingAmount,
  effectiveDate,
  exploreFeaturesUrl,
}: PlanUpgradedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="You've upgraded your plan!"
      supportMail={supportMail}
    >
      <EmailHeading>🚀 Welcome to {newPlan}!</EmailHeading>
      <Text>Hello {adminName},</Text>
      <Text>
        Great news! Your plan has been successfully upgraded from{" "}
        <span className="font-semibold line-through text-muted-foreground">
          {oldPlan}
        </span>{" "}
        to <span className="font-bold text-primary">{newPlan}</span> effective{" "}
        {effectiveDate}.
      </Text>

      <EmailInfoCard>
        <Text className="text-xs font-bold m-0 mb-2 text-foreground">
          New Features Unlocked:
        </Text>
        {newFeatures.map((feature, idx) => (
          <Row key={idx} className="mb-1">
            <Column className="w-4 text-primary">✓</Column>
            <Column className="text-sm text-foreground">{feature}</Column>
          </Row>
        ))}
      </EmailInfoCard>

      <EmailInfoCard>
        <Row className="mb-1">
          <Column className="text-xs text-muted-foreground">
            Prorated Charge Today
          </Column>
          <Column className="text-xs font-bold text-right text-foreground">
            {proratedCharge}
          </Column>
        </Row>
        <Row>
          <Column className="text-xs text-muted-foreground">
            Next Billing Amount
          </Column>
          <Column className="text-xs font-bold text-right text-foreground">
            {nextBillingAmount}
          </Column>
        </Row>
      </EmailInfoCard>

      <Section className="text-center my-6">
        <EmailButton href={exploreFeaturesUrl}>
          Explore New Features
        </EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={exploreFeaturesUrl}>{exploreFeaturesUrl}</EmailLink>
      </Section>
    </EmailLayout>
  );
}

PlanUpgradedMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  oldPlan: "Basic Plan",
  newPlan: "Pro Plan",
  newFeatures: [
    "Feature 1",
    "Feature 2",
    "Feature 3",
    "Feature 4",
    "Feature 5",
    "Feature 6",
    "Feature 7",
  ],
  proratedCharge: "$10.00",
  nextBillingAmount: "$49.00",
  effectiveDate: "2022-01-01",
  exploreFeaturesUrl: "http://localhost:3000/dashboard/subscription/features",
} as PlanUpgradedMailProps;
