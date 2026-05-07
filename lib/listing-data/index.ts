import { createListingDataClient, type ListingDataClient } from './client';

export * from './types';
export * from './client';

let cached: ListingDataClient | null = null;

/**
 * Singleton Listing Data client for server-side use.
 * Reads LISTING_DATA_BASE_URL and LISTING_DATA_API_KEY from the environment.
 * Throws if either is missing — keep this server-only; never call from the browser.
 */
export function listingData(): ListingDataClient {
  if (cached) return cached;

  const baseUrl = process.env.LISTING_DATA_BASE_URL;
  const apiKey = process.env.LISTING_DATA_API_KEY;

  if (!baseUrl) {
    throw new Error('LISTING_DATA_BASE_URL is not set');
  }
  if (!apiKey) {
    throw new Error('LISTING_DATA_API_KEY is not set');
  }

  cached = createListingDataClient({ baseUrl, apiKey });
  return cached;
}
