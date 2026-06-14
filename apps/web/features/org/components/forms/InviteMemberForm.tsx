import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { formatEnumValue, OrgRoleEnumSchema } from "@workspace/lib/utils";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField } from "@workspace/ui/components/form-fields/InputField";
import { SelectField } from "@workspace/ui/components/form-fields/SelectField";

import { useOrgStore } from "@/stores/zustand/org/OrgStoreContext";

import { useInviteOrgMember } from "../../api/org.api.hook";
import { inviteOrgMemberSchema, InviteOrgMemberType } from "../../org.schema";

export default function InviteMemberForm({
  formId,
  onSubmittingChange,
}: {
  formId: string;
  onSubmittingChange?: (value: boolean) => void;
}) {
  "use no memo";
  const activeOrg = useOrgStore((state) => state.activeOrg!);

  const form = useForm<InviteOrgMemberType>({
    resolver: zodResolver(inviteOrgMemberSchema),
    defaultValues: {
      email: "",
      role: "STAFF",
      organizationId: activeOrg.id,
    },
  });

  const { mutate, isPending } = useInviteOrgMember<keyof InviteOrgMemberType>({
    onRequestStart: () => {
      onSubmittingChange?.(true);
    },
    onRequestEnd: () => {
      onSubmittingChange?.(false);
    },
    onSuccess: () => {
      form.reset();
    },
    onValidationErrors: (fields) => {
      fields.forEach(({ fieldName, message }) => {
        form.setError(fieldName, {
          message: message,
        });
      });
    },
  });

  const handleSubmit = (e: InviteOrgMemberType) => {
    mutate(e);
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup>
        <InputField
          control={form.control}
          name="email"
          type="email"
          placeholder="Email"
          label="Email Address"
          disabled={isPending}
        />
        <SelectField
          control={form.control}
          name="role"
          placeholder="Role"
          label="Member Role"
          disabled={isPending}
          options={OrgRoleEnumSchema.options.map((value) => ({
            value,
            label: formatEnumValue(value),
          }))}
        />
      </FieldGroup>
    </form>
  );
}
