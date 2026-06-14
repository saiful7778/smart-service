import "server-only";

import {
  createLoader,
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  ParserMap,
} from "nuqs/server";

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/constants";

type BaseKeys = {
  page: ReturnType<typeof parseAsIndex.withDefault>;
  limit: ReturnType<typeof parseAsInteger.withDefault>;
  search: ReturnType<typeof parseAsString.withDefault>;
  order: ReturnType<typeof parseAsStringEnum<"asc" | "desc">>;
  orderField: typeof parseAsString;
};

export function tableQuerySearchParams<KeyMap extends ParserMap>(
  additionalKeys?: KeyMap
) {
  return createLoader({
    page: parseAsIndex
      .withDefault(DEFAULT_PAGE_INDEX)
      .withOptions({ clearOnDefault: true }),

    limit: parseAsInteger
      .withDefault(DEFAULT_PAGE_SIZE)
      .withOptions({ clearOnDefault: true }),

    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),

    order: parseAsStringEnum(["asc", "desc"]).withOptions({
      clearOnDefault: true,
    }),

    orderField: parseAsString.withOptions({ clearOnDefault: true }),

    ...(additionalKeys ?? {}),
  } as unknown as BaseKeys & KeyMap);
}
