# Inhabit Realty — Project Instructions

This folder is the **Inhabit Realty brokerage PWA** workspace. It is **separate from** the Listing Data alternative-MLS platform that lives in the sibling `Listing Data/` directory.

## What this is

- **Inhabit Realty** is a Florida real estate brokerage (broker: James Meyer, est. January 1, 2019).
- This PWA is the agent-facing portal and the public marketing surfaces.
- Inhabit is a **consumer** of the Listing Data API/MCP — not an owner. Treat them as separate projects.

## Folder layout

- `pages/` — standalone HTML prototypes (FUB API integration map, agent training program, public join page, onboarding/exit checklist).
- `brand/` — brand identity assets (`BrandGuide.jsx` — five-color system, typography, voice rules).
- `integrations/` — third-party software references: `INTEGRATIONS.md` (auth + endpoints + purpose for each), `.env` (real secrets, gitignored), `.env.example` (template, safe to commit).
- `docs/` — internal docs.

## Core integrations (full detail in `integrations/INTEGRATIONS.md`)

- **Follow Up Boss** — primary CRM. API key in `.env` as `FUB_API_KEY`. Per-agent OAuth for the PWA.
- **Lofty CRM** — secondary CRM with AI lead scoring + IDX websites.
- **Beaches MLS** — RESO Web API / VOW feed. Lead capture pattern: VOW registration → FUB `POST /events`.
- **ShowingTime** — appointment scheduling.
- **DocuSign** — e-signature.
- **SkySlope** — transaction management. Linked to FUB via `skyslope_file_id` custom field.
- **Cloud CMA** — comparative market analysis reports.

## Brand system (full detail in `brand/BrandGuide.jsx`)

- **Colors** — Prussian `#1A3044` (signature), Onyx `#1A1A1A` (primary text), Canvas `#F8F6F2` (warm base), Ochre Gold `#8A6500` (accent), White `#FFFFFF` (pure ground). Five only.
- **Typography** — Playfair Display (display/headlines/logo, italic for accent), DM Sans (body/UI), DM Mono (code/numerics).
- **Logo** — wordmark `inhabit.` always lowercase. The period is always Ochre Gold on every background.
- **Voice** — confident, precise, warm, grounded. Avoid "stunning"/"breathtaking", exclamation marks, passive voice, filler adjectives.

## Working rules

1. **Secrets never enter HTML/Markdown/JSX.** Real keys live only in `integrations/.env`. Reference them by env-var name in code (e.g., `process.env.FUB_API_KEY`).
2. **Treat `Listing Data/` as a separate project.** Cross-references are fine; mixing files is not.
3. **Brand consistency.** Any new page or component should pull from the five-color palette and two typefaces. No new colors or fonts without updating `brand/BrandGuide.jsx`.
4. **FUB is the source of truth for contacts.** Other systems (SkySlope, Cloud CMA, MLS) link back to a FUB person record via custom fields.

## Status

Early prototype phase. No build system yet — `pages/` are standalone HTML. `brand/BrandGuide.jsx` is React. When the PWA build is set up, these will be consolidated into a Vite/Next/etc. project.
