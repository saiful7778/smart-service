"use client";

import { useMemo } from "react";

import { Plus, Trash } from "lucide-react";
import { useFieldArray, UseFormReturn, useWatch } from "react-hook-form";

import { leadEstimateStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field";
import { DateTimePickerField } from "@workspace/ui/components/form-fields/DateTimePickerField";
import { InputAddonField } from "@workspace/ui/components/form-fields/InputAddonField";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";
import { Separator } from "@workspace/ui/components/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";

import { MaterialSelectorField } from "@/features/material/components/MaterialSelectorField";
import { formatCurrency } from "@/utils/formatCurrency";

import { LeadEstimateFormType } from "../../lead.schema";

interface LeadEstimateFormProps {
  form: UseFormReturn<LeadEstimateFormType>;
  formId?: string;
  onSubmit: (value: LeadEstimateFormType) => void;
  isLoading?: boolean;
}

export function LeadEstimateForm({
  form,
  formId = "lead_estimate_form",
  onSubmit,
  isLoading = false,
}: LeadEstimateFormProps) {
  "use no memo";

  const materials = useWatch({ control: form.control, name: "materials" });
  const discount = useWatch({ control: form.control, name: "discount" });
  const taxRate = useWatch({ control: form.control, name: "taxRate" });

  const subtotal = useMemo(
    () =>
      materials.reduce(
        (sum, { totalPrice }) => sum + Number(totalPrice || 0),
        0
      ),
    [materials]
  );

  const discountAmount = useMemo(() => {
    return (subtotal * Number(discount)) / 100;
  }, [subtotal, discount]);

  const taxAmount = useMemo(() => {
    const afterDiscount = subtotal - discountAmount;
    return (afterDiscount * Number(taxRate)) / 100;
  }, [subtotal, discountAmount, taxRate]);

  const totalPrice = useMemo(() => {
    return subtotal - discountAmount + taxAmount;
  }, [subtotal, discountAmount, taxAmount]);

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <FieldGroup>
        <InputField
          control={form.control}
          name="name"
          label="Estimate Name"
          placeholder="e.g. Kitchen Renovation"
          requiredField
          disabled={isLoading}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            control={form.control}
            name="status"
            label="Status"
            placeholder="Select status"
            options={leadEstimateStatusEnumSchema.options.map((value) => ({
              value,
              label: formatEnumValue(value),
            }))}
            disabled={isLoading}
          />
          <DateTimePickerField
            control={form.control}
            name="validUntil"
            label="Valid Until"
            showTimeSelection={false}
            disabled={isLoading}
          />
        </div>
        <TextareaField
          control={form.control}
          name="description"
          label="Description"
          placeholder="Brief description of the estimate..."
          disabled={isLoading}
        />
      </FieldGroup>

      <MaterialField form={form} isLoading={isLoading} />

      <FieldGroup>
        <div className="max-w-xs w-full ml-auto">
          <InputAddonField
            control={form.control}
            name="discount"
            type="number"
            min={0}
            max={100}
            step={0.01}
            firstAddon={<span>Discount</span>}
            secondAddon={<span>%</span>}
            disabled={isLoading}
          />
        </div>
        <div className="max-w-xs w-full ml-auto">
          <InputAddonField
            control={form.control}
            name="taxRate"
            type="number"
            min={0}
            max={100}
            step={0.01}
            firstAddon={<span>Tax Rate</span>}
            secondAddon={<span>%</span>}
            disabled={isLoading}
          />
        </div>
        <Separator />
        <div className="max-w-xs w-full space-y-2 ml-auto text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Sub Total</span>
            <span className="font-semibold">:</span>
            <span className="text-right grow">{`${formatCurrency(subtotal)}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Discount</span>
            <span className="font-semibold">:</span>
            <span className="text-right grow">{`${formatCurrency(discountAmount)}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Tax</span>
            <span className="font-semibold">:</span>
            <span className="text-right grow">{`${formatCurrency(taxAmount)}`}</span>
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <span className="font-semibold">Total Price</span>
            <span className="font-semibold">:</span>
            <span className="text-right grow">{`${formatCurrency(totalPrice)}`}</span>
          </div>
        </div>
      </FieldGroup>
    </form>
  );
}

interface MaterialFieldProps {
  form: UseFormReturn<LeadEstimateFormType>;
  isLoading: boolean;
}

function MaterialField({ form, isLoading = false }: MaterialFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "materials",
  });

  const handleAppend = () => {
    append({
      materialId: "",
      quantity: "",
      unitPrice: "",
      totalPrice: "",
      notes: "",
    });
  };

  return (
    <FieldSet>
      <div className="flex items-center justify-between">
        <div>
          <FieldLegend className="text-sm font-medium">Materials</FieldLegend>
          <FieldDescription>List of materials</FieldDescription>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAppend}
        >
          <Plus />
          <span>Add more</span>
        </Button>
      </div>

      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => (
            <TableRow key={field.id}>
              <TableCell>
                <MaterialSelectorField
                  control={form.control}
                  name={`materials.${index}.materialId`}
                  onSelected={(value) => {
                    if (value) {
                      const quantity = form.getValues(
                        `materials.${index}.quantity`
                      );
                      const totalPrice =
                        Number(value.unitPrice) * Number(quantity || 0);

                      form.setValue(
                        `materials.${index}.unitPrice`,
                        value.unitPrice
                      );
                      form.setValue(
                        `materials.${index}.totalPrice`,
                        totalPrice.toFixed(2)
                      );
                    } else {
                      form.setValue(`materials.${index}.unitPrice`, "");
                      form.setValue(`materials.${index}.quantity`, "");
                      form.setValue(`materials.${index}.totalPrice`, "");
                    }
                  }}
                  disabled={isLoading}
                />
              </TableCell>
              <TableCell>
                <InputField
                  name={`materials.${index}.quantity`}
                  control={form.control}
                  onValueChange={(value) => {
                    const unitPrice = form.getValues(
                      `materials.${index}.unitPrice`
                    );
                    const totalPrice = Number(value) * Number(unitPrice);

                    form.setValue(
                      `materials.${index}.totalPrice`,
                      totalPrice.toFixed(2)
                    );
                  }}
                  type="number"
                  min={0}
                  placeholder="Quantity"
                  disabled={isLoading}
                />
              </TableCell>
              <TableCell>
                <InputField
                  control={form.control}
                  name={`materials.${index}.notes`}
                  placeholder="Notes"
                  disabled={isLoading}
                />
              </TableCell>
              <TableCell>
                <InputField
                  control={form.control}
                  name={`materials.${index}.unitPrice`}
                  type="text"
                  valueModifier={(value) => formatCurrency(Number(value || 0))}
                  placeholder="Unit Price"
                  disabled={true}
                />
              </TableCell>
              <TableCell>
                <InputField
                  control={form.control}
                  name={`materials.${index}.totalPrice`}
                  type="text"
                  valueModifier={(value) => formatCurrency(Number(value || 0))}
                  placeholder="Total Price"
                  disabled={true}
                />
              </TableCell>

              <TableCell>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className=""
                  onClick={() => remove(index)}
                >
                  <Trash />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </FieldSet>
  );
}
