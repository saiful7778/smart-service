"use client";

import { useRouter } from "next/navigation";
import { Fragment, useCallback, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, DollarSign, Plus, Trash } from "lucide-react";
import { AnimatePresence, motion, Variants } from "motion/react";
import { Control, useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { JobStatusEnumSchema } from "@workspace/drizzle/zod-db-enums";
import { formatEnumValue } from "@workspace/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { DateTimeDayButton } from "@workspace/ui/components/date-time-picker";
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field";
import { CheckboxField } from "@workspace/ui/components/form-fields/CheckboxField";
import { DateTimePickerField } from "@workspace/ui/components/form-fields/DateTimePickerField";
import { InputAddonField } from "@workspace/ui/components/form-fields/InputAddonField";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";
import { Separator } from "@workspace/ui/components/separator";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNext,
  StepperPrev,
  StepperProps,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@workspace/ui/components/stepper";

import { LeadSelectorField } from "@/features/lead/components/LeadSelectorField";
import { orpcTQClient } from "@/server/orpc.client";
import { RoutePathType } from "@/types";

import { useJobCreate } from "../../api/job.api.hook";
import { ListServicingsOutput } from "../../api/job.contract";
import { jobCreateSchema, JobCreateType } from "../../job.schema";

const steps: Array<{
  value: string;
  title: string;
  description: string;
  fields: Array<keyof JobCreateType>;
}> = [
  {
    value: "details",
    title: "Details",
    description: "Enter job details",
    fields: [
      "title",
      "leadId",
      "description",
      "status",
      "expectedRevenue",
      "invoicedRevenue",
      "receivedRevenue",
      "serviceAt",
    ] as const,
  },
  {
    value: "address",
    title: "Job Address",
    description: "Enter job address",
    fields: ["addresses"] as const,
  },
];

const animationVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      ease: "easeInOut",
      duration: 0.5,
    },
  },
};

export function JobCreateForm({ leadId }: { leadId?: string | undefined }) {
  "use no memo";
  const [step, setStep] = useState<string>("details");
  const router = useRouter();

  const { data: servicings } = useSuspenseQuery(
    orpcTQClient.job.listServicings.queryOptions()
  );

  const form = useForm<JobCreateType>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      leadId,
      status: "scheduled",
      expectedRevenue: "0.00",
      invoicedRevenue: "0.00",
      receivedRevenue: "0.00",
      addresses: [
        {
          line1: "",
          city: "",
          state: "",
          zipCode: "",
          isPrimary: true,
        },
      ],
    },
  });

  const stepIndex = useMemo(
    () => steps.findIndex((s) => s.value === step),
    [step]
  );

  const { mutate, isPending } = useJobCreate<keyof JobCreateType>({
    onSuccess: () => {
      form.reset();
      router.push("/dashboard/organization/jobs" as RoutePathType);
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message,
        });
      });
    },
  });

  const onValidate: NonNullable<StepperProps["onValidate"]> = useCallback(
    async (_value, direction) => {
      if (direction === "prev") return true;

      const stepData = steps.find((s) => s.value === step);
      if (!stepData) return true;

      const isValid = await form.trigger(stepData.fields);

      if (!isValid) {
        toast("Complete all required fields to continue", {
          icon: "⚠️",
        });
      }

      return isValid;
    },
    [form, step]
  );

  const handleSubmit = (e: JobCreateType) => {
    mutate(e);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stepper value={step} onValueChange={setStep} onValidate={onValidate}>
        {/* stepper list start */}
        <motion.div
          variants={animationVariants}
          initial="hidden"
          animate="visible"
        >
          <StepperList className="md:flex-row flex-col md:items-center items-start md:gap-0 gap-2">
            {steps.map((step, idx) => (
              <StepperItem key={step.value} value={step.value}>
                <StepperTrigger>
                  <StepperIndicator>{idx + 1}</StepperIndicator>
                  <div className="flex flex-col gap-px">
                    <StepperTitle>{step.title}</StepperTitle>
                    <StepperDescription>{step.description}</StepperDescription>
                  </div>
                </StepperTrigger>
                <StepperSeparator className="mx-2" />
              </StepperItem>
            ))}
          </StepperList>
        </motion.div>
        {/* stepper list end */}

        <AnimatePresence mode="sync">
          {/* details section step start */}
          <DetailsStep
            key="details-step"
            value="details"
            isPending={isPending}
            control={form.control}
            servicings={servicings.data}
            leadId={leadId}
          />
          {/* details section step end */}

          {/* address step start */}
          <AddressStep
            key="address-step"
            value="address"
            isPending={isPending}
            control={form.control}
          />
          {/* address step end */}
        </AnimatePresence>

        <motion.div
          variants={animationVariants}
          initial="hidden"
          animate="visible"
          className="mt-4 flex items-center gap-4 text-center justify-between"
        >
          <StepperPrev
            disabled={isPending}
            render={<Button variant="secondary" />}
          >
            <ArrowLeft className="size-4" />
            <span>Previous</span>
          </StepperPrev>
          {stepIndex === steps.length - 1 ? (
            <ButtonSpinner type="submit" isLoading={isPending}>
              Create Job
            </ButtonSpinner>
          ) : (
            <StepperNext disabled={isPending} render={<Button />}>
              <span>Next</span>
              <ArrowRight className="size-4" />
            </StepperNext>
          )}
        </motion.div>
      </Stepper>
    </form>
  );
}

function DetailsStep({
  isPending,
  control,
  value,
  servicings,
  leadId,
}: {
  isPending: boolean;
  control: Control<JobCreateType>;
  value: string;
  servicings: ListServicingsOutput;
  leadId?: string | undefined;
}) {
  const statusOptions = useMemo(
    () =>
      JobStatusEnumSchema.options.map((status) => ({
        value: status,
        label: formatEnumValue(status),
      })),
    []
  );

  return (
    <StepperContent value={value}>
      <motion.div
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        key="details-step-content"
      >
        <FieldGroup>
          <InputField
            control={control}
            name="title"
            label="Title"
            placeholder="Enter title"
            requiredField
            disabled={isPending}
          />
          <LeadSelectorField
            control={control}
            name="leadId"
            label="Select Lead"
            description="Select a lead for the job"
            disabled={!!leadId || isPending}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              control={control}
              name="status"
              label="Status"
              placeholder="Select a status"
              disabled={isPending}
              requiredField
              options={statusOptions}
            />
            <DateTimePickerField
              control={control}
              name="serviceAt"
              label="Service at"
              calendarProps={{
                disabled: {
                  before: new Date(),
                },
                className: "[--cell-size:--spacing(12)]",
                components: {
                  DayButton: (props) => (
                    <DateTimeDayButton {...props} bookings={servicings} />
                  ),
                },
              }}
              showTimeSelection
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputAddonField
              control={control}
              name="expectedRevenue"
              label="Expected revenue"
              type="number"
              placeholder="Expected revenue"
              requiredField
              step="0.01"
              min="0"
              disabled={isPending}
              firstAddon={<DollarSign className="size-4" />}
            />
            <InputAddonField
              control={control}
              name="invoicedRevenue"
              label="Invoiced revenue"
              type="number"
              placeholder="Invoiced revenue"
              step="0.01"
              min="0"
              disabled={isPending}
              firstAddon={<DollarSign className="size-4" />}
            />
          </div>
          <TextareaField
            control={control}
            name="description"
            label="Description"
            placeholder="Enter description"
            rows={4}
            disabled={isPending}
          />
        </FieldGroup>
      </motion.div>
    </StepperContent>
  );
}

function AddressStep({
  isPending,
  control,
  value,
}: {
  isPending: boolean;
  control: Control<JobCreateType>;
  value: string;
}) {
  "use no memo";
  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
    rules: {
      maxLength: 3,
    },
  });

  const handleAppend = () => {
    append({
      line1: "",
      city: "",
      state: "",
      zipCode: "",
      isPrimary: false,
    });
  };

  return (
    <StepperContent value={value}>
      <motion.div
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        key="address-step-content"
        className="space-y-4"
      >
        {fields.map((field, idx) => (
          <Fragment key={field.id}>
            <FieldSet>
              <div className="flex items-center justify-between">
                <FieldLegend className="font-semibold mb-0">{`Address #${idx + 1}`}</FieldLegend>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(idx)}
                    disabled={isPending}
                  >
                    <Trash />
                  </Button>
                )}
              </div>
              <FieldGroup>
                <InputField
                  control={control}
                  name={`addresses.${idx}.line1`}
                  label="Street"
                  placeholder="Street Address"
                  type="text"
                  disabled={isPending}
                  requiredField
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    control={control}
                    name={`addresses.${idx}.city`}
                    label="City"
                    type="text"
                    placeholder="City name"
                    requiredField
                    disabled={isPending}
                  />
                  <InputField
                    control={control}
                    name={`addresses.${idx}.zipCode`}
                    label="Zip code"
                    type="text"
                    placeholder="Zip Code"
                    requiredField
                    disabled={isPending}
                  />
                  <InputField
                    control={control}
                    name={`addresses.${idx}.state`}
                    label="State"
                    type="text"
                    placeholder="State name"
                    requiredField
                    disabled={isPending}
                  />
                </div>
                <CheckboxField
                  control={control}
                  name={`addresses.${idx}.isPrimary`}
                  label="Set as primary address"
                  disabled={isPending}
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
          disabled={isPending}
        >
          <Plus />
          <span>Add Another Address</span>
        </Button>
      </motion.div>
    </StepperContent>
  );
}
