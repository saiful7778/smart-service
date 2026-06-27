"use client";

import { useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { ButtonSpinner } from "@workspace/ui/components/button-spinner";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";

import { authClient } from "@/lib/better-auth/auth-client";

import { FileUploadRef } from "@/components/FileUpload";
import { FileUploadField } from "@/components/form-fields/FileUploadField";

import { useAssignFileEntity } from "@/features/upload/api/upload.api.hook";
import { useFileUploadToAPI } from "@/features/upload/hook/useFileUploadToAPI";
import { useAuthStore } from "@/stores/zustand/auth/AuthStoreContext";

import { profileUpdateSchema, ProfileUpdateType } from "../user.schema";

export function ProfileUpdateForm() {
  const toastId = "update_profile_toast_message";
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((state) => state.user!);
  const uploadRef = useRef<FileUploadRef>(null);

  const [profileImageValue, setProfileImageValue] = useState<
    string | File | File[] | null | undefined
  >(() => user?.image);
  const [profileImageError, setProfileImageError] = useState<string | null>(
    null
  );

  const addUserData = useAuthStore((state) => state.addUserData);

  const form = useForm<ProfileUpdateType>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const { mutateAsync: uploadFileToAPI } = useFileUploadToAPI({
    onRequestStart: () => {
      setIsLoading(true);
      toast.loading("Uploading profile image...", { id: toastId });
    },
    onSuccess: () => {
      toast.success("Profile image uploaded successfully", { id: toastId });
      uploadRef.current?.clearFiles();
      uploadRef.current?.clearErrors();
    },
    onError: (errorMessage) => {
      setIsLoading(false);
      toast.error(errorMessage, { id: toastId });
    },
  });

  const assignFIleEntity = useAssignFileEntity();

  const handleSubmit = async (e: ProfileUpdateType) => {
    let profileImageUrl: string | undefined = user?.image ?? undefined;
    let profileImageKey: string | undefined = undefined;

    if (profileImageValue && profileImageValue instanceof File) {
      const { data } = await uploadFileToAPI({
        file: profileImageValue,
        entityType: "profile_image",
      });
      profileImageUrl = data?.url;
      profileImageKey = data.key;
    }

    return authClient.updateUser({
      name: e.name,
      image: profileImageUrl,
      fetchOptions: {
        onRequest: () => {
          setIsLoading(true);
          toast.loading("Updating profile...", { id: toastId });
        },
        onSuccess: () => {
          setIsLoading(false);
          if (profileImageKey) {
            assignFIleEntity.mutate({
              entityId: user.id,
              entityType: "user",
              key: profileImageKey,
            });
          }
          addUserData({
            ...user,
            image: profileImageUrl,
            name: e.name,
          });
          toast.success("Profile updated", { id: toastId });
        },
        onError: ({ error }) => {
          setIsLoading(false);
          toast.error(error.message || "Something went wrong", {
            id: toastId,
          });
        },
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <FileUploadField
          label="Profile image"
          variant="image"
          value={profileImageValue}
          onChange={setProfileImageValue}
          ref={uploadRef}
          disabled={isLoading}
          onError={setProfileImageError}
          fieldError={profileImageError}
        />
        <InputField
          control={form.control}
          name="name"
          type="text"
          label="Name"
          placeholder="Name"
          disabled={isLoading}
        />
        <InputField
          control={form.control}
          name="email"
          type="email"
          label="Email address"
          placeholder="Email Address"
          description="you can't update your email address."
          disabled
        />
        <ButtonSpinner className="w-fit" type="submit" isLoading={isLoading}>
          Submit
        </ButtonSpinner>
      </FieldGroup>
    </form>
  );
}
