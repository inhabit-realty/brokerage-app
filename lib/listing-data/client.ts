import type {
  CreateListingInput,
  Listing,
  ListingPhoto,
  ListingsQuery,
  ListingsResponse,
  SearchResponse,
} from './types';

export class ListingDataError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message?: string,
  ) {
    super(message ?? `Listing Data API error ${status}`);
    this.name = 'ListingDataError';
  }
}

export interface ListingDataClient {
  /** GET /listings — returns { listings, total }. */
  listListings(query?: ListingsQuery): Promise<ListingsResponse>;
  /** GET /listings/mine — listings owned by the authenticated broker. */
  myListings(): Promise<ListingsResponse>;
  /** GET /listings/{id} — single listing. */
  getListing(id: string): Promise<Listing>;
  /** GET /listings/search?q=… — autocomplete returning { results, cities, zips }. */
  searchAddresses(q: string): Promise<SearchResponse>;
  /** POST /listings — create a live listing under the authenticated broker. */
  createListing(input: CreateListingInput): Promise<Listing>;
  /** POST /listings/draft — create a draft listing. */
  createDraft(input: CreateListingInput): Promise<Listing>;
  /** PUT /listings/{id} — update a listing you own. */
  updateListing(id: string, input: Partial<CreateListingInput>): Promise<Listing>;
  /** GET /listings/{id}/photos. */
  getPhotos(id: string): Promise<ListingPhoto[]>;
}

export interface ListingDataClientOptions {
  baseUrl: string;
  apiKey: string;
  /** Override fetch — useful for tests or custom retry logic. */
  fetchImpl?: typeof fetch;
}

export function createListingDataClient(opts: ListingDataClientOptions): ListingDataClient {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const base = opts.baseUrl.replace(/\/$/, '');

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetchImpl(`${base}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new ListingDataError(res.status, body);
    }

    return res.json() as Promise<T>;
  }

  function qs(query?: Record<string, unknown>): string {
    if (!query) return '';
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    }
    const s = params.toString();
    return s ? `?${s}` : '';
  }

  return {
    listListings: (query) =>
      request<ListingsResponse>(`/listings${qs(query as Record<string, unknown> | undefined)}`),

    myListings: () => request<ListingsResponse>('/listings/mine'),

    getListing: (id) => request<Listing>(`/listings/${encodeURIComponent(id)}`),

    searchAddresses: (q) =>
      request<SearchResponse>(`/listings/search?q=${encodeURIComponent(q)}`),

    createListing: (input) =>
      request<Listing>('/listings', {
        method: 'POST',
        body: JSON.stringify(input),
      }),

    createDraft: (input) =>
      request<Listing>('/listings/draft', {
        method: 'POST',
        body: JSON.stringify(input),
      }),

    updateListing: (id, input) =>
      request<Listing>(`/listings/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),

    getPhotos: (id) =>
      request<ListingPhoto[]>(`/listings/${encodeURIComponent(id)}/photos`),
  };
}
