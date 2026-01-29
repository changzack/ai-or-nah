import * as amplitude from '@amplitude/analytics-browser';

let isInitialized = false;

/**
 * Initialize Amplitude analytics
 * Call once in app startup (root layout or provider)
 */
export function initAnalytics() {
  if (isInitialized) return;

  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

  if (!apiKey) {
    console.warn('[Analytics] Amplitude API key not found');
    return;
  }

  amplitude.init(apiKey, {
    autocapture: {
      sessions: true,
    },
  });

  isInitialized = true;
  console.log('[Analytics] Amplitude initialized');
}

/**
 * Track an analytics event
 * @param eventName - Event name in Title Case (e.g., "Viewed Home", "Submitted Username")
 * @param properties - Event properties in camelCase
 */
export function track(eventName: string, properties?: Record<string, any>) {
  if (!isInitialized) {
    console.warn('[Analytics] Amplitude not initialized, skipping event:', eventName);
    return;
  }

  amplitude.track(eventName, properties);
  console.log('[Analytics] Event tracked:', eventName, properties);
}

/**
 * Identify a user
 * Call this when user authenticates
 * @param userId - User's unique identifier (email)
 * @param userProperties - User properties in camelCase
 */
export function identify(userId: string, userProperties?: Record<string, any>) {
  if (!isInitialized) {
    console.warn('[Analytics] Amplitude not initialized, skipping identify');
    return;
  }

  amplitude.setUserId(userId);

  if (userProperties) {
    const identifyObj = new amplitude.Identify();
    Object.entries(userProperties).forEach(([key, value]) => {
      identifyObj.set(key, value);
    });
    amplitude.identify(identifyObj);
  }

  console.log('[Analytics] User identified:', userId, userProperties);
}

/**
 * Reset analytics (call on sign out)
 * Clears user ID and generates new device ID
 */
export function resetAnalytics() {
  if (!isInitialized) return;

  amplitude.reset();
  console.log('[Analytics] Analytics reset');
}
