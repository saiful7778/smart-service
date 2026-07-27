"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";

import { RoutePathType } from "@/types";

import { useLeadEstimateUpdate } from "../../api/leadEstimate.api.hook";
import {
  leadEstimateFormSchema,
  LeadEstimateFormType,
} from "../../lead.schema";
import { LeadEstimateForm } from "../forms/LeadEstimateForm";

interface LeadEstimateUpdateFormProps {
  estimateId: string;
  initialData: LeadEstimateFormType;
  leadId: string | null | undefined;
  jobId: string | null | undefined;
  redirectTo: string | null | undefined;
}

export function LeadEstimateUpdateForm({
  estimateId,
  initialData,
  leadId,
  jobId,
  redirectTo,
}: LeadEstimateUpdateFormProps) {
  "use no memo";
  const router = useRouter();

  const form = useForm<LeadEstimateFormType>({
    resolver: zodResolver(leadEstimateFormSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData?.description || "",
      status: initialData.status,
      discountRate: initialData?.discountRate || "",
      taxRate: initialData?.taxRate || "",
      validUntil: initialData?.validUntil,
      notes: initialData?.notes || "",
      terms: initialData?.terms || "",
      materials: initialData.materials,
    },
  });

  const { mutate, isPending } = useLeadEstimateUpdate<
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
      estimateId,
      leadId,
      jobId,
    });
  };

  const formId = "lead_estimate_update_form";

  return (
    <div>
      <LeadEstimateForm
        form={form}
        formId={formId}
        onSubmit={onSubmit}
        isLoading={isPending}
      />
      <div className="flex items-center justify-end gap-2 mt-2">
        <ButtonSpinner
          form={formId}
          type="submit"
          size="lg"
          isLoading={isPending}
        >
          Update
        </ButtonSpinner>
      </div>
    </div>
  );
}
