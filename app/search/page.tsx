import Link from 'next/link';
import {
  listingData,
  type Listing,
  type ListingsQuery,
  type PropertyType,
} from '@/lib/listing-data';
import { ListingCard } from '../_components/listing-card';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Search Florida listings',
  description: 'Search active real estate listings across Florida via the Listing Data API.',
};

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function singleParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function toInt(v: string | string[] | undefined): number | undefined {
  const s = singleParam(v);
  if (!s) return undefined;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : undefined;
}

async function runSearch(params: Record<string, string | string[] | undefined>): Promise<{
  listings: Listing[];
  total: number;
  error: string | null;
  query: ListingsQuery;
}> {
  const query: ListingsQuery = {
    limit: toInt(params.limit) ?? 24,
    minPrice: toInt(params.minPrice),
    maxPrice: toInt(params.maxPrice),
    beds: toInt(params.beds),
    baths: toInt(params.baths),
    propertyType: singleParam(params.propertyType) as PropertyType | undefined,
    status: 'active',
  };

  try {
    const res = await listingData().listListings(query);
    return { listings: res.listings, total: res.total, error: null, query };
  } catch (err) {
    return {
      listings: [],
      total: 0,
      error: err instanceof Error ? err.message : String(err),
      query,
    };
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = singleParam(params.q) ?? '';
  const { listings, total, error, query } = await runSearch(params);

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.22em] uppercase text-gold font-semibold mb-3">
          Search &middot; Listing Data
        </p>
        <h1 className="font-display text-4xl text-prussian font-normal">
          {q ? <>Results for <em className="italic text-gold">{q}</em></> : <>All <em className="italic text-gold">active</em> listings</>}
        </h1>
      </div>

      <form className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-10 p-4 bg-white border border-mist">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="City, ZIP, address…"
          className="col-span-2 md:col-span-2 border border-mist bg-canvas px-3 py-2 text-sm font-sans outline-none focus:border-prussian"
        />
        <input
          type="number"
          name="minPrice"
          defaultValue={query.minPrice ?? ''}
          placeholder="Min price"
          className="border border-mist bg-canvas px-3 py-2 text-sm font-mono outline-none focus:border-prussian"
        />
        <input
          type="number"
          name="maxPrice"
          defaultValue={query.maxPrice ?? ''}
          placeholder="Max price"
          className="border border-mist bg-canvas px-3 py-2 text-sm font-mono outline-none focus:border-prussian"
        />
        <select
          name="beds"
          defaultValue={query.beds ?? ''}
          className="border border-mist bg-canvas px-3 py-2 text-sm font-sans outline-none focus:border-prussian"
        >
          <option value="">Any beds</option>
          <option value="2">2+ beds</option>
          <option value="3">3+ beds</option>
          <option value="4">4+ beds</option>
          <option value="5">5+ beds</option>
        </select>
        <button
          type="submit"
          className="bg-prussian text-canvas py-2 text-xs tracking-[0.14em] uppercase font-medium hover:bg-prussian-3 transition-colors"
        >
          Update
        </button>
      </form>

      {error ? (
        <div className="border border-mist bg-canvas-2 p-12 text-center">
          <p className="font-mono text-xs text-rust mb-3">{error}</p>
          <p className="text-sm text-ash leading-relaxed max-w-md mx-auto">
            Search will work once{' '}
            <code className="font-mono text-prussian bg-canvas px-1.5 py-0.5">
              LISTING_DATA_API_KEY
            </code>{' '}
            is set in <code className="font-mono text-prussian bg-canvas px-1.5 py-0.5">.env.local</code>.
          </p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-ash text-sm">No listings match those filters.</p>
          <Link
            href="/search"
            className="inline-block mt-4 text-xs tracking-[0.14em] uppercase font-medium text-gold hover:text-prussian"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <>
          <p className="text-xs text-ash mb-6">
            <span className="font-mono text-prussian">{listings.length}</span> of{' '}
            <span className="font-mono text-prussian">{total.toLocaleString('en-US')}</span> matches &middot;
            sorted by newest &middot; <span className="text-gold">via Listing Data</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
