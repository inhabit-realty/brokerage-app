import Link from 'next/link';
import {
  bathsTotal,
  formatCityLine,
  formatStreet,
  statusLabel,
  type Listing,
  type StandardStatus,
} from '@/lib/listing-data';

function formatPrice(n: number | null | undefined): string {
  if (typeof n !== 'number') return 'Price on request';
  return `$${n.toLocaleString('en-US')}`;
}

const STATUS_TONE: Record<StandardStatus, string> = {
  active: 'bg-prussian/85 text-canvas',
  active_under_contract: 'bg-[#fbeede] text-[#9a5a00]',
  coming_soon: 'bg-gold text-canvas',
  pending: 'bg-[#fbeede] text-[#9a5a00]',
  closed: 'bg-canvas-2 text-ash',
  canceled: 'bg-canvas-2 text-ash',
  expired: 'bg-canvas-2 text-ash',
  withdrawn: 'bg-canvas-2 text-ash',
  draft: 'bg-canvas-2 text-ash',
};

export function ListingCard({ listing }: { listing: Listing }) {
  const tone = STATUS_TONE[listing.standard_status] ?? 'bg-prussian/85 text-canvas';
  const baths = bathsTotal(listing);

  return (
    <Link
      href={`/listings/${encodeURIComponent(listing.id)}`}
      className="group block bg-white border border-mist hover:shadow-[0_4px_18px_rgba(26,48,68,0.08)] hover:-translate-y-px transition-all"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-prussian-3 to-prussian">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'linear-gradient(rgba(196,146,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(196,146,42,0.05) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <span
          className={`absolute top-3 left-3 text-[9.5px] tracking-[0.14em] uppercase px-2 py-1 font-medium ${tone}`}
        >
          {statusLabel(listing.standard_status)}
        </span>
        <div className="absolute left-3 bottom-3 font-mono text-canvas text-base font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          {formatPrice(listing.list_price)}
        </div>
        {listing.photo_count != null && listing.photo_count > 0 && (
          <span className="absolute right-3 bottom-3 font-mono text-[10px] text-canvas/80 bg-prussian-2/60 px-2 py-0.5">
            {listing.photo_count} photos
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="text-sm text-prussian font-medium leading-snug">
          {formatStreet(listing)}
        </div>
        <div className="text-xs text-ash mt-0.5">{formatCityLine(listing)}</div>
        <div className="flex gap-4 mt-3 pt-3 border-t border-canvas-2 text-xs text-onyx">
          {listing.bedrooms_total != null && (
            <div>
              <span className="block text-[10px] tracking-[0.1em] uppercase text-ash">Beds</span>
              <span className="font-mono">{listing.bedrooms_total}</span>
            </div>
          )}
          {baths != null && (
            <div>
              <span className="block text-[10px] tracking-[0.1em] uppercase text-ash">Baths</span>
              <span className="font-mono">{baths}</span>
            </div>
          )}
          {listing.living_area != null && (
            <div>
              <span className="block text-[10px] tracking-[0.1em] uppercase text-ash">Sqft</span>
              <span className="font-mono">{listing.living_area.toLocaleString('en-US')}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-3 text-[10.5px] text-ash font-mono">
          <span>MLS {listing.listing_id}</span>
          <span className="text-prussian opacity-0 group-hover:opacity-100 transition-opacity">
            View &rsaquo;
          </span>
        </div>
      </div>
    </Link>
  );
}
