import { Row, Section, Text } from "react-email";

import { EmailButton } from "../shared/EmailButton";
import { EmailHeading, EmailLayout, EmailMetric } from "../shared/EmailLayout";
import { EmailLink } from "../shared/EmailLink";

export interface WeeklySummaryMailProps {
  adminName: string;
  appName: string;
  supportMail: string;
  weekRange: string;
  totalRevenue: string;
  revenueChange: number;
  totalAppointments: number;
  newClients: number;
  dashboardUrl: string;
}

export default function WeeklySummaryMail({
  adminName,
  appName,
  supportMail,
  weekRange,
  totalRevenue,
  revenueChange,
  totalAppointments,
  newClients,
  dashboardUrl,
}: WeeklySummaryMailProps) {
  const isPositiveGrowth = revenueChange >= 0;

  return (
    <EmailLayout
      appName={appName}
      previewText={`Your weekly summary for ${weekRange}`}
      supportMail={supportMail}
    >
      <EmailHeading>Your Weekly Summary</EmailHeading>
      <Text>Hello {adminName},</Text>
      <Text>
        Here is a quick snapshot of your business performance for{" "}
        <span className="font-semibold">{weekRange}</span>.
      </Text>

      <Section>
        <Row className="gap-3">
          <EmailMetric label="Total Revenue" value={totalRevenue} />
          <EmailMetric
            label="Growth"
            value={`${isPositiveGrowth ? "↑" : "↓"} ${Math.abs(revenueChange)}%`}
          />
        </Row>
        <Row className="gap-3">
          <EmailMetric label="Appointments" value={String(totalAppointments)} />
          <EmailMetric label="New Clients" value={String(newClients)} />
        </Row>
      </Section>

      <Section className="text-center my-6">
        <EmailButton href={dashboardUrl}>View Detailed Dashboard</EmailButton>
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

WeeklySummaryMail.PreviewProps = {
  adminName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  weekRange: "2026-06-01 to 2026-06-07",
  totalRevenue: "$1,234.56",
  revenueChange: 10,
  totalAppointments: 20,
  newClients: 5,
  dashboardUrl: "http://localhost:3000/dashboard",
} as WeeklySummaryMailProps;
