import { supabase } from '@/lib/supabase';

/**
 * Check if a user (anonymous or authenticated) has previously checked a username
 * @param fingerprint - Device fingerprint for anonymous users
 * @param customerId - Customer ID for authenticated users
 * @param username - Instagram username
 * @returns true if user has checked this username before
 */
export async function hasUserCheckedUsername(
  fingerprint: string | null,
  customerId: string | null,
  username: string
): Promise<boolean> {
  try {
    // Build query based on whether user is authenticated
    let query = supabase
      .from('user_checks')
      .select('id')
      .eq('username', username.toLowerCase())
      .limit(1);

    if (customerId) {
      // Authenticated user: check by customer_id
      query = query.eq('customer_id', customerId);
    } else if (fingerprint) {
      // Anonymous user: check by device_fingerprint
      query = query.eq('device_fingerprint', fingerprint);
    } else {
      // No identifier provided
      return false;
    }

    const { data, error } = await query;

    if (error) {
      console.error('[user-checks] Error checking if user checked username:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('[user-checks] Exception checking if user checked username:', error);
    return false;
  }
}

/**
 * Record that a user has checked a username
 * @param fingerprint - Device fingerprint for anonymous users
 * @param customerId - Customer ID for authenticated users
 * @param username - Instagram username
 */
export async function recordUserCheck(
  fingerprint: string | null,
  customerId: string | null,
  username: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_checks')
      .insert({
        device_fingerprint: fingerprint,
        customer_id: customerId,
        username: username.toLowerCase(),
      });

    if (error) {
      // Ignore unique constraint violations (user already checked this username)
      if (error.code !== '23505') {
        console.error('[user-checks] Error recording user check:', error);
      }
    }
  } catch (error) {
    console.error('[user-checks] Exception recording user check:', error);
  }
}

/**
 * Migrate all anonymous checks from a device fingerprint to a customer account
 * Called when a user authenticates, to link their previous anonymous checks to their account
 * @param fingerprint - Device fingerprint of the user
 * @param customerId - Customer ID to migrate checks to
 */
export async function migrateChecksToCustomer(
  fingerprint: string,
  customerId: string
): Promise<void> {
  try {
    // Update all checks with this fingerprint to associate with customer
    // Use ON CONFLICT to handle cases where customer already has a check for that username
    const { error } = await supabase.rpc('migrate_user_checks', {
      p_fingerprint: fingerprint,
      p_customer_id: customerId,
    });

    if (error) {
      console.error('[user-checks] Error migrating checks to customer:', error);
    } else {
      console.log(`[user-checks] Migrated checks from fingerprint ${fingerprint} to customer ${customerId}`);
    }
  } catch (error) {
    console.error('[user-checks] Exception migrating checks to customer:', error);
  }
}
