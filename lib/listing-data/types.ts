// Listing Data API types — derived from observed responses against the staging API.
// JSON is RESO Data Dictionary 2.0 (snake_case) but with flat address fields and
// lowercase standard_status values (e.g. "active", "draft", "pending").

export type StandardStatus =
  | 'active'
  | 'active_under_contract'
  | 'pending'
  | 'coming_soon'
  | 'closed'
  | 'canceled'
  | 'expired'
  | 'withdrawn'
  | 'draft';

export type PropertyType =
  | 'Residential'
  | 'ResidentialLease'
  | 'ResidentialIncome'
  | 'Land'
  | 'CommercialSale'
  | 'CommercialLease'
  | 'BusinessOpportunity'
  | 'Farm';

/**
 * One real estate listing as returned by the Listing Data API.
 * Most fields are nullable in practice; only the identity fields are guaranteed.
 */
export interface Listing {
  /** UUID primary key. */
  id: string;
  /** Friendly listing number (e.g. "UP100012"). */
  listing_id: string;
  list_agent_key: string;
  account_id: string;
  office_id?: string | null;

  standard_status: StandardStatus;
  mls_status?: string | null;

  // Flat RESO address fields
  street_number?: string | null;
  street_dir_prefix?: string | null;
  street_name?: string | null;
  street_suffix?: string | null;
  street_dir_suffix?: string | null;
  unit_number?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  county?: string | null;

  // Latitude/longitude returned as strings
  latitude?: string | null;
  longitude?: string | null;

  property_type?: PropertyType | null;
  property_sub_type?: string | null;
  ownership_type?: string | null;
  zoning?: string | null;
  new_construction?: boolean | null;

  list_price?: number | null;
  original_list_price?: number | null;
  close_price?: number | null;
  close_date?: string | null;
  tax_annual_amount?: number | null;
  tax_year?: number | null;

  bedrooms_total?: number | null;
  bathrooms_full?: number | null;
  bathrooms_half?: number | null;

  living_area?: number | null;
  lot_size_acres?: number | null;
  lot_size_sqft?: number | null;
  stories_total?: number | null;
  garage_spaces?: number | null;
  year_built?: number | null;

  pool_yn?: boolean | null;
  waterfront_yn?: boolean | null;
  view_yn?: boolean | null;
  fireplace_yn?: boolean | null;
  fireplaces_total?: number | null;

  public_remarks?: string | null;
  syndication_remarks?: string | null;
  private_remarks?: string | null;

  virtual_tour_url_unbranded?: string | null;
  virtual_tour_url_branded?: string | null;

  photo_count?: number | null;
  listing_contract_date?: string | null;
  on_market_date?: string | null;

  // Allow other RESO fields we haven't typed yet without forcing schema churn.
  [key: string]: unknown;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
}

export interface SearchCity {
  city: string;
  state: string;
  listing_count: string;
}

export interface SearchZip {
  postal_code: string;
  state: string;
  listing_count: string;
}

export interface SearchResponse {
  results: Listing[];
  cities: SearchCity[];
  zips: SearchZip[];
}

export interface ListingsQuery {
  limit?: number;
  offset?: number;
  status?: StandardStatus;
  propertyType?: PropertyType;
  subType?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  /** "west,south,east,north" lng/lat box. */
  bbox?: string;
  /** "lat,lng,miles" circular search. */
  radius?: string;
  /** Encoded polygon for arbitrary shape search. */
  polygon?: string;
}

export interface CreateListingInput {
  list_price: number;
  standard_status?: StandardStatus;
  property_type: PropertyType;
  property_sub_type?: string;
  bedrooms_total?: number;
  bathrooms_full?: number;
  bathrooms_half?: number;
  living_area?: number;
  lot_size_acres?: number;
  year_built?: number;

  street_number?: string;
  street_dir_prefix?: string;
  street_name?: string;
  street_suffix?: string;
  street_dir_suffix?: string;
  unit_number?: string;
  city: string;
  state: string;
  postal_code: string;

  public_remarks?: string;
}

export interface ListingPhoto {
  id: string;
  url: string;
  order?: number;
  caption?: string;
}

// ------- Helpers -------

/**
 * Compose the street line from RESO flat address fields, e.g.
 * "1849 Terrace Dr" or "200 N Bayshore Blvd #402".
 */
export function formatStreet(l: Listing): string {
  const parts = [
    l.street_number,
    l.street_dir_prefix,
    l.street_name,
    l.street_suffix,
    l.street_dir_suffix,
  ].filter((p) => typeof p === 'string' && p.length > 0);
  let line = parts.join(' ');
  if (l.unit_number && String(l.unit_number).length > 0) {
    line += ` #${l.unit_number}`;
  }
  return line || '—';
}

/** Compose "City, ST 33133". */
export function formatCityLine(l: Listing): string {
  const cityState = [l.city, l.state].filter(Boolean).join(', ');
  const zip = l.postal_code ? ` ${l.postal_code}` : '';
  return cityState + zip;
}

/** Total baths = full + 0.5 * half (real estate convention). */
export function bathsTotal(l: Listing): number | null {
  const full = l.bathrooms_full ?? 0;
  const half = l.bathrooms_half ?? 0;
  if (l.bathrooms_full == null && l.bathrooms_half == null) return null;
  const total = full + half * 0.5;
  return total > 0 ? total : null;
}

const STATUS_LABELS: Record<StandardStatus, string> = {
  active: 'Active',
  active_under_contract: 'Under Contract',
  pending: 'Pending',
  coming_soon: 'Coming Soon',
  closed: 'Closed',
  canceled: 'Canceled',
  expired: 'Expired',
  withdrawn: 'Withdrawn',
  draft: 'Draft',
};

export function statusLabel(s: StandardStatus | string | null | undefined): string {
  if (!s) return '—';
  return STATUS_LABELS[s as StandardStatus] ?? s;
}
