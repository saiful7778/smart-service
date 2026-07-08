"use client";

import { Fragment, useCallback } from "react";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";

import { Button } from "@workspace/ui/components/button";
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field";
import { CheckboxField } from "@workspace/ui/components/form-fields/CheckboxField";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { Separator } from "@workspace/ui/components/separator";

import { LeadAddressesType } from "../../lead.schema";

interface AddressesFormProps {
  form: UseFormReturn<LeadAddressesType>;
  onSubmit: (e: LeadAddressesType) => void;
  isSubmitting: boolean;
  formId?: string;
}

export function AddressesForm({
  formId = "address_form",
  onSubmit,
  isSubmitting,
  form,
}: AddressesFormProps) {
  "use no memo";

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "addresses",
    rules: {
      maxLength: 3,
    },
  });

  const handleAppend = useCallback(() => {
    append({
      line1: "",
      city: "",
      state: "",
      zipCode: "",
      isPrimary: fields.length === 0,
    });
  }, [append, fields.length]);

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        {fields.map((field, idx) => (
          <Fragment key={field.id}>
            <FieldSet>
              <div className="flex justify-between items-center">
                <FieldLegend className="font-semibold mb-0">{`Address #${idx + 1}`}</FieldLegend>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(idx)}
                    disabled={isSubmitting}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>

              <FieldGroup>
                <InputField
                  control={form.control}
                  name={`addresses.${idx}.line1`}
                  label="Street Address"
                  placeholder="Street address"
                  requiredField
                  disabled={isSubmitting}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    control={form.control}
                    name={`addresses.${idx}.city`}
                    label="City"
                    placeholder="City"
                    requiredField
                    disabled={isSubmitting}
                  />
                  <InputField
                    control={form.control}
                    name={`addresses.${idx}.state`}
                    label="State"
                    placeholder="State"
                    requiredField
                    disabled={isSubmitting}
                  />
                  <InputField
                    control={form.control}
                    name={`addresses.${idx}.zipCode`}
                    label="Zip Code"
                    placeholder="Zip Code"
                    requiredField
                    disabled={isSubmitting}
                  />
                </div>

                <CheckboxField
                  control={form.control}
                  name={`addresses.${idx}.isPrimary`}
                  label="Set as primary address"
                  disabled={isSubmitting}
                />
              </FieldGroup>
            </FieldSet>

            {idx < fields.length - 1 && <Separator />}
          </Fragment>
        ))}
        <Button
          type="button"
          variant="secondary"
          className="w-fit"
          onClick={handleAppend}
          disabled={isSubmitting}
        >
          <Plus />
          <span>Add Another Address</span>
        </Button>
      </FieldGroup>
    </form>
  );
}
