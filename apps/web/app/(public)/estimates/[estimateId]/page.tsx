import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { formatDate } from "date-fns";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { Building2, Calendar, Info, Package } from "lucide-react";

import {
  AddressTable,
  CustomerAddressTable,
  CustomerTable,
  JobTable,
  LeadEstimateMaterialTable,
  LeadEstimateTable,
  LeadTable,
  MaterialTable,
  OrgAddressTable,
  OrganizationTable,
} from "@workspace/drizzle/schemas";
import { LeadEstimateStatusEnumType } from "@workspace/drizzle/zod-db-enums";
import { formatCurrency, formatEnumValue } from "@workspace/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

import { db } from "@/lib/db";

import { AcceptEstimateButton } from "@/features/lead/components/lead-estimate/AcceptEstimateButton";
import { EstimatePdfDownloadButton } from "@/features/lead/components/lead-estimate/EstimatePdfDownloadButton";

export async function generateMetadata(
  props: PageProps<"/estimates/[estimateId]">
): Promise<Metadata> {
  const { estimateId } = await props.params;

  const [estimateData] = await db
    .select({ name: LeadEstimateTable.name })
    .from(LeadEstimateTable)
    .where(
      and(
        eq(LeadEstimateTable.id, estimateId),
        isNull(LeadEstimateTable.deletedAt)
      )
    )
    .limit(1);

  if (!estimateData) {
    return { title: "Estimate Not Found" };
  }

  return { title: `${estimateData.name} Estimate` };
}

const statusColorMap: Record<LeadEstimateStatusEnumType, string> = {
  draft:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  viewed:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  declined: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  expired: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default async function PublicEstimatePage(
  props: PageProps<"/estimates/[estimateId]">
) {
  const { estimateId } = await props.params;

  const [estimateData] = await db
    .select({
      id: LeadEstimateTable.id,
      orgId: LeadEstimateTable.orgId,
      leadId: LeadEstimateTable.leadId,
      jobId: LeadEstimateTable.jobId,
      name: LeadEstimateTable.name,
      description: LeadEstimateTable.description,
      status: LeadEstimateTable.status,
      subtotal: LeadEstimateTable.subtotal,
      discountRate: LeadEstimateTable.discountRate,
      discountAmount: LeadEstimateTable.discountAmount,
      taxRate: LeadEstimateTable.taxRate,
      taxAmount: LeadEstimateTable.taxAmount,
      totalAmount: LeadEstimateTable.totalAmount,
      validUntil: LeadEstimateTable.validUntil,
      notes: LeadEstimateTable.notes,
      terms: LeadEstimateTable.terms,
      createdAt: LeadEstimateTable.createdAt,
      updatedAt: LeadEstimateTable.updatedAt,
    })
    .from(LeadEstimateTable)
    .where(
      and(
        eq(LeadEstimateTable.id, estimateId),
        isNull(LeadEstimateTable.deletedAt)
      )
    )
    .limit(1);

  if (!estimateData) {
    notFound();
  }

  const [customerData] = await db
    .select({
      id: CustomerTable.id,
      name: CustomerTable.name,
      email: CustomerTable.email,
      phone: CustomerTable.phone,
      address: {
        id: AddressTable.id,
        line: AddressTable.line1,
        city: AddressTable.city,
        state: AddressTable.state,
      },
    })
    .from(CustomerTable)
    .innerJoin(
      CustomerAddressTable,
      and(
        eq(CustomerAddressTable.customerId, CustomerTable.id),
        eq(CustomerAddressTable.isPrimary, true)
      )
    )
    .innerJoin(
      AddressTable,
      eq(AddressTable.id, CustomerAddressTable.addressId)
    )
    .innerJoin(
      LeadEstimateTable,
      or(
        estimateData?.leadId
          ? eq(LeadEstimateTable.leadId, estimateData.leadId)
          : sql`false`,
        estimateData?.jobId
          ? eq(LeadEstimateTable.jobId, estimateData.jobId)
          : sql`false`
      )
    )
    .leftJoin(LeadTable, eq(LeadTable.id, LeadEstimateTable.leadId))
    .leftJoin(JobTable, eq(JobTable.id, LeadEstimateTable.jobId))
    .where(
      or(
        eq(CustomerTable.id, LeadTable.customerId),
        eq(CustomerTable.id, JobTable.customerId)
      )
    );

  const [orgData] = await db
    .select({
      id: OrganizationTable.id,
      name: OrganizationTable.name,
      slug: OrganizationTable.slug,
      email: OrganizationTable.email,
      logo: OrganizationTable.logo,
      address: {
        id: AddressTable.id,
        line: AddressTable.line1,
        city: AddressTable.city,
        state: AddressTable.state,
      },
    })
    .from(OrganizationTable)
    .innerJoin(
      OrgAddressTable,
      and(
        eq(OrgAddressTable.orgId, OrganizationTable.id),
        eq(OrgAddressTable.isPrimary, true)
      )
    )
    .innerJoin(AddressTable, eq(AddressTable.id, OrgAddressTable.addressId))
    .where(eq(OrganizationTable.id, estimateData.orgId));

  if (!orgData) {
    notFound();
  }

  const materials = await db
    .select({
      id: LeadEstimateMaterialTable.id,
      quantity: LeadEstimateMaterialTable.quantity,
      totalPrice: LeadEstimateMaterialTable.totalPrice,
      notes: LeadEstimateMaterialTable.notes,
      material: {
        id: MaterialTable.id,
        name: MaterialTable.name,
        sku: MaterialTable.sku,
        unit: MaterialTable.unit,
        unitPrice: MaterialTable.unitPrice,
      },
    })
    .from(LeadEstimateMaterialTable)
    .innerJoin(
      MaterialTable,
      eq(MaterialTable.id, LeadEstimateMaterialTable.materialId)
    )
    .where(eq(LeadEstimateMaterialTable.estimateId, estimateData.id));

  const subtotal = Number(estimateData.subtotal || "0");
  const discountRate = Number(estimateData.discountRate || "0");
  const discountAmount = Number(estimateData.discountAmount || "0");
  const taxRate = Number(estimateData.taxRate || "0");
  const taxAmount = Number(estimateData.taxAmount || "0");
  const totalAmount = Number(estimateData.totalAmount);
  const validUntil = estimateData.validUntil
    ? formatDate(estimateData.validUntil, "PP - pp")
    : null;

  const isAcceptable = ["sent", "viewed"].includes(estimateData.status);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="size-4" />
              <span className="text-sm">{orgData.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{estimateData.name}</h1>
              <Badge className={statusColorMap[estimateData.status] ?? ""}>
                {formatEnumValue(estimateData.status)}
              </Badge>
            </div>
            {customerData && (
              <>
                <p className="text-sm text-muted-foreground mt-1">
                  {`Customer: ${customerData.name}`}
                </p>
                {customerData.email !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {`Email: ${customerData.email}`}
                  </p>
                )}
              </>
            )}
          </CardContent>
          {isAcceptable && (
            <CardFooter>
              <AcceptEstimateButton estimateId={estimateData.id} />
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Info className="size-4" />
              <span>Estimate Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {estimateData.description && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Description
                </div>
                <div className="text-sm">{estimateData.description}</div>
              </div>
            )}
            {validUntil && (
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Valid Until
                </span>
                <span className="text-xs text-muted-foreground">:</span>
                <span className="text-xs">{validUntil}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Created At
                </div>
                <div className="text-xs font-medium">
                  {formatDate(estimateData.createdAt, "PP - p")}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Last Updated
                </div>
                <div className="text-xs font-medium">
                  {formatDate(estimateData.updatedAt, "PP - p")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package className="size-4" />
              <span>{`Materials (${materials.length})`}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {materials.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No materials added to this estimateData.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.material.name}
                            </div>
                            {item.material.sku && (
                              <div className="text-xs text-muted-foreground">
                                {item.material.sku}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(item.material.unitPrice))}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(item.totalPrice))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="w-[40%] ml-auto space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {discountRate > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{`Discount (${discountRate}%)`}</span>
                    <span className="font-medium text-red-500">
                      {`-${formatCurrency(discountAmount)}`}
                    </span>
                  </div>
                </>
              )}
              {taxRate > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">
                      {`Tax (${taxRate}%)`}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Total Amount</span>
                <span className="text-base font-semibold text-primary">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-end">
            <EstimatePdfDownloadButton
              estimateId={estimateData.id}
              estimateData={{
                estimateName: estimateData.name,
                estimateDate: formatDate(estimateData.createdAt, "PP - pp"),
                description: estimateData.description,
                from: {
                  name: orgData.name,
                  address: orgData.address.line,
                  city: orgData.address.city,
                  state: orgData.address.state,
                },
                billTo: customerData
                  ? {
                      name: customerData.name,
                      address: customerData.address.line,
                      city: customerData.address.city,
                      state: customerData.address.state,
                    }
                  : undefined,
                subtotal,
                discountAmount,
                discountRate,
                taxRate,
                taxAmount,
                totalAmount,
                materials: materials.map(
                  ({ material, quantity, totalPrice }) => ({
                    name: material.name,
                    sku: material.sku,
                    quantity: Number(quantity),
                    unitPrice: Number(material.unitPrice),
                    totalPrice: Number(totalPrice),
                  })
                ),
              }}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
