import {
  PermissionLevelEnumType,
  ResourceTypeEnumType,
} from "@workspace/drizzle/zod-db-enums";

export const permissionList: Array<{
  level: PermissionLevelEnumType;
  resource: ResourceTypeEnumType;
  value: string;
  label: string;
}> = [
  {
    level: "org",
    resource: "org",
    value: "org",
    label: "Organization permissions",
  },
  {
    level: "org",
    resource: "user",
    value: "user",
    label: "User permissions",
  },
  {
    level: "org",
    resource: "material",
    value: "material",
    label: "Material permissions",
  },
  {
    level: "org",
    resource: "role",
    value: "role",
    label: "Role permissions",
  },
  {
    level: "org",
    resource: "invitation",
    value: "invitation",
    label: "Invitation permissions",
  },
  {
    level: "org",
    resource: "team",
    value: "team",
    label: "Team permissions",
  },
  {
    level: "org",
    resource: "lead",
    value: "lead",
    label: "Lead permissions",
  },
  {
    level: "org",
    resource: "job",
    value: "job",
    label: "Job permissions",
  },
  {
    level: "org",
    resource: "schedule",
    value: "schedule",
    label: "Schedule permissions",
  },
  {
    level: "org",
    resource: "invoice",
    value: "invoice",
    label: "Invoice permissions",
  },
  {
    level: "org",
    resource: "payment",
    value: "payment",
    label: "Payment permissions",
  },
  {
    level: "org",
    resource: "report",
    value: "report",
    label: "Report permissions",
  },
  {
    level: "org",
    resource: "billing",
    value: "billing",
    label: "Billing permissions",
  },
];
