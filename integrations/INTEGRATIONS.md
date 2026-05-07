# Inhabit Realty — Software Integrations

Inventory of every external system the Inhabit brokerage PWA touches. Each entry: purpose, auth method, base URL or docs, secret-store key in `.env`.

---

## Follow Up Boss (CRM)

**Purpose** — primary CRM for contacts, lead pipeline, automations, calls, texts, email marketing. The agent portal is a thin layer on top of FUB.

- **Base URL** — `https://api.followupboss.com/v1`
- **Auth** — HTTP Basic (API key as username, blank password) for server-side; OAuth 2.0 for per-agent portal sessions.
- **Required headers** — `X-System: InhabitPortal`, `X-System-Key: <registered>`, plus `Authorization: Basic ...` or `Bearer ...`.
- **Webhooks** — register at `POST /v1/webhooks`. Endpoint must return 2xx within 5s. Validate `FUB-Signature` HMAC.
- **Rate limit** — 500 req/min/key. 429 + `Retry-After` on overflow.
- **Secrets** — `FUB_API_KEY`, `FUB_X_SYSTEM`, `FUB_X_SYSTEM_KEY`, `FUB_OAUTH_CLIENT_ID`, `FUB_OAUTH_CLIENT_SECRET`, `FUB_OAUTH_REDIRECT_URI`.
- **Reference** — `pages/fub-api-integration.html`.

---

## Lofty CRM (formerly Chime)

**Purpose** — agent-facing CRM with AI lead scoring, IDX websites, behavioral tracking. Used in parallel with FUB; some agents prefer Lofty as their daily driver.

- **Base URL** — `https://api.lofty.com/` (per Lofty developer portal).
- **Auth** — API key per tenant.
- **Secrets** — `LOFTY_API_KEY`, `LOFTY_TENANT_ID`.

---

## Beaches MLS (RESO Web API / VOW)

**Purpose** — listing data feed. Buyer registrations on the VOW search portal POST a lead event into FUB.

- **Auth** — OAuth 2.0 client credentials (per RESO Web API spec).
- **Lead capture pattern** — registration → `POST /v1/events` to FUB with `source: "Beaches MLS VOW"`, `type: "Registration"`, person + propertyId.
- **Secrets** — `BEACHES_MLS_CLIENT_ID`, `BEACHES_MLS_CLIENT_SECRET`, `BEACHES_MLS_BASE_URL`.

---

## ShowingTime

**Purpose** — appointment scheduling for property showings.

- **Auth** — API key (per ShowingTime broker portal).
- **Secrets** — `SHOWINGTIME_API_KEY`.

---

## DocuSign

**Purpose** — e-signature for offers, contracts, ICAs, disclosures.

- **Auth** — JWT grant (preferred) or OAuth 2.0 auth code grant.
- **Secrets** — `DOCUSIGN_INTEGRATOR_KEY`, `DOCUSIGN_USER_ID`, `DOCUSIGN_ACCOUNT_ID`, `DOCUSIGN_PRIVATE_KEY` (RSA private key for JWT).

---

## SkySlope

**Purpose** — transaction management. When a FUB contact moves to "Under Contract" stage, a SkySlope transaction file is auto-created and the SkySlope GUID is written back into a FUB custom field for cross-platform linking.

- **Auth** — API key.
- **Secrets** — `SKYSLOPE_API_KEY`.

---

## Cloud CMA

**Purpose** — comparative market analysis reports for buyer/seller consultations.

- **Auth** — API key.
- **Secrets** — `CLOUD_CMA_API_KEY`.

---

## Cross-Platform Linking Strategy

Custom fields on the FUB contact record link all four platforms together:

- `skyslope_file_id` — set when transaction is created.
- `mls_saved_search` — set on VOW lead capture.
- `vow_session_token` — for re-auth on portal.
- `cloud_cma_report_url` — set when report is generated.

Update these via `PUT /v1/people/:id` with the `customFields` payload after the corresponding event in the linked system.

---

## Secret storage

All API keys live in `integrations/.env`. The file is gitignored at the project root. A safe template (`integrations/.env.example`) IS committed so future-you knows which keys are needed without exposing values.
