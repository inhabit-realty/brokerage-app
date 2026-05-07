# brokerage-app

> Reference brokerage application for the open-source **[Real Estate Broker MCP](https://github.com/inhabit-realty/real-estate-broker-mcp)**. Powers [inhabit.app](https://inhabit.app).

A Next.js PWA that serves as both the public consumer search portal and the gated agent intranet for [inhabit. realty](https://inhabit.app), a Florida real estate brokerage. Designed as the canonical reference implementation for any brokerage that wants to wire Claude (or another MCP-compatible agent) into their day-to-day operations.

It consumes:

- **Real Estate Broker MCP** ([sibling repo](https://github.com/inhabit-realty/real-estate-broker-mcp)) — natural-language access to FUB, Beaches MLS, ShowingTime, DocuSign, SkySlope, Cloud CMA, and Lofty. Agents transact via Claude.
- **[Listing Data API](https://app.listingdata.com)** — a broker-controlled alternative-MLS that backs every listing, search, and "my listings" view in this app.
- **Follow Up Boss** — primary CRM, integrated via per-agent OAuth (in progress).

## Stack

- [Next.js 15](https://nextjs.org) with App Router and React Server Components
- TypeScript (strict)
- [Tailwind CSS 4](https://tailwindcss.com)
- [next-auth](https://authjs.dev) for FUB OAuth (in progress)
- Deploys on [Vercel](https://vercel.com)

## Quickstart

```sh
git clone https://github.com/inhabit-realty/brokerage-app
cd brokerage-app
npm install
cp .env.example .env.local
# Edit .env.local — set LISTING_DATA_API_KEY=ld_live_…
npm run smoke:listings   # verify API connectivity
npm run dev              # http://localhost:3000
```

To get a Listing Data API key, sign in at [app.listingdata.com](https://app.listingdata.com) as a broker, open **API Key** in the sidebar, and click **Generate Key**. The raw `ld_live_…` value is shown only once — copy it directly into `.env.local`.

## Project layout

```
app/                  Next.js App Router routes (pages live here)
  page.tsx            Public home + featured listings
  search/             Public search portal
  listings/[id]/      Public listing detail
  _components/        Shared UI components
lib/listing-data/     Typed client for the Listing Data API
scripts/              Smoke tests and one-off scripts
references/           Original HTML prototypes (visual reference)
brand/                inhabit. brand system (BrandGuide.jsx)
integrations/         Third-party integration reference docs
docs/                 Internal docs
```

## Brand

Five colors, three typefaces, a deliberately restrained voice. See [`brand/BrandGuide.jsx`](./brand/BrandGuide.jsx) for the full system. Don't introduce new colors or fonts without updating the guide.

## Contributing

Issues and PRs welcome. Before opening a PR, please:

1. Run `npm run typecheck` — the project is strict-mode TypeScript.
2. Keep changes scoped — bug fixes, new features, and refactors should ideally be separate PRs.
3. Match existing patterns; ask in an issue first for anything that crosses the public/agent boundary or touches the Listing Data client.

## License

**AGPLv3** — see [LICENSE](./LICENSE).

This means: if you fork this code and run a modified version (publicly or as a hosted service), you must publish your modifications under the same license. We chose AGPLv3 because the brokerage app is a SaaS-style product, and AGPL is the only OSS license that prevents a fork-and-host scenario from happening silently.

If your organization can't accept AGPLv3 dependencies and you'd like to use this code commercially, contact [hello@inhabitrealty.com](mailto:hello@inhabitrealty.com) about a commercial license.

Copyright © 2026 inhabit. realty
