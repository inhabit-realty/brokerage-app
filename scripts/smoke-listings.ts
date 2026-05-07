// Smoke test: verifies the Listing Data API key works against the configured base URL.
// Run with: npm run smoke:listings

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createListingDataClient, ListingDataError } from '../lib/listing-data/client';
import { formatStreet, formatCityLine, statusLabel } from '../lib/listing-data/types';

function loadEnvLocal(): void {
  // Tiny .env.local loader so we don't pull dotenv in just for a smoke test.
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // No .env.local — fall through and rely on real env.
  }
}

function fmt(n: number | null | undefined): string {
  if (typeof n !== 'number') return '—';
  return n.toLocaleString('en-US');
}

async function main(): Promise<void> {
  loadEnvLocal();

  const baseUrl = process.env.LISTING_DATA_BASE_URL;
  const apiKey = process.env.LISTING_DATA_API_KEY;

  if (!baseUrl || !apiKey || apiKey === 'ld_live_replace_me') {
    console.error('✗ Set LISTING_DATA_BASE_URL and LISTING_DATA_API_KEY in .env.local before running.');
    console.error('  See .env.example for shape.');
    process.exit(1);
  }

  const client = createListingDataClient({ baseUrl, apiKey });

  console.log(`→ Hitting ${baseUrl}`);
  console.log(`→ Key prefix: ${apiKey.slice(0, 12)}…`);

  console.log('\n[1/2] GET /listings?limit=5');
  const all = await client.listListings({ limit: 5 });
  console.log(`✓ ${all.listings.length} of ${all.total} listings returned`);
  const first = all.listings[0];
  if (first) {
    console.log(
      `  First: ${formatStreet(first)}, ${formatCityLine(first)} — $${fmt(first.list_price)} (${statusLabel(first.standard_status)})`,
    );
  }

  console.log('\n[2/2] GET /listings/mine');
  const mine = await client.myListings();
  console.log(`✓ ${mine.listings.length} of ${mine.total} listings owned by your account`);
  for (const l of mine.listings.slice(0, 5)) {
    console.log(
      `  · ${l.listing_id} — ${formatStreet(l)}, ${l.city ?? '—'} — $${fmt(l.list_price)} (${statusLabel(l.standard_status)})`,
    );
  }

  console.log('\n✓ Smoke test passed.');
}

main().catch((err: unknown) => {
  if (err instanceof ListingDataError) {
    console.error(`\n✗ API returned ${err.status}`);
    console.error(JSON.stringify(err.body, null, 2));
  } else {
    console.error('\n✗ Smoke test failed:');
    console.error(err);
  }
  process.exit(1);
});
