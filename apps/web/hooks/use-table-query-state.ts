"use client";

import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
  UseQueryStatesKeysMap,
} from "nuqs";

import { DEFAULT_PAGE_INDEX } from "@/constants";

type BaseKeys = {
  page: ReturnType<typeof parseAsIndex.withDefault>;
  limit: ReturnType<typeof parseAsInteger.withDefault>;
  search: ReturnType<typeof parseAsString.withDefault>;
  order: ReturnType<typeof parseAsStringEnum<"asc" | "desc">>;
  orderField: typeof parseAsString;
};

export function useTableQueryState<KeyMap extends UseQueryStatesKeysMap>({
  defaultPage,
  defaultLimit,
  defaultSearch,
  additionalKeys,
}: {
  defaultPage: number;
  defaultLimit: number;
  defaultSearch?: string | null | undefined;
  additionalKeys?: KeyMap;
}) {
  const [filters, setFilters] = useQueryStates(
    {
      page: parseAsIndex.withDefault(defaultPage).withOptions({
        clearOnDefault: true,
      }),
      limit: parseAsInteger.withDefault(defaultLimit).withOptions({
        clearOnDefault: true,
      }),
      search: parseAsString.withDefault(defaultSearch ?? "").withOptions({
        clearOnDefault: true,
      }),
      order: parseAsStringEnum(["asc", "desc"]).withOptions({
        clearOnDefault: true,
      }),
      orderField: parseAsString.withOptions({
        clearOnDefault: true,
      }),
      ...(additionalKeys ?? {}),
    } as unknown as BaseKeys & KeyMap,
    {
      history: "push",
    }
  );

  return {
    filters,
    setFilters: (updates: Partial<Omit<typeof filters, "search">>) =>
      setFilters(updates as Parameters<typeof setFilters>[0]),
    setSearchFilter: (searchValue: string | null) =>
      setFilters({
        search: searchValue,
        page: DEFAULT_PAGE_INDEX,
      } as Parameters<typeof setFilters>[0]),
  };
}
