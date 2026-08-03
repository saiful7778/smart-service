"use client";

import { useRouter } from "next/navigation";
import { Fragment, useCallback, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Mail, Plus, Trash } from "lucide-react";
import type { Variants } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import {
  Control,
  useFieldArray,
  useForm,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import toast from "react-hot-toast";

import { Button } from "@workspace/ui/components/button";
import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@workspace/ui/components/field";
import { CheckboxField } from "@workspace/ui/components/form-fields/CheckboxField";
import { InputAddonField } from "@workspace/ui/components/form-fields/InputAddonField";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { PhoneInputField } from "@workspace/ui/components/form-fields/PhoneInputField";
import { TagsField } from "@workspace/ui/components/form-fields/TagsField";
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

import { orpcTQClient } from "@/server/orpc.client";

import { useLeadCreate } from "../api/lead.api.hook";
import { createLeadSchema, CreateLeadType } from "../lead.schema";
import { CustomerSelectorField } from "./CustomerSelectorField";

const steps: Array<{
  value: string;
  title: string;
  description: string;
  fields: Array<keyof CreateLeadType>;
}> = [
  {
    value: "customer",
    title: "Customer Details",
    description: "Enter lead basic information",
    fields: [
      "customerId",
      "customerName",
      "customerEmail",
      "customerPhone",
    ] as const,
  },
  {
    value: "address",
    title: "Lead Address",
    description: "Enter lead address",
    fields: ["addresses"] as const,
  },
  {
    value: "info",
    title: "Lead Information",
    description: "Enter lead information",
    fields: ["serviceType", "description"] as const,
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

export function LeadCreateForm() {
  "use no memo";
  const [step, setStep] = useState<string>("customer");
  const router = useRouter();

  const form = useForm<CreateLeadType>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      description: "",
      serviceType: "",
      source: "manual",
      status: "new",
      addresses: [
        {
          line1: "",
          city: "",
          state: "",
          zipCode: "",
          isPrimary: true,
        },
      ],
      categories: [],
    },
  });

  const stepIndex = useMemo(
    () => steps.findIndex((s) => s.value === step),
    [step]
  );

  const { mutate, isPending } = useLeadCreate<keyof CreateLeadType>({
    onSuccess: () => {
      form.reset();
      router.push("/dashboard/organization/leads");
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

  const handleReset = useCallback(() => {
    const stepData = steps.find((s) => s.value === step);
    if (!stepData) return true;

    stepData.fields.forEach((field) => {
      form.resetField(field);
    });
  }, [form, step]);

  const handleResetAll = useCallback(() => {
    form.reset();
    setStep("customer");
  }, [form]);

  const handleSubmit = (e: CreateLeadType) => {
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
          {/* details step start */}
          <DetailsStep
            key="customer-step"
            value="customer"
            isPending={isPending}
            control={form.control}
            setValue={form.setValue}
          />
          {/* details step end */}

          {/* address step start */}
          <AddressStep
            key="address-step"
            value="address"
            isPending={isPending}
            control={form.control}
          />
          {/* address step end */}

          {/* info step start */}
          <InfoStep
            key="info-step"
            value="info"
            isPending={isPending}
            control={form.control}
          />
          {/* info step end */}
        </AnimatePresence>

        <motion.div
          variants={animationVariants}
          initial="hidden"
          animate="visible"
          className="mt-4 flex items-center gap-4 text-center justify-between"
        >
          <StepperPrev
            disabled={isPending}
            render={<Button type="button" variant="secondary" />}
          >
            <ArrowLeft className="size-4" />
            <span>Previous</span>
          </StepperPrev>

          <div className="flex items-center gap-2">
            <Button type="reset" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="reset" variant="outline" onClick={handleResetAll}>
              Reset All
            </Button>
          </div>
          {stepIndex === steps.length - 1 ? (
            <ButtonSpinner type="submit" isLoading={isPending}>
              Create Lead
            </ButtonSpinner>
          ) : (
            <StepperNext disabled={isPending} render={<Button type="button" />}>
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
  setValue,
}: {
  isPending: boolean;
  control: Control<CreateLeadType>;
  value: string;
  setValue: UseFormSetValue<CreateLeadType>;
}) {
  const customerId = useWatch({
    control,
    name: "customerId",
  });
  return (
    <StepperContent value={value}>
      <motion.div
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        key="personal-step-content"
      >
        <FieldGroup>
          <CustomerSelectorField
            control={control}
            name="customerId"
            label="Customer"
            onValueChange={(value) => {
              if (value) {
                setValue("customerName", value.name);
                if (value.email) {
                  setValue("customerEmail", value.email);
                }
                if (value.phone) {
                  setValue("customerPhone", value.phone);
                }
              } else {
                setValue("customerName", "");
                setValue("customerEmail", "");
                setValue("customerPhone", "");
              }
            }}
            disabled={isPending}
          />
          <div className="flex items-center gap-2">
            <Separator className="shrink" />
            <span className="text-muted-foreground text-xs">OR</span>
            <Separator className="shrink" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <InputField
                control={control}
                name="customerName"
                label="Customer name"
                type="text"
                placeholder="Name"
                disabled={!!customerId || isPending}
              />
            </div>
            <InputAddonField
              control={control}
              name="customerEmail"
              label="Email address"
              type="email"
              placeholder="Email address"
              disabled={!!customerId || isPending}
              firstAddon={<Mail className="size-4" />}
            />
            <PhoneInputField
              control={control}
              name="customerPhone"
              label="Phone number"
              placeholder="Phone number"
              defaultCountry="US"
              disabled={!!customerId || isPending}
            />
          </div>
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
  control: Control<CreateLeadType>;
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
          onClick={() =>
            append({
              line1: "",
              city: "",
              state: "",
              zipCode: "",
              isPrimary: fields.length === 0,
            })
          }
          disabled={isPending}
        >
          <Plus />
          <span>Add Another Address</span>
        </Button>
      </motion.div>
    </StepperContent>
  );
}

function InfoStep({
  isPending,
  control,
  value,
}: {
  isPending: boolean;
  control: Control<CreateLeadType>;
  value: string;
}) {
  "use no memo";
  const { data: leadCategoriesOptions } = useSuspenseQuery(
    orpcTQClient.lead.category.list.queryOptions({
      select: ({ data }) =>
        data.map((category) => ({
          value: category.id,
          label: category.name,
        })),
    })
  );

  return (
    <StepperContent value={value}>
      <motion.div
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        key="info-step-content"
      >
        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TagsField
              control={control}
              name="categories"
              label="Category"
              placeholder="Select categories"
              options={leadCategoriesOptions}
              disabled={isPending}
            />
            <InputField
              control={control}
              name="serviceType"
              label="Service type"
              type="text"
              disabled={isPending}
            />
          </div>
          <TextareaField
            control={control}
            name="description"
            label="Description"
            placeholder="Description"
            className="max-h-20"
            disabled={isPending}
          />
        </FieldGroup>
      </motion.div>
    </StepperContent>
  );
}
