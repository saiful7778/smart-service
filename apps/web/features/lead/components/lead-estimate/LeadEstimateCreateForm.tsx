"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";

import { RoutePathType } from "@/types";

import { useLeadEstimateCreate } from "../../api/leadEstimate.api.hook";
import {
  leadEstimateFormSchema,
  LeadEstimateFormType,
} from "../../lead.schema";
import { LeadEstimateForm } from "../forms/LeadEstimateForm";

interface LeadEstimateCreateFormProps {
  leadId: string | null | undefined;
  jobId: string | null | undefined;
  redirectTo: string | null | undefined;
}

export function LeadEstimateCreateForm({
  leadId,
  jobId,
  redirectTo,
}: LeadEstimateCreateFormProps) {
  "use no memo";
  const router = useRouter();

  const form = useForm<LeadEstimateFormType>({
    resolver: zodResolver(leadEstimateFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "draft",
      discount: "",
      taxRate: "",
      validUntil: undefined,
      notes: "",
      terms: "",
      materials: [
        {
          materialId: "",
          unitPrice: "",
          quantity: "",
          totalPrice: "",
          notes: "",
        },
      ],
    },
  });

  const { mutate, isPending } = useLeadEstimateCreate<
    keyof LeadEstimateFormType
  >({
    onSuccess: () => {
      form.reset();
      if (redirectTo) {
        router.push(redirectTo as RoutePathType);
      }
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const onSubmit = (values: LeadEstimateFormType) => {
    mutate({
      ...values,
      leadId,
      jobId,
    });
  };

  const formId = "lead_estimate_create_form";

  return (
    <div>
      <LeadEstimateForm
        form={form}
        formId={formId}
        onSubmit={onSubmit}
        isLoading={isPending}
      />
      <div className="flex items-center justify-end gap-2 mt-2">
        <Button
          form={formId}
          type="reset"
          size="lg"
          variant="outline"
          onClick={() => form.reset()}
        >
          Reset
        </Button>
        <ButtonSpinner
          form={formId}
          type="submit"
          size="lg"
          isLoading={isPending}
        >
          Create
        </ButtonSpinner>
      </div>
    </div>
  );
}
