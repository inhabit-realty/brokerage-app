import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  bathsTotal,
  formatCityLine,
  formatStreet,
  listingData,
  ListingDataError,
  statusLabel,
  type Listing,
  type ListingPhoto,
} from '@/lib/listing-data';

export const dynamic = 'force-dynamic';

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

async function fetchListingAndPhotos(id: string): Promise<{
  listing: Listing | null;
  photos: ListingPhoto[];
  error: string | null;
}> {
  try {
    const client = listingData();
    const [listing, photos] = await Promise.all([
      client.getListing(id),
      client.getPhotos(id).catch(() => [] as ListingPhoto[]),
    ]);
    return { listing, photos, error: null };
  } catch (err) {
    if (err instanceof ListingDataError && err.status === 404) {
      return { listing: null, photos: [], error: null };
    }
    return {
      listing: null,
      photos: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function generateMetadata({ params }: DetailPageProps) {
  const { id } = await params;
  return { title: `Listing ${id}` };
}

function fmt(n: number | null | undefined): string {
  if (typeof n !== 'number') return '—';
  return n.toLocaleString('en-US');
}

function fmtPrice(n: number | null | undefined): string {
  if (typeof n !== 'number') return 'Price on request';
  return `$${n.toLocaleString('en-US')}`;
}

export default async function ListingDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const { listing, photos, error } = await fetchListingAndPhotos(id);

  if (error) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="font-mono text-xs text-rust mb-3">{error}</p>
        <p className="text-sm text-ash">
          The Listing Data API is unreachable. Check{' '}
          <code className="font-mono text-prussian bg-canvas-2 px-1.5 py-0.5">.env.local</code>.
        </p>
      </main>
    );
  }

  if (!listing) {
    notFound();
  }

  const heroPhoto = photos[0];
  const baths = bathsTotal(listing);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <Link href="/search" className="text-xs tracking-[0.14em] uppercase text-ash hover:text-prussian">
        &lsaquo; Back to search
      </Link>

      <div className="aspect-[16/9] my-6 relative overflow-hidden bg-gradient-to-br from-prussian-3 to-prussian">
        {heroPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroPhoto.url}
            alt={heroPhoto.caption ?? formatStreet(listing)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                'linear-gradient(rgba(196,146,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(196,146,42,0.06) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <p className="text-[10px] tracking-[0.22em] uppercase text-gold font-semibold mb-3">
            {statusLabel(listing.standard_status)}
          </p>
          <h1 className="font-display text-4xl text-prussian font-normal mb-2">
            {formatStreet(listing)}
          </h1>
          <p className="text-base text-ash mb-6 font-mono">{formatCityLine(listing)}</p>

          <p className="font-display text-5xl text-prussian font-normal font-mono mb-10">
            {fmtPrice(listing.list_price)}
          </p>

          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-mist py-6 mb-10">
            <div>
              <dt className="text-[10px] tracking-[0.18em] uppercase text-ash mb-1">Beds</dt>
              <dd className="font-mono text-prussian text-xl">{fmt(listing.bedrooms_total)}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.18em] uppercase text-ash mb-1">Baths</dt>
              <dd className="font-mono text-prussian text-xl">{fmt(baths)}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.18em] uppercase text-ash mb-1">Living Sqft</dt>
              <dd className="font-mono text-prussian text-xl">{fmt(listing.living_area)}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.18em] uppercase text-ash mb-1">Lot</dt>
              <dd className="font-mono text-prussian text-xl">
                {listing.lot_size_acres != null ? `${listing.lot_size_acres} ac` : '—'}
              </dd>
            </div>
          </dl>

          {listing.public_remarks && (
            <div className="prose prose-sm max-w-none">
              <h2 className="font-display text-xl text-prussian font-medium mb-3">About the home</h2>
              <p className="text-ash leading-relaxed whitespace-pre-line">{listing.public_remarks}</p>
            </div>
          )}

          {photos.length > 1 && (
            <div className="mt-10">
              <h2 className="font-display text-xl text-prussian font-medium mb-4">Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.slice(1).map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={p.id}
                    src={p.url}
                    alt={p.caption ?? ''}
                    className="w-full aspect-[4/3] object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-canvas-2 border border-mist p-6 sticky top-24">
            <p className="text-[10px] tracking-[0.18em] uppercase text-prussian font-semibold mb-4">
              Tour this home
            </p>
            <p className="text-sm text-ash mb-5 leading-relaxed">
              Schedule a private showing or ask a question. An inhabit. agent will respond within
              business hours.
            </p>
            <button className="w-full bg-gold text-canvas py-3 text-xs tracking-[0.14em] uppercase font-medium hover:bg-gold-light transition-colors">
              Request a showing
            </button>
            <button className="w-full mt-2 border border-prussian text-prussian py-3 text-xs tracking-[0.14em] uppercase font-medium hover:bg-prussian hover:text-white transition-colors">
              Ask a question
            </button>

            <dl className="mt-8 space-y-3 text-xs">
              <div className="flex justify-between">
                <dt className="text-ash uppercase tracking-wider">MLS</dt>
                <dd className="font-mono text-prussian">{listing.listing_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ash uppercase tracking-wider">Type</dt>
                <dd className="text-prussian">
                  {listing.property_sub_type ?? listing.property_type ?? '—'}
                </dd>
              </div>
              {listing.year_built && (
                <div className="flex justify-between">
                  <dt className="text-ash uppercase tracking-wider">Built</dt>
                  <dd className="font-mono text-prussian">{listing.year_built}</dd>
                </div>
              )}
              {listing.lot_size_sqft != null && (
                <div className="flex justify-between">
                  <dt className="text-ash uppercase tracking-wider">Lot sqft</dt>
                  <dd className="font-mono text-prussian">{fmt(listing.lot_size_sqft)}</dd>
                </div>
              )}
            </dl>

            <p className="text-[10px] text-ash mt-6 leading-relaxed">
              Listing data via Listing Data &middot; Equal Housing Opportunity.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
