"use client";

import Image from "next/image";
import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { formatDate } from "date-fns";
import { Banknote, ClipboardCheck, Pen, Trash } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";

import { UserAvatar } from "@/components/UserAvatar";

import { usePermissionCheckWithOrg } from "@/hooks/use-permission-check";
import { orpcTQClient } from "@/server/orpc.client";
import { formatCurrency } from "@/utils/formatCurrency";

import { MaterialDeleteDialog } from "./MaterialDeleteDialog";
import { MaterialUpdateDialog } from "./MaterialUpdateDialog";

export function MaterialDetails({ materialId }: { materialId: string }) {
  const [openUpdateDialog, setOpenUpdateDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);

  const isAllowUpdate = usePermissionCheckWithOrg([
    "org.material.manage",
    "org.material.update",
  ]);
  const isAllowDelete = usePermissionCheckWithOrg([
    "org.material.manage",
    "org.material.delete",
  ]);

  const {
    data: { data },
  } = useSuspenseQuery(
    orpcTQClient.material.details.queryOptions({
      input: {
        materialId,
      },
    })
  );

  const unitPrice = Number(data.unitPrice);
  const costPrice = Number(data.costPrice || "0");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        {isAllowUpdate && (
          <>
            <Button onClick={() => setOpenUpdateDialog(true)} size="lg">
              <Pen />
              <span>Update</span>
            </Button>
            <MaterialUpdateDialog
              open={openUpdateDialog}
              setOpen={setOpenUpdateDialog}
              materialId={data.id}
              initialData={{
                name: data.name,
                sku: data.sku,
                description: data.description || "",
                unit: data.unit,
                unitPrice: data.unitPrice,
                costPrice: data.costPrice || "0.00",
                stockQuantity: data.stockQuantity,
                minimumStockLevel: data.minimumStockLevel || "0",
              }}
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
            <MaterialDeleteDialog
              open={openDeleteDialog}
              setOpen={setOpenDeleteDialog}
              materialId={data.id}
            />
          </>
        )}
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {data.imageUrl && (
            <div className="overflow-hidden rounded-md aspect-16/10 relative">
              <Image
                src={data.imageUrl}
                width={500}
                height={300}
                alt={`${data.name} image`}
                className="object-cover object-center"
              />
              <Badge className="absolute top-4 left-4">In Stock</Badge>
            </div>
          )}
          <div className="p-4 bg-card rounded-md border-l-3 border-accent">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Identification (SKU)
              </h3>
              <div className="text-sm font-medium">{data.sku}</div>
            </div>
          </div>
          <div className="bg-card p-4 rounded-md border">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </h3>
            <div className="text-sm">
              {data.description || (
                <span className="text-muted-foreground italic">
                  No description added
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-card border rounded-md p-4 relative overflow-hidden space-y-4">
            <h3 className="flex items-center gap-2">
              <Banknote className="text-accent size-6" />
              <span className="font-semibold">Pricing & Finance</span>
            </h3>
            <div className="space-y-2">
              <div className="flex text-sm justify-between items-center">
                <span className="font-medium text-left">
                  Unit Selling Price
                </span>
                <span className="text-primary font-semibold text-right">
                  {`${formatCurrency(unitPrice)} / ${data.unit}`}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-sm ">
                <span className="font-medium text-left">Acquisition Cost</span>
                <span className="font-semibold text-right">{`${formatCurrency(costPrice)} / ${data.unit}`}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Profit Margin</span>
                <span className="text-green-400 font-semibold px-2 py-0.5 bg-green-400/10 rounded">
                  {`${(((unitPrice - costPrice) / unitPrice) * 100).toFixed(2)}%`}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-md p-4 space-y-4">
            <h3 className="flex items-center gap-2">
              <ClipboardCheck className="text-accent size-6" />
              <span className="font-semibold">Live Inventory Status</span>
            </h3>
            <div className="space-y-6">
              <div className="bg-secondary p-6 space-y-2 rounded-xl border text-center">
                <div className="font-medium text-sm">Current Stock Level</div>
                <div className="text-5xl font-bold">{data.stockQuantity}</div>
                <div className="text-muted-foreground text-sm">{`Minimum stock level: ${data.minimumStockLevel}`}</div>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-md p-4 space-y-4">
            <h3 className="flex items-center gap-2">
              <span className="font-semibold">Object Metadata</span>
            </h3>
            <div className="space-y-4">
              <UserAvatar
                className="size-10"
                userName={data.createdByMember.name}
                userEmail={data.createdByMember.email}
                imageUrl={data.createdByMember.image}
                userRoles={data.createdByMember.roles}
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
                    {formatDate(data.createdAt, "PP - p")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase mb-1">
                    Last Updated
                  </div>
                  <div className="text-xs font-medium">
                    {formatDate(data.updatedAt, "PP - p")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
