import { Column, Row, Text } from "react-email";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

export interface InvoiceOverdueMailProps {
  clientName: string;
  appName: string;
  supportMail: string;
  invoiceNumber: string;
  amountDue: number;
  dueDate: string;
  daysOverdue: number;
  payUrl: string;
  invoicePdfUrl: string;
}

export default function InvoiceOverdueMail({
  clientName,
  appName,
  supportMail,
  invoiceNumber,
  amountDue,
  dueDate,
  daysOverdue,
  payUrl,
  invoicePdfUrl,
}: InvoiceOverdueMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText={`Action Required: Invoice #${invoiceNumber} is overdue`}
      supportMail={supportMail}
    >
      <EmailHeading>Overdue Invoice Action Required</EmailHeading>
      <Text>Hello {clientName},</Text>
      <Text>
        Invoice <span className="font-mono font-bold">#{invoiceNumber}</span>{" "}
        was due on {dueDate} and is now{" "}
        <span className="font-bold text-destructive">
          {daysOverdue} days overdue
        </span>
        .
      </Text>

      <EmailInfoCard>
        <Row className="items-center">
          <Column>
            <Text className="text-xs text-muted-foreground m-0">
              Amount Due
            </Text>
            <Text className="text-2xl font-bold m-0 text-destructive">
              ${amountDue.toFixed(2)}
            </Text>
          </Column>
          <Column className="text-right">
            <EmailButton href={payUrl}>Pay Now</EmailButton>
          </Column>
        </Row>
      </EmailInfoCard>

      <Text className="text-sm">
        Please remit payment as soon as possible to avoid any late fees or
        service interruptions. If you have already sent payment, please
        disregard this notice.
      </Text>

      <Text className="text-sm text-center text-muted-foreground mt-4">
        <EmailLink href={invoicePdfUrl}>View Invoice PDF</EmailLink> ·{" "}
        <EmailLink href={`mailto:${supportMail}`}>Contact Support</EmailLink>
      </Text>
    </EmailLayout>
  );
}

InvoiceOverdueMail.PreviewProps = {
  clientName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  invoiceNumber: "INV-001",
  amountDue: 100,
  dueDate: "2026-06-01",
  daysOverdue: 1,
  payUrl: "http://localhost:3000/pay",
  invoicePdfUrl: "http://localhost:3000/invoice.pdf",
} as InvoiceOverdueMailProps;
