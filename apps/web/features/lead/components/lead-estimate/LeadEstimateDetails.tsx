"use client";

import Link from "next/link";
import { useState } from "react";

import { formatDate } from "date-fns";
import {
  Banknote,
  Calendar,
  FileText,
  Info,
  Package,
  Pen,
  Send,
  Trash,
} from "lucide-react";

import { formatCurrency } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { DeleteConfirmDialog } from "@workspace/ui/components/delete-confirm-dialog";
import { Separator } from "@workspace/ui/components/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

import { UserAvatar } from "@/components/UserAvatar";

import { useLeadEstimateDelete } from "@/features/lead/api/leadEstimate.api.hook";
import { LeadEstimateDetailsContractType } from "@/features/lead/api/leadEstimate.contract";
import { SendEstimateDialog } from "@/features/lead/components/lead-estimate/SendEstimateDialog";
import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";

import { EstimateStatusBadge } from "../EstimateStatusBadge";

interface LeadEstimateDetailsProps {
  estimateData: LeadEstimateDetailsContractType["output"]["data"];
  leadId: string | null;
  jobId: string | null;
}

export function LeadEstimateDetails({
  estimateData,
  leadId,
  jobId,
}: LeadEstimateDetailsProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSendDialog, setOpenSendDialog] = useState(false);

  const isAllowUpdate = usePermissionCheckWithOrg(
    leadId
      ? ["org.lead_estimate.manage", "org.lead_estimate.update"]
      : jobId
        ? ["org.job_estimate.manage", "org.job_estimate.update"]
        : [
            "org.lead_estimate.manage",
            "org.lead_estimate.update",
            "org.job_estimate.manage",
            "org.job_estimate.update",
          ]
  );

  const isAllowDelete = usePermissionCheckWithOrg(
    leadId
      ? ["org.lead_estimate.manage", "org.lead_estimate.delete"]
      : jobId
        ? ["org.job_estimate.manage", "org.job_estimate.delete"]
        : [
            "org.lead_estimate.manage",
            "org.lead_estimate.delete",
            "org.job_estimate.manage",
            "org.job_estimate.delete",
          ]
  );

  const { mutate: deleteEstimate, isPending: isDeleting } =
    useLeadEstimateDelete({
      onSuccess: () => {
        setOpenDeleteDialog(false);
      },
    });

  const handleDelete = () => {
    deleteEstimate({
      leadId,
      jobId,
      estimateId: estimateData.id,
    });
  };

  const subtotal = Number(estimateData.subtotal || "0");
  const discountAmount = Number(estimateData.discountAmount || "0");
  const discountRate = Number(estimateData.discountRate || "0");
  const taxRate = Number(estimateData.taxRate || "0");
  const taxAmount = Number(estimateData.taxAmount || "0");
  const totalAmount = Number(estimateData.totalAmount);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        {isAllowUpdate && (
          <Button
            nativeButton={false}
            size="lg"
            render={
              <Link
                href={{
                  pathname: `/dashboard/organization/estimates/${estimateData.id}/update`,
                  query: {
                    redirectTo: `/dashboard/organization/estimates/${estimateData.id}?${leadId ? `leadId=${leadId}` : jobId ? `jobId=${jobId}` : ""}`,
                    ...(leadId ? { leadId } : jobId ? { jobId } : {}),
                  },
                }}
              />
            }
          >
            <Pen />
            <span>Update</span>
          </Button>
        )}
        {isAllowUpdate && (
          <>
            <Button onClick={() => setOpenSendDialog(true)} size="lg">
              <Send />
              <span>Send</span>
            </Button>
            <SendEstimateDialog
              estimateId={estimateData.id}
              leadId={leadId}
              jobId={jobId}
              customerEmail={estimateData.customer?.email}
              open={openSendDialog}
              onOpenChange={setOpenSendDialog}
            />
          </>
        )}
        {isAllowDelete && (
          <>
            <Button
              onClick={() => setOpenDeleteDialog(true)}
              size="lg"
              variant="destructive"
            >
              <Trash />
              <span>Delete</span>
            </Button>
            <DeleteConfirmDialog
              title="Delete Estimate"
              description="Are you sure you want to delete this estimate? This action cannot be undone."
              open={openDeleteDialog}
              onOpenChange={setOpenDeleteDialog}
              onConfirm={handleDelete}
              isLoading={isDeleting}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="size-4" />
                <span>Estimate Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm text-muted-foreground">:</span>
                <EstimateStatusBadge status={estimateData.status} />
              </div>
              {estimateData.description && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Description
                  </div>
                  <div className="text-sm">{estimateData.description}</div>
                </div>
              )}
              {estimateData.validUntil && (
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Valid Until
                  </span>
                  <span className="text-sm text-muted-foreground">:</span>
                  <span className="text-sm">
                    {formatDate(estimateData.validUntil, "PP")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {estimateData.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="size-4" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {estimateData.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {estimateData.terms && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="size-4" />
                  Terms & Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {estimateData.terms}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="size-4" />
                <span>{`Materials (${estimateData.materials.length})`}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {estimateData.materials.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No materials added to this estimate.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estimateData.materials.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {item.material.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.material.sku}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            ${formatCurrency(Number(item.material.unitPrice))}
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
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-6">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Banknote className="text-accent size-4" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {discountRate > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
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
                  <div className="flex justify-between items-center text-sm">
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
                <span className="text-sm font-semibold">Total Amount</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Object Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UserAvatar
                className="size-10"
                userName={estimateData.createdByMember.name}
                userEmail={estimateData.createdByMember.email}
                imageUrl={estimateData.createdByMember.image}
                userRoles={estimateData.createdByMember.roles}
                showDetails
                showRoleDetails
              />
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">
                    Created At
                  </div>
                  <div className="text-xs font-medium">
                    {formatDate(estimateData.createdAt, "PP - p")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">
                    Last Updated
                  </div>
                  <div className="text-xs font-medium">
                    {formatDate(estimateData.updatedAt, "PP - p")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
