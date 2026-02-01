import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Query wrapper utilities to eliminate duplicate query patterns
 */

/**
 * Execute a single-row query and return mapped result
 * @param query - Supabase query builder (before .single())
 * @param mapper - Optional function to transform the row data
 * @param logPrefix - Optional prefix for error logging (e.g., "[customers]")
 * @returns Mapped result or null if error/not found
 */
export async function querySingle<TRow, TResult = TRow>(
  query: any,
  mapper?: (row: TRow) => TResult,
  logPrefix?: string
): Promise<TResult | null> {
  const { data, error } = await query.single();

  if (error || !data) {
    if (error && logPrefix) {
      console.error(`${logPrefix} Query error:`, error);
    }
    return null;
  }

  return mapper ? mapper(data as TRow) : (data as TResult);
}

/**
 * Execute a multi-row query and return mapped results
 * @param query - Supabase query builder
 * @param mapper - Optional function to transform each row
 * @param logPrefix - Optional prefix for error logging
 * @returns Array of mapped results (empty array if error)
 */
export async function queryMany<TRow, TResult = TRow>(
  query: any,
  mapper?: (row: TRow) => TResult,
  logPrefix?: string
): Promise<TResult[]> {
  const { data, error } = await query;

  if (error || !data) {
    if (error && logPrefix) {
      console.error(`${logPrefix} Query error:`, error);
    }
    return [];
  }

  return mapper ? (data as TRow[]).map(mapper) : (data as TResult[]);
}

/**
 * Execute an insert operation and return mapped result
 * @param query - Supabase insert query builder (before .select())
 * @param mapper - Optional function to transform the inserted row
 * @param logPrefix - Optional prefix for error logging
 * @returns Mapped result or null if error
 */
export async function insertSingle<TRow, TResult = TRow>(
  query: any,
  mapper?: (row: TRow) => TResult,
  logPrefix?: string
): Promise<TResult | null> {
  const { data, error } = await query.select().single();

  if (error || !data) {
    if (error && logPrefix) {
      console.error(`${logPrefix} Insert error:`, error);
    }
    return null;
  }

  return mapper ? mapper(data as TRow) : (data as TResult);
}

/**
 * Execute an update/delete operation
 * @param query - Supabase update/delete query builder
 * @param logPrefix - Optional prefix for error logging
 * @returns true if successful, false if error
 */
export async function executeUpdate(
  query: any,
  logPrefix?: string
): Promise<boolean> {
  const { error } = await query;

  if (error) {
    if (logPrefix) {
      console.error(`${logPrefix} Update error:`, error);
    }
    return false;
  }

  return true;
}

/**
 * Check if a record exists by query
 * @param query - Supabase query builder
 * @param logPrefix - Optional prefix for error logging
 * @returns true if record exists, false otherwise
 */
export async function exists(
  query: any,
  logPrefix?: string
): Promise<boolean> {
  const { data, error } = await query.single();

  if (error && logPrefix) {
    console.error(`${logPrefix} Exists check error:`, error);
  }

  return !!data && !error;
}

/**
 * Count records matching a query
 * @param query - Supabase query builder with .select("*", { count: "exact", head: true })
 * @param logPrefix - Optional prefix for error logging
 * @returns Count of records, 0 if error
 */
export async function count(
  query: any,
  logPrefix?: string
): Promise<number> {
  const { count: resultCount, error } = await query;

  if (error) {
    if (logPrefix) {
      console.error(`${logPrefix} Count error:`, error);
    }
    return 0;
  }

  return resultCount || 0;
}
