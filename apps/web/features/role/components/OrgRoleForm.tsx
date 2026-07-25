"use client";

import { useQuery } from "@tanstack/react-query";
import { Controller, UseFormReturn } from "react-hook-form";

import { formatEnumValue } from "@workspace/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { TextareaField } from "@workspace/ui/components/form-fields/TextareaField";

import { QueryStateBoundary } from "@/lib/tanstack/query/QueryStateBoundary";

import { orpcTQClient } from "@/server/orpc.client";

import { ListOrgPermissionContractType } from "../api/role.contract";
import { permissionList } from "../permission.constants";
import { CreateOrUpdateOrgRoleType } from "../role.schema";

export function OrgRoleForm({
  formId,
  form,
  onSubmit,
  isSubmitting,
}: {
  formId: string;
  form: UseFormReturn<CreateOrUpdateOrgRoleType>;
  onSubmit: (e: CreateOrUpdateOrgRoleType) => void;
  isSubmitting: boolean;
}) {
  const { data, isLoading, isError, error } = useQuery(
    orpcTQClient.role.listOrgPermission.queryOptions()
  );

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <InputField
          control={form.control}
          name="roleName"
          label="Role name"
          requiredField
          disabled={isSubmitting}
        />
        <TextareaField
          control={form.control}
          name="description"
          label="Description"
          disabled={isSubmitting}
        />
        <QueryStateBoundary
          isLoading={isLoading}
          isError={isError}
          error={error}
          data={data?.data}
          isEmpty={(d) => d.length === 0}
        >
          {(permissions) => (
            <Controller
              control={form.control}
              name="permissions"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <SelectPermissions
                    permissions={permissions}
                    selectedPermissions={field.value}
                    onSelectPermission={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
        </QueryStateBoundary>
      </FieldGroup>
    </form>
  );
}

function SelectPermissions({
  permissions,
  selectedPermissions,
  onSelectPermission,
}: {
  permissions: ListOrgPermissionContractType["output"]["data"];
  selectedPermissions: Array<string>;
  onSelectPermission: (id: string[]) => void;
}) {
  "use no memo";
  const allPermission = permissions.map((permission) => ({
    ...permission,
    isSelected: selectedPermissions.includes(permission.id),
  }));

  const handleSelect = (id: string) => {
    const index = selectedPermissions.findIndex((item) => item === id);

    if (index !== -1) {
      onSelectPermission([
        ...selectedPermissions.slice(0, index),
        ...selectedPermissions.slice(index + 1),
      ]);
    } else {
      onSelectPermission([...selectedPermissions, id]);
    }
  };

  return (
    <div className="space-y-2">
      <h5 className="text-lg font-medium">All Permissions</h5>
      <Accordion
        defaultValue={["org"]}
        className="max-h-[50vh] overflow-y-scroll scrollbar-none"
      >
        {permissionList.map((perm) => (
          <AccordionItem key={perm.value} value={perm.value}>
            <AccordionTrigger>{perm.label}</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 items-center">
                {allPermission
                  .filter(
                    (p) =>
                      p.level === perm.level && p.resource === perm.resource
                  )
                  .map((perm) => (
                    <SelectPermissionItem
                      key={perm.id}
                      checked={perm.isSelected}
                      description={perm.description}
                      onCheckedChange={() => handleSelect(perm.id)}
                      name={`${formatEnumValue(perm.resource)} - ${perm.action}`}
                    />
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function SelectPermissionItem({
  name,
  description,
  checked,
  onCheckedChange,
}: {
  name: string;
  description: string | null;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <FieldLabel className="inline-flex w-fit!">
      <Field className="inline-flex w-fit p-2!" orientation="horizontal">
        <Checkbox
          checked={checked}
          className="rounded"
          onCheckedChange={onCheckedChange}
          id={name}
          name={name}
        />
        <FieldContent>
          <FieldTitle className="capitalize">{name}</FieldTitle>
          {description && <FieldDescription>{description}</FieldDescription>}
        </FieldContent>
      </Field>
    </FieldLabel>
  );
}
