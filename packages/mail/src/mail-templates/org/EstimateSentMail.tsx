import { Column, Hr, Row, Text } from "react-email";

import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";
import { EmailLink } from "../../shared/EmailLink";

interface EstimateSentMailProps {
  clientName: string;
  appName: string;
  supportMail: string;
  estimateNumber: string;
  validUntil: string;
  lineItems: Array<{
    description: string;
    qty: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  approveUrl: string;
  declineUrl: string;
  estimatePdfUrl: string;
}

export default function EstimateSentMail({
  clientName,
  appName,
  supportMail,
  estimateNumber,
  validUntil,
  lineItems,
  subtotal,
  tax,
  total,
  estimatePdfUrl,
}: EstimateSentMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText={`Estimate #${estimateNumber} from ${appName}`}
      supportMail={supportMail}
    >
      <EmailHeading>Estimate #{estimateNumber}</EmailHeading>
      <Text>Hello {clientName},</Text>
      <Text>
        Please review the estimate below. This quote is valid until{" "}
        <span className="font-semibold">{validUntil}</span>.
      </Text>

      <EmailInfoCard>
        <Row>
          <Column className="font-bold text-xs text-muted-foreground w-[40%]">
            Name
          </Column>
          <Column className="font-bold text-xs text-muted-foreground w-[10%]">
            Qty
          </Column>
          <Column className="font-bold text-xs text-muted-foreground w-[30%]">
            Rate
          </Column>
          <Column className="font-bold text-xs text-muted-foreground w-[20%] text-right">
            Amount
          </Column>
        </Row>
        <Hr />
        {lineItems.map((item, idx) => (
          <Row key={idx} className="py-2">
            <Column className="text-left font-medium w-[40%]">
              {item.description}
            </Column>
            <Column className="text-left text-muted-foreground w-[10%]">
              {item.qty}
            </Column>
            <Column className="text-left text-muted-foreground w-[30%]">
              ${item.rate.toFixed(2)}
            </Column>
            <Column className="text-right font-medium w-[20%]">
              ${item.amount.toFixed(2)}
            </Column>
          </Row>
        ))}

        <Hr />

        <Row>
          <Column className="text-right text-sm text-muted-foreground w-[80%]">
            Subtotal
          </Column>
          <Column className="text-right text-sm w-[20%] font-medium">
            ${subtotal.toFixed(2)}
          </Column>
        </Row>
        <Row>
          <Column className="text-right text-sm text-muted-foreground w-[80%]">
            Tax
          </Column>
          <Column className="text-right text-sm w-[20%] font-medium">
            ${tax.toFixed(2)}
          </Column>
        </Row>

        <Hr />

        <Row className="justify-end">
          <Column className="text-right text-base w-[80%] font-bold">
            Total
          </Column>
          <Column className="text-right text-base font-bold w-[20%]">
            ${total.toFixed(2)}
          </Column>
        </Row>
      </EmailInfoCard>

      <Text className="text-sm text-center text-muted-foreground mt-2">
        You can also{" "}
        <EmailLink href={estimatePdfUrl}>
          download the estimate as a PDF
        </EmailLink>
        .
      </Text>
    </EmailLayout>
  );
}

EstimateSentMail.PreviewProps = {
  clientName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  estimateNumber: "12345",
  validUntil: "2026-06-02",
  lineItems: [
    { description: "Service 1", qty: 1, rate: 100, amount: 100 },
    { description: "Service 2", qty: 2, rate: 50, amount: 100 },
  ],
  subtotal: 200,
  tax: 20,
  total: 220,
} as EstimateSentMailProps;
