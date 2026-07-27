import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { formatCurrency } from "@workspace/lib/utils";

import { colors } from "../colors";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.foreground,
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  estimateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.foreground,
    marginBottom: 4,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionHalf: {
    width: "50%",
  },
  sectionForty: {
    width: "40%",
  },
  sectionFortyFive: {
    width: "45%",
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.foreground,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  boldText: {
    fontSize: 10,
    marginBottom: 2,
    color: colors.foreground,
    fontWeight: "bold",
  },
  regularText: {
    fontSize: 10,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.foreground,
  },
  detailSeparator: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.foreground,
  },
  detailValue: {
    fontSize: 10,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.muted,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderMaterial: {
    flex: 3,
    fontWeight: "bold",
    fontSize: 10,
    color: colors.foreground,
  },
  tableHeaderQty: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 10,
    color: colors.foreground,
    textAlign: "right",
  },
  tableHeaderRate: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 10,
    color: colors.foreground,
    textAlign: "right",
  },
  tableHeaderAmount: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 10,
    color: colors.foreground,
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableCellMaterial: {
    flex: 3,
  },
  tableCellQty: {
    flex: 1,
    textAlign: "right",
  },
  tableCellRate: {
    flex: 1,
    textAlign: "right",
  },
  tableCellAmount: {
    flex: 1,
    textAlign: "right",
  },
  totals: {
    marginTop: 24,
    alignSelf: "flex-end",
    width: "50%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    color: colors.mutedForeground,
    fontSize: 10,
  },
  totalValue: {
    fontWeight: "500",
    fontSize: 10,
    color: colors.foreground,
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.foreground,
    paddingTop: 8,
    marginTop: 8,
  },
  totalFinalLabel: {
    fontWeight: "bold",
    fontSize: 12,
    color: colors.foreground,
  },
  totalFinalValue: {
    fontWeight: "bold",
    fontSize: 12,
    color: colors.foreground,
  },
  description: {
    marginBottom: 24,
  },
  descriptionLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.foreground,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 10,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingBottom: 10,
  },
  footerBottomText: {
    textAlign: "center",
    fontSize: 10,
    width: "60%",
    marginHorizontal: "auto",
    color: colors.mutedForeground,
  },
});

interface EstimateData {
  estimateName: string;
  estimateDate: string;
  validUntilDate?: string | null | undefined;
  description?: string | null | undefined;
  from: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  billTo?:
    | {
        name: string;
        address: string;
        city: string;
        state: string;
      }
    | undefined;
  materials: {
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discountAmount: number;
  discountRate: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

export function EstimatePdf({ estimateData }: { estimateData: EstimateData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.estimateTitle}>
                {`Estimate #${estimateData.estimateName}`}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, styles.sectionRow]}>
          <View style={styles.sectionHalf}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.boldText}>{estimateData.from.name}</Text>
            <Text style={styles.regularText}>{estimateData.from.address}</Text>
            <Text style={styles.regularText}>
              {`${estimateData.from.city}, ${estimateData.from.state}`}
            </Text>
          </View>
          <View style={styles.sectionForty}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimate Date</Text>
              <Text style={styles.detailSeparator}>:</Text>
              <Text style={styles.detailValue}>
                {estimateData.estimateDate}
              </Text>
            </View>
            {estimateData.validUntilDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Valid Until</Text>
                <Text style={styles.detailSeparator}>:</Text>
                <Text style={styles.detailValue}>
                  {estimateData.validUntilDate}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.section, styles.sectionRow]}>
          {estimateData?.billTo && (
            <View style={styles.sectionFortyFive}>
              <Text style={styles.label}>Bill to</Text>
              <Text style={styles.regularText}>{estimateData.billTo.name}</Text>
              <Text style={styles.regularText}>
                {estimateData.billTo.address}
              </Text>
              <Text style={styles.regularText}>{estimateData.billTo.city}</Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderMaterial}>Material</Text>
            <Text style={styles.tableHeaderQty}>QTY</Text>
            <Text style={styles.tableHeaderRate}>Rate</Text>
            <Text style={styles.tableHeaderAmount}>Amount</Text>
          </View>

          {estimateData.materials.map((material, index) => (
            <View
              key={index}
              style={{
                ...styles.tableRow,
                ...(index < estimateData.materials.length - 1 &&
                  styles.tableRowBorder),
              }}
            >
              <View style={styles.tableCellMaterial}>
                <Text>{material.name}</Text>
                <Text>{material.sku}</Text>
              </View>
              <Text style={styles.tableCellQty}>{material.quantity}</Text>
              <Text style={styles.tableCellRate}>
                {formatCurrency(material.unitPrice)}
              </Text>
              <Text style={styles.tableCellAmount}>
                {formatCurrency(material.totalPrice)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(estimateData.subtotal)}
            </Text>
          </View>
          {estimateData.discountRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {`Discount (${estimateData.discountRate}%)`}
              </Text>
              <Text style={styles.totalValue}>
                {`-${formatCurrency(estimateData.discountAmount)}`}
              </Text>
            </View>
          )}
          {estimateData.taxRate > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {`Tax (${estimateData.taxRate}%)`}
              </Text>
              <Text style={styles.totalValue}>
                {formatCurrency(estimateData.taxAmount)}
              </Text>
            </View>
          )}
          <View style={styles.totalFinal}>
            <Text style={styles.totalFinalLabel}>Total</Text>
            <Text style={styles.totalFinalValue}>
              {formatCurrency(estimateData.totalAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionLabel}>Description</Text>
          <Text style={styles.descriptionText}>{estimateData.description}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerBottom}>
            <Text style={styles.footerBottomText}>
              This is a computer-generated estimate and requires no signature.
              All prices are in USD and subject to applicable taxes.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
