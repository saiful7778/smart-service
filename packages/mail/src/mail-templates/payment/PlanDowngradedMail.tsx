import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface PlanDowngradedMailProps {
  adminName: string;
  appName: string;
  supportMail: string;
  oldPlan: string;
  newPlan: string;
  removedFeatures: string[];
  effectiveDate: string;
  keepOldPlanUrl: string;
}

export default function PlanDowngradedMail({
  adminName,
  appName,
  supportMail,
  oldPlan,
  newPlan,
  removedFeatures,
  effectiveDate,
  keepOldPlanUrl,
}: PlanDowngradedMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText="Your plan has been changed"
      supportMail={supportMail}
    >
      <EmailHeading>Plan Update Confirmation</EmailHeading>
      <Text>Hello {adminName},</Text>
      <Text>
        As requested, your plan has been changed from{" "}
        <span className="font-semibold">{oldPlan}</span> to{" "}
        <span className="font-bold">{newPlan}</span>.
      </Text>

      {removedFeatures.length > 0 && (
        <EmailInfoCard>
          <Text className="text-xs font-bold m-0 mb-2 text-destructive">
            Features losing access to on {effectiveDate}:
          </Text>
          {removedFeatures.map((feature, idx) => (
            <Row key={idx} className="mb-1">
              <Column className="w-4 text-destructive">✕</Column>
              <Column className="text-sm text-foreground">{feature}</Column>
            </Row>
          ))}
        </EmailInfoCard>
      )}

      <Text className="text-sm text-muted-foreground">
        Your existing data related to these features will be preserved in
        read-only mode. You can upgrade again at any time to regain access.
      </Text>

      <Section className="text-center my-6">
        <EmailButton href={keepOldPlanUrl}>
          Reconsider and Keep {oldPlan}
        </EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={keepOldPlanUrl}>{keepOldPlanUrl}</EmailLink>
      </Section>
    </EmailLayout>
  );
}

PlanDowngradedMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  oldPlan: "Pro Plan",
  newPlan: "Starter Plan",
  removedFeatures: ["Feature 1", "Feature 2"],
  effectiveDate: "2025-12-01",
  keepOldPlanUrl: "http://localhost:3000/dashboard/subscription",
} as PlanDowngradedMailProps;
