import Link from 'next/link';
import { listingData, type Listing } from '@/lib/listing-data';
import { ListingCard } from './_components/listing-card';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: 'inhabit. realty — Florida homes, broker-controlled data',
};

async function fetchFeatured(): Promise<{ listings: Listing[]; total: number; error: string | null }> {
  try {
    const res = await listingData().listListings({ limit: 6, status: 'active' });
    return { listings: res.listings, total: res.total, error: null };
  } catch (err) {
    return {
      listings: [],
      total: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export default async function Home() {
  const { listings, total, error } = await fetchFeatured();

  return (
    <main>
      <section className="bg-prussian text-white py-32 px-6 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(196,146,42,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(196,146,42,0.15) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-[11px] tracking-[0.22em] uppercase text-gold-light font-semibold mb-6">
            inhabit. realty &middot; florida brokerage
          </p>
          <h1 className="font-display text-6xl md:text-7xl font-normal mb-6 leading-[1.05]">
            Find the home<br />where your <em className="italic text-gold-light">life takes shape</em>.
          </h1>
          <p className="text-lg text-canvas/70 max-w-xl mx-auto mb-10 font-light leading-relaxed">
            Search Florida listings on a broker-controlled platform — cleaner data, calmer process,
            and an agent who treats it with the weight it deserves.
          </p>

          <form action="/search" className="max-w-xl mx-auto flex border border-gold-light/40 bg-prussian-2/40 backdrop-blur-sm">
            <input
              type="text"
              name="q"
              placeholder="City, ZIP, address, or MLS#…"
              className="flex-1 bg-transparent border-none px-5 py-4 text-canvas placeholder:text-canvas/40 outline-none font-sans text-base"
            />
            <button
              type="submit"
              className="bg-gold text-canvas px-8 py-4 text-xs tracking-[0.14em] uppercase font-medium hover:bg-gold-light transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase text-gold font-semibold mb-3">
              Recently active
            </p>
            <h2 className="font-display text-4xl text-prussian font-normal">
              New on the <em className="italic text-gold">market</em>.
            </h2>
            {total > 0 && (
              <p className="text-xs text-ash mt-2 font-mono">
                {total.toLocaleString('en-US')} active listings &middot; via Listing Data
              </p>
            )}
          </div>
          <Link
            href="/search"
            className="text-xs tracking-[0.14em] uppercase font-medium text-prussian border-b border-mist pb-1 hover:border-prussian transition-colors"
          >
            Browse all listings &rsaquo;
          </Link>
        </div>

        {error ? (
          <div className="border border-mist bg-canvas-2 p-12 text-center">
            <p className="font-mono text-xs text-rust mb-3">{error}</p>
            <p className="text-sm text-ash leading-relaxed max-w-md mx-auto">
              Listings will appear here once{' '}
              <code className="font-mono text-prussian bg-canvas px-1.5 py-0.5">
                LISTING_DATA_API_KEY
              </code>{' '}
              is set in <code className="font-mono text-prussian bg-canvas px-1.5 py-0.5">.env.local</code>.
            </p>
          </div>
        ) : listings.length === 0 ? (
          <p className="text-center text-ash text-sm">No active listings right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-canvas-2 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] tracking-[0.22em] uppercase text-gold font-semibold mb-3">
            For agents
          </p>
          <h2 className="font-display text-4xl text-prussian font-normal mb-6">
            Built on the <em className="italic text-gold">Real Estate Broker MCP</em>.
          </h2>
          <p className="text-base text-ash leading-relaxed mb-8">
            inhabit. is the reference brokerage for an open-source MCP server connecting Claude
            and other AI tools to a broker's CRM, listings, and transactions. Agents transact
            through natural language. Brokerages keep control of their data.
          </p>
          <a
            href="https://github.com/inhabit-realty/real-estate-broker-mcp"
            className="inline-block border border-prussian text-prussian px-8 py-3 text-xs tracking-[0.14em] uppercase font-medium hover:bg-prussian hover:text-white transition-colors"
          >
            View the MCP on GitHub &rsaquo;
          </a>
        </div>
      </section>
    </main>
  );
}
