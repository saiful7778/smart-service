"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";

import { useFileUploadState } from "@/components/FileUpload";
import { FileUploadField } from "@/components/form-fields/FileUploadField";

import { DEFAULT_AUTH_PATH } from "@/constants";
import { toSlug } from "@/utils/toSlug";

import { useOrgCreate } from "../../api/org.api.hook";
import { createOrgSchema, CreateOrgType } from "../../org.schema";

export function CreateOrgForm() {
  "use no memo";
  const {
    fileValue,
    setFileValue,
    fileError,
    setFileError,
    uploadingProgress,
    setUploadingProgress,
    uploadRef,
  } = useFileUploadState();

  const form = useForm<CreateOrgType>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      slug: "",
      address: {
        line1: "",
        city: "",
        state: "",
        zipCode: "",
      },
    },
  });

  const { mutate, isPending } = useOrgCreate<keyof CreateOrgType>({
    uploadRef,
    onProgress: setUploadingProgress,
    onSuccess: () => {
      form.reset();
      uploadRef.current?.clearFiles();
      uploadRef.current?.clearErrors();
      window.location.href = DEFAULT_AUTH_PATH;
    },
    onValidationErrors: (errors) => {
      errors.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message: message,
        });
      });
    },
    onError: () => {
      form.reset();
    },
  });

  const nameValue = useWatch({
    control: form.control,
    name: "name",
  });

  useEffect(() => {
    form.setValue("slug", toSlug(nameValue), { shouldValidate: true });
  }, [nameValue, form]);

  const handleSubmit = async (e: CreateOrgType) => {
    mutate({ ...e, logoImage: fileValue });
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <FileUploadField
          label="Organization logo"
          variant="image"
          value={fileValue}
          onChange={setFileValue}
          ref={uploadRef}
          uploadingProgress={uploadingProgress}
          disabled={isPending}
          fieldError={fileError}
          onError={setFileError}
        />
        <InputField
          control={form.control}
          name="name"
          label="Organization name"
          placeholder="name"
          requiredField
          disabled={isPending}
        />
        <InputField
          control={form.control}
          name="slug"
          type="text"
          placeholder="Slug"
          label="Org slug"
          description="Organization slug should be unique"
          disabled
        />
        <InputField
          control={form.control}
          name="email"
          type="email"
          placeholder="Email address"
          label="Email address"
          description="Organization email address"
          disabled={isPending}
        />
        <InputField
          control={form.control}
          name="phone"
          type="text"
          placeholder="Phone number"
          label="Phone number"
          description="Organization phone number"
          disabled={isPending}
        />
      </FieldGroup>
      <FieldSeparator />
      <FieldSet>
        <FieldLegend>Organization address</FieldLegend>
        <FieldDescription>
          Organization address will be used for organization billing and contact
          information
        </FieldDescription>
        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-3">
              <InputField
                control={form.control}
                name="address.line1"
                label="Street"
                placeholder="Street Address"
                type="text"
                disabled={isPending}
                requiredField
              />
            </div>
            <InputField
              control={form.control}
              name="address.city"
              label="City"
              type="text"
              placeholder="City name"
              requiredField
              disabled={isPending}
            />
            <InputField
              control={form.control}
              name="address.zipCode"
              label="Zip code"
              type="text"
              placeholder="Zip Code"
              requiredField
              disabled={isPending}
            />
            <InputField
              control={form.control}
              name="address.state"
              label="State"
              type="text"
              placeholder="State name"
              requiredField
              disabled={isPending}
            />
          </div>
        </FieldGroup>
      </FieldSet>
      <ButtonSpinner type="submit" className="w-fit" isLoading={isPending}>
        Create Organization
      </ButtonSpinner>
    </form>
  );
}
