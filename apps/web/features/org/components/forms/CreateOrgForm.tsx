"use client";

import { useEffect, useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";

import { FileUploadRef } from "@/components/FileUpload";
import { FileUploadField } from "@/components/form-fields/FileUploadField";

import { DEFAULT_AUTH_PATH } from "@/constants";
import { useFileUploadToAPI } from "@/features/upload/hook/useFileUploadToAPI";
import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";
import { toSlug } from "@/utils/toSlug";

import { useOrgCreate } from "../../api/org.api.hook";
import { createOrgSchema, CreateOrgType } from "../../org.schema";

export function CreateOrgForm() {
  "use no memo";
  const toastId = "create_org_toast_message";
  const uploadRef = useRef<FileUploadRef>(null);
  const [logoImageValue, setLogoImageValue] = useState<
    File | File[] | null | undefined
  >(null);
  const [logoImageErrorValue, setLogoImageErrorValue] = useState<string | null>(
    null
  );

  const user = useAuthStore((state) => state.user!);

  const form = useForm<CreateOrgType>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      userId: user.id,
      name: "",
      email: "",
      phone: "",
      slug: "",
      line1: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const uploadLogoImageToAPI = useFileUploadToAPI({
    onRequestStart: () => {
      toast.loading("Uploading logo image...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Logo image uploaded successfully", { id: toastId });
    },
    onError: (errorMessage) => {
      toast.error(errorMessage, { id: toastId });
    },
  });

  const { mutate, isPending } = useOrgCreate<keyof CreateOrgType>({
    toastId,
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

  const isLoading = isPending || uploadLogoImageToAPI.isPending;

  const nameValue = useWatch({
    control: form.control,
    name: "name",
  });

  useEffect(() => {
    form.setValue("slug", toSlug(nameValue), { shouldValidate: true });
  }, [nameValue, form]);

  const handleSubmit = async (e: CreateOrgType) => {
    let logoUrl = undefined;
    let logoKey = undefined;

    if (logoImageValue) {
      const { data } = await uploadLogoImageToAPI.mutateAsync({
        file: Array.isArray(logoImageValue)
          ? logoImageValue[0]!
          : logoImageValue,
        entityType: "org_logo",
      });
      logoUrl = data.url;
      logoKey = data.key;
    }
    mutate({
      name: e.name,
      slug: e.slug,
      userId: e.userId,
      email: e.email,
      phone: e.phone,
      logoUrl,
      logoKey,
      line1: e.line1,
      city: e.city,
      state: e.state,
      zipCode: e.zipCode,
    });
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
          value={logoImageValue}
          onChange={setLogoImageValue}
          ref={uploadRef}
          disabled={isLoading}
          onError={setLogoImageErrorValue}
          fieldError={logoImageErrorValue}
        />
        <InputField
          control={form.control}
          name="name"
          label="Organization name"
          placeholder="name"
          requiredField
          disabled={isLoading}
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
          disabled={isLoading}
        />
        <InputField
          control={form.control}
          name="phone"
          type="text"
          placeholder="Phone number"
          label="Phone number"
          description="Organization phone number"
          disabled={isLoading}
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
                name="line1"
                label="Street"
                placeholder="Street Address"
                type="text"
                disabled={isLoading}
                requiredField
              />
            </div>
            <InputField
              control={form.control}
              name="city"
              label="City"
              type="text"
              placeholder="City name"
              requiredField
              disabled={isLoading}
            />
            <InputField
              control={form.control}
              name="zipCode"
              label="Zip code"
              type="text"
              placeholder="Zip Code"
              requiredField
              disabled={isLoading}
            />
            <InputField
              control={form.control}
              name="state"
              label="State"
              type="text"
              placeholder="State name"
              requiredField
              disabled={isLoading}
            />
          </div>
        </FieldGroup>
      </FieldSet>
      <ButtonSpinner type="submit" className="w-fit" isLoading={isLoading}>
        Create Organization
      </ButtonSpinner>
    </form>
  );
}
