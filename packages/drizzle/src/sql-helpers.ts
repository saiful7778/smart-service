import type { AnyColumn, InferColumnsDataTypes, SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";

/**
 * Builds a COALESCE(jsonb_agg(DISTINCT jsonb_build_object(...)) FILTER (WHERE ...), '[]') SQL fragment.
 *
 * @param columns - Record of { jsonKey: column } mappings to include in the JSON object.
 * @param filterColumn - Column to check IS NOT NULL for the FILTER clause (defaults to first column).
 * @returns Typed SQL fragment returning an array of objects.
 */
export function jsonbAgg<TColumns extends Record<string, AnyColumn>>(
  columns: TColumns,
  filterColumn?: AnyColumn
): SQL<InferColumnsDataTypes<TColumns>[]> {
  const entries = Object.entries(columns);
  const filterCol = filterColumn ?? entries[0]?.[1];

  return sql<
    InferColumnsDataTypes<TColumns>[]
  >`COALESCE(jsonb_agg(DISTINCT ${jsonbBuildObject(
    columns
  )}) FILTER (WHERE ${filterCol} IS NOT NULL), '[]')`;
}

/**
 * Builds a jsonb_build_object SQL fragment with literal keys.
 */
export function jsonbBuildObject<TColumns extends Record<string, AnyColumn>>(
  columns: TColumns
): SQL<InferColumnsDataTypes<TColumns>> {
  const entries = Object.entries(columns);

  const parts: SQL[] = [];

  entries.forEach(([key, col], index) => {
    if (index > 0) {
      parts.push(sql`, `);
    }

    parts.push(sql`${sql.raw(`'${key}'`)}`);
    parts.push(sql`, `);
    parts.push(sql`${col}`);
  });

  return sql<InferColumnsDataTypes<TColumns>>`jsonb_build_object(${sql.join(
    parts,
    sql``
  )})`;
}
