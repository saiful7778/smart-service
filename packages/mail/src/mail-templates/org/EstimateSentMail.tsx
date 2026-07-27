import { Column, Hr, Row, Section, Text } from "react-email";

import { formatCurrency } from "@workspace/lib/utils";

import { EmailButton } from "../../shared/EmailButton";
import {
  EmailHeading,
  EmailInfoCard,
  EmailLayout,
} from "../../shared/EmailLayout";

export interface EstimateSentMailProps {
  clientName: string;
  appName: string;
  orgName: string;
  supportMail: string;
  estimateName: string;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
  materials: Array<{
    name: string;
    sku: string;
    qty: number;
    rate: number;
    amount: number;
  }>;
  validUntil?: string;
  estimateUrl: string;
}

export default function EstimateSentMail({
  clientName,
  appName,
  orgName,
  supportMail,
  estimateName,
  materials,
  subtotal,
  discountRate,
  discountAmount,
  taxRate,
  taxAmount,
  totalPrice,
  validUntil,
  estimateUrl,
}: EstimateSentMailProps) {
  return (
    <EmailLayout
      appName={appName}
      previewText={`'${estimateName}' estimate from ${orgName}`}
      supportMail={supportMail}
    >
      <EmailHeading>Estimate #{estimateName}</EmailHeading>
      <Section>
        <Text className="my-0">Hello {clientName},</Text>
        <Text className="my-0">
          Please review the estimate below.{" "}
          {validUntil && (
            <span>
              This quote is valid until{" "}
              <span className="font-semibold">{validUntil}</span>.
            </span>
          )}
        </Text>
      </Section>

      <EmailInfoCard>
        <Row>
          <Column className="font-bold text-xs text-muted-foreground w-[40%]">
            Material
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
        {materials.map((material, idx) => (
          <Row key={idx} className="py-2">
            <Column className="text-left font-medium w-[40%]">
              <Text className="my-0">{material.name}</Text>
              <Text className="my-0 text-muted-foreground">{material.sku}</Text>
            </Column>
            <Column className="text-left text-muted-foreground w-[10%]">
              {material.qty}
            </Column>
            <Column className="text-left text-muted-foreground w-[30%]">
              {formatCurrency(material.rate)}
            </Column>
            <Column className="text-right font-medium w-[20%]">
              {formatCurrency(material.amount)}
            </Column>
          </Row>
        ))}

        <Hr />

        <Row>
          <Column className="text-right text-sm text-muted-foreground w-[78%]">
            Subtotal
          </Column>
          <Column className="text-right text-sm w-[18%] font-medium">
            {formatCurrency(subtotal)}
          </Column>
        </Row>
        {discountRate > 0 && (
          <Row>
            <Column className="text-right text-sm text-muted-foreground w-[78%]">
              {`Discount (${discountRate}%)`}
            </Column>
            <Column className="text-right text-sm w-[18%] font-medium text-destructive">
              {`-${formatCurrency(discountAmount)}`}
            </Column>
          </Row>
        )}
        {taxRate > 0 && (
          <Row>
            <Column className="text-right text-sm text-muted-foreground w-[78%]">
              {`Tax (${taxRate}%)`}
            </Column>
            <Column className="text-right text-sm w-[18%] font-medium">
              {formatCurrency(taxAmount)}
            </Column>
          </Row>
        )}

        <Hr />

        <Row>
          <Column className="text-right text-base w-[78%] font-bold">
            Total
          </Column>
          <Column className="text-right text-base font-bold w-[18%]">
            {formatCurrency(totalPrice)}
          </Column>
        </Row>
      </EmailInfoCard>

      <Section className="text-center my-6">
        <EmailButton href={estimateUrl}>
          Accept and download Estimate
        </EmailButton>
      </Section>
    </EmailLayout>
  );
}

EstimateSentMail.PreviewProps = {
  clientName: "John Doe",
  appName: "App name",
  supportMail: "help@app-name.com",
  estimateName: "12345",
  validUntil: "2026-06-02",
  materials: [
    { name: "Service 1", sku: "service-1", qty: 1, rate: 100, amount: 100 },
    { name: "Service 2", sku: "service-1", qty: 2, rate: 50, amount: 100 },
  ],
  subtotal: 200,
  discountRate: 10,
  discountAmount: 10,
  taxRate: 20,
  taxAmount: 20,
  totalPrice: 210,
} as EstimateSentMailProps;
