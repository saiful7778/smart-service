import { Column, Row, Section, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface UsageLimitWarningMailProps {
  adminName: string;
  appName: string;
  supportMail: string;
  limitType: string;
  currentUsage: number;
  limit: number;
  percentage: number;
  consequence: string;
  upgradeUrl: string;
  currentPlan: string;
  recommendedPlan: string;
}

export default function UsageLimitWarningMail({
  adminName,
  appName,
  supportMail,
  limitType,
  currentUsage,
  limit,
  percentage,
  consequence,
  upgradeUrl,
  currentPlan,
  recommendedPlan,
}: UsageLimitWarningMailProps) {
  const barWidth = Math.min(percentage, 100);
  const barColor = percentage >= 90 ? "bg-destructive" : "bg-primary";

  return (
    <EmailLayout
      appName={appName}
      previewText={`Warning: You've used ${percentage}% of your ${limitType}`}
      supportMail={supportMail}
    >
      <EmailHeading>⚠️ Usage Limit Warning</EmailHeading>
      <Text>Hello {adminName},</Text>
      <Text>
        Your organization is approaching its limit for{" "}
        <span className="font-bold">{limitType}</span> on the {currentPlan}{" "}
        plan.
      </Text>

      <EmailInfoCard>
        <Row className="mb-2">
          <Column className="text-xs text-muted-foreground">
            {limitType} Usage
          </Column>
          <Column className="text-xs font-bold text-right text-foreground">
            {currentUsage} / {limit}
          </Column>
        </Row>

        {/* Visual Progress Bar */}
        <Section className="w-full bg-border rounded-full h-2 my-2">
          <Section
            className={`${barColor} h-2 rounded-full m-0`}
            style={{ width: `${barWidth}%` }}
          />
        </Section>

        <Text className="text-xs text-destructive font-semibold m-0 mt-2">
          {consequence}
        </Text>
      </EmailInfoCard>

      <Text className="text-sm text-foreground mt-2">
        To avoid interruptions, we recommend upgrading to the{" "}
        <span className="font-bold">{recommendedPlan}</span> plan.
      </Text>

      <Section className="text-center my-6">
        <EmailButton href={upgradeUrl}>Upgrade Plan</EmailButton>
      </Section>

      <Section className="my-6">
        <Text className="text-sm text-muted-foreground">
          If the button above doesn&apos;t work, click the following link:
        </Text>
        <EmailLink href={upgradeUrl}>{upgradeUrl}</EmailLink>
      </Section>
    </EmailLayout>
  );
}

UsageLimitWarningMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  limitType: "Staff Seats",
  currentUsage: 9,
  limit: 10,
  percentage: 90,
  consequence: "New staff cannot be added",
  upgradeUrl: "http://localhost:3000/dashboard/billing/upgrade",
  currentPlan: "Starter",
  recommendedPlan: "Pro",
} as UsageLimitWarningMailProps;
