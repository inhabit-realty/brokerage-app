# Master Directory — Business + Technical Architecture

**Status:** Broker Union model locked · updated 2026-05-11
**Audience:** Internal (Broker Union + the AI assistant in fresh sessions). NOT public; do NOT commit into any public repo.
**Source-of-truth:** This file. When prior memory entries conflict with this doc, this doc wins.
**Supersedes:** the earlier "Listing Data is the infrastructure company / Real Estate Cooperative is the legal entity / Brokerunion.com is a deferred marketing brand" framing, and the older v1 / PWA / ISR-migration plans. Names retired: **Listing Data**, **listingdata.com**, **Real Estate Cooperative / .coop**, **OSB / Open Source Brokerage** (the core is now proprietary; only the adapter layer is open).

---

## 1 · Entity map

```
   ┌─────────────────────────────────────────────────────────────┐
   │  BROKER UNION  —  a private company (owns itself)           │
   │  wordmark "BROKER UNION."  ·  the intersection of RE & AI    │
   │  - brokerunion.com — the platform; AWS multi-tenant          │
   │  - NOT a co-op; rev-share to brokers is contractual          │
   │  - owns + operates everything below; publishers pay margin   │
   └───────────────────────┬─────────────────────────────────────┘
                           │ runs
                           ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  THE PLATFORM  —  private core + three data surfaces        │
   │  - core: broker-union/platform (proprietary; never public)   │
   │  - listings  → shared; master copy of every listing + all   │
   │      listing media/public files; low-security (no PII, no    │
   │      SOC-2 scope); everyone reads; brokers write their own   │
   │  - brokerage → per-broker siloed environment: private DB +   │
   │      private file storage + the broker's deployed instance;  │
   │      <slug>.brokerunion.com (CNAME-able); broker owns it;    │
   │      soft-delete only (retained for legal/audit, not public) │
   │  - traffic   → mandatory reporting from every consumer       │
   │  - adapters: broker-union/adapters (PUBLIC, AGPL-3.0),       │
   │      built against broker-union/adapter-sdk (PUBLIC, Apache) │
   └───────────────────────┬─────────────────────────────────────┘
                           │ tenants
                           ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  BROKERS  (tenants on the platform)                         │
   │  - each gets a siloed environment; <slug>.brokerunion.com   │
   │    (CNAME-able); run by the broker's own AI                  │
   │  - pay the lowest rate; earn rev-share on publisher          │
   │    consumption of their listings; build adapters → Commons   │
   │  - first brokerage onboarded = the MVP proving ground       │
   └─────────────────────────────────────────────────────────────┘
```

The pricing inversion that makes the model work:

> **Brokers pay the lowest rate. Proptech publishers pay margin.**
> Brokers earn rev-share on publisher consumption of their listings. Brokers (via their AI) also build the vendor adapters, which fertilise the shared Commons.

## 2 · GitHub repo organization

> Broker Union owns the platform — and, as of the 2026-05-12 revision, the adapter layer too. Everything is private/proprietary now; the earlier "public AGPL adapter Commons" is dropped.

| GitHub repo | Visibility / License | Role | Author credit |
|---|---|---|---|
| `broker-union/platform` | **Private**, proprietary | The core — multi-tenant control plane, runtime, web admin, the `accounts.` IdP, billing/metering, the `traffic` engine, the per-tenant AI operator, environment provisioning. Never public. | Broker Union |
| `broker-union/adapters` | **Private**, proprietary | SDK **+** adapters in one repo (merged 2026-05-12 — there's no separate `adapter-sdk` anymore): the adapter contract/SDK *and* every vendor adapter, CI-gated, available to all environments. Built primarily by the per-tenant AI operator (which has the SDK), used by all tiers (standard brokers get the adapters; they don't see the source). **Enterprise** tenants get read/write access (their devs can add/override adapters). | Broker Union (enterprise contributions credited to the contributing tenant) |
| `broker-union/mls-edition` | **Private**, proprietary | White-label MLS app — built out from our existing app per MLS operator; AI matches the operator's prior API contract for transparent migration; siloed listings DB per MLS; operator self-governs its members; those listings are the source for the MLS's other vendor integrations. | Broker Union |
| `broker-union/infra` | **Private** | Infrastructure as code (AWS) — the account / network / data / compute stacks. *Separate* from `platform` deliberately: different blast radius (a bad `cdk apply` takes down everything), different access model (few people should `cdk deploy` prod), keeps `platform` infra-agnostic, and it's shared — it provisions the account that runs `platform` + `mls-edition` + the per-broker `env-<slug>` deployments. Seed: the legacy `~/Desktop/Listing Data/infra/` sources. | Broker Union |
| `broker-union/env-<slug>` | **Private** (one per broker) | The broker's deployment repo — environment config / brand assets / deploy settings. For a non-technical broker, Broker Union creates and operates it white-glove (the broker never touches it; platform automation / the broker's AI / support-with-a-granted-scope commits to it). A technical broker may keep this in their own GitHub org with Broker Union holding a scoped deploy app instead — strictness confirmed per broker. | the broker |

**License / openness (revised 2026-05-12).** Everything is **private + proprietary** — `platform`, `adapters` (SDK+adapters merged), `mls-edition`, `infra`, every `env-<slug>`. Consequence: there is no public AGPL Commons and no Apache "seam" — the copyleft-containment argument is moot (nothing's distributed publicly). The adapter library is a BU proprietary asset; standard brokers get the *behavior* of the adapters via the platform without seeing source; **enterprise** gets repo access. Trade-off accepted: lose the "open / forkable adapter layer" positioning; gain full control and a simpler IP story. (Reconcile the older "open" framing in memory `business_model_v2` / `competitive_positioning` / `repo_organization` against this.)

**Why per-broker env repos for non-technical brokers.** The "every broker has a deployment repo" pattern is an implementation detail, not something a broker has to operate. For a non-technical broker, Broker Union creates and operates a private `broker-union/env-<slug>` repo; the broker just talks to their AI operator or the guided wizard. Adapters their AI writes land in the private `broker-union/adapters` repo via the platform, not by the broker. (Distinction that matters for the access promise: BU *can* see a hosted broker's config repo; BU genuinely cannot read the live `brokerage`-surface *data* — see §4.)

**On-disk / GitHub today** (2026-05-12): the `~/Desktop/Inhabit Realty/real-estate-mcp/` dir is **`broker-union/platform`** (private — transferred from `inhabit-realty/open-source-brokerage` and renamed; local remote re-pointed). `broker-union/infra` has its CDK code pushed. `broker-union/adapters` exists as a placeholder — will absorb the (never-built) `adapter-sdk` repo; no code yet (Phase 5+). `broker-union/www` is the public marketing site. ⚠ The repo transfer broke the App Runner / Amplify deploy connection (was wired to `inhabit-realty/open-source-brokerage`) — install the AWS GitHub App on the `broker-union` org and re-point the deploy source to `broker-union/platform`.

## 3 · Dependency hierarchy

```
   Broker environments  (the brokerages on the platform)
        ↓ deploy from / run on
   Broker Union platform core   (broker-union/platform — private, multi-tenant, AWS)
        ↓ exposes
   Three surfaces:  listings · brokerage · traffic
        ↓ extended by
   Vendor adapters  (broker-union/adapters — PUBLIC, AGPL-3.0)
        ↓ built against
   Adapter SDK  (broker-union/adapter-sdk — PUBLIC, Apache-2.0)
        ↓ governed + billed by
   Broker Union  (the private company)
```

External money flows:

```
   Proptech publishers  ──$──>  Broker Union  ──$──>  Brokers (rev-share on their listings)
                                       │
                                       └──$──>  AWS infra cost + Broker Union margin
   Brokers + enterprise + MLS operators ──$──>  Broker Union
        (brokers: lowest rate — hosting + listings access + a bucket of calls;
         enterprise: broker rate × members, + optional bulk-pay of member fees;
         MLS operators: white-label MLS-edition build + siloed-DB hosting)
```

## 4 · Tenant / surface model

The platform is **three data surfaces** with different isolation/security postures, plus four participant types holding different combinations.

### The three surfaces

| Surface | Holds | Isolation | Security |
|---|---|---|---|
| **`listings`** | Master copy of every listing ever created + all listing media & public files (photos, `floorplan.pdf`, virtual tours) | Shared single store; canonical copy regardless of creator | Low — public data. **No PII, no SOC-2 scope on this surface.** |
| **`brokerage`** | Each broker's private operational data (agents, deals, leads, CRM links, transactions) + uploaded company docs/images + the broker's deployed instance + deploy config | Hard per-broker isolation: siloed DB + siloed file storage + own subdomain | High. Broker **owns it entirely**. Soft-delete only — retained for legal/audit, removed from public/active. **Support can see environment code/config (for stability); broker *data* requires the broker's permission — granted by default, broker can opt out.** |
| **`traffic`** | Page-view / impression telemetry on listings & creatives, reported by every consumer | Per-reporter, aggregated centrally for metering + rev-share | Operational telemetry. **Reporting is mandatory** for brokers, enterprises, MLS operators, publishers. |

> Open mechanic: whether `brokerage` isolation is schema-per-broker in a shared cluster + dedicated file bucket/prefix, or a fully dedicated DB per broker — decide when the first hosted broker lands. `tenant_id` on every row regardless (see below).

### Listing write rules (`listings` surface)

1. Everyone with a surface reads all listings.
2. A broker creates/updates **their own** listings — via their platform UI/AI *or* by editing the listing DB directly.
3. A broker may **delete their own** listing **only while pre-active**; once active or past it, retained.
4. Listings created by Broker Union itself carry a **`BU` prefix** on the identifier.
5. Public-listings policy (carried forward): a broker's public web surfaces show only listings that broker represented (list-side OR buyer-side); buyer-side renders with `noindex` and no canonical. MLS-feed-only listings are reachable via authenticated MCP only.

### Participant types

| Participant | `listings` | `brokerage` | `traffic` | Notes |
|---|---|---|---|---|
| **Broker** | Read all; CRUD own (delete own pre-active only) | Full CRUD on own siloed surface; exclusive ownership | Must report | On join: brokerage surface provisioned + platform instance deployed from it. Pays the lowest rate; earns rev-share on publisher consumption of their listings. |
| **Enterprise / franchise** | Read all + affiliated listings across its network | — (no surface of its own) | Must report; sees network traffic (its agents + affiliated listings) | **Can pay member brokerages' fees in bulk** → that grants the enterprise access into those participating brokers' brokerage surfaces. |
| **MLS operator** | Siloed listings DB (no PII security); these listings are the source for the MLS's other vendor integrations | — | Must report | Runs the white-label MLS edition (`broker-union/mls-edition`); **self-governs its own members.** |
| **Publisher** (proptech) | Read-only consumer view | — | Must report | Per-page-view metered; sold-data is a higher tier (see §9). |

### Setup / provisioning flow (per broker)

1. **Connect your AI** — "Sign in with Claude" (one click, OAuth-style) issues a token scoped to this environment only — same data reach as the web admin, revocable anytime. No AI? Use the **guided wizard** — a conversational assistant that does the same work; connect an AI later. (Advanced: paste an MCP config for any MCP client.)
2. **Create environment** — brokerage name → `<slug>.brokerunion.com` → region; accept the **Contributor Agreement** here (adapters authored in this environment → AGPL-3.0 Commons, credited to this brokerage).
3. **Provision** — private DB schema, private file storage, subdomain, platform instance, scoped token. ~1 minute.
4. **Configure** — brand, vendor connections (FUB OAuth first), listings import, agent roster — driven by the broker's AI (chat) or the guided wizard (chat). Same outcome either way.
5. **Adapter studio** — when a broker uses a vendor not yet in the Commons, their AI scaffolds an adapter against the public SDK, tests it in the environment, contributes it back (AGPL, credited). Optional.
6. **Go live** — CNAME the broker's own domain; auto-TLS; publish. Thereafter the AI is the broker's day-to-day operator.

### Lock now (carries forward)

- `tenant_id` on every row in every table, day one — keeps the multi-cluster federation path open at zero cost.
- Postgres RLS as belt-and-suspenders on shared surfaces.
- Federation across regional clusters = yes-but-not-now (logical replication / FDW when the first enterprise asks).
- SOC 2 controls baked in from MVP, formal Type II in ~9–12 months — **except** the `listings` surface, which is explicitly out of PII/SOC scope (public data only).

## 5 · MVP scope

> **MVP success criterion:** the Broker Union platform core stands up on AWS, and the first brokerage is onboarded end-to-end through the setup flow (connect AI → create environment → configure → go live) — zero-downtime expectations met for any data migrated in, observability proven, per-tenant cost model measured.

**In scope:**
- Broker Union platform core on AWS (multi-tenant routing, central auth — `accounts.brokerunion.com` as the identity provider, see §7 — audit logging, multi-AZ).
- The provisioning flow: create environment → private DB schema + private file storage + subdomain + scoped token.
- One brokerage onboarded as tenant #1 — brand, at least one vendor connection, listings, agents, go-live.
- Observability: CloudWatch + structured app logs + audit trail.
- Zero-downtime expectations for any data migrated in.

**Out of scope for MVP:**
- Multi-broker self-serve onboarding + the polished chatbot setup flow — later.
- Vendor adapters (FUB, dotloop, …) — Phase 5.
- Publisher API + page-view metering + rev-share engine — later phase.
- MLS edition — later phase.
- `traffic` reporting enforcement across third parties — later phase.

## 6 · Phased plan

```
Phase 0   ✏️  Lock the model in writing                  (this file + memory)
Phase 1   🛠️  Platform schema readiness                  (tenant_id everywhere; surface boundaries; provisioning)
Phase 2   ☁️  Broker Union infra scaffolding             (Terraform/CDK; AWS multi-tenant)
Phase 3   🚀  First brokerage onboarded end-to-end       (the MVP — provisioning → configure → go-live + cost analysis)
            + the per-tenant AI operator (interactive): broker scope AND platform-superuser scope;
              the /setup chatbot is the operator in a constrained mode; usage metered (Stripe)
Phase 4   📚  Vendor skill files                          (per-vendor MD playbooks, in broker-union/adapters)
Phase 5   🔌  Tier-0 adapters                             (FUB → dotloop → DocuSign → Form Simplicity → SkySlope → Mojo)
Phase 6   💳  Self-serve onboarding + chatbot setup       (brokerunion.com signup + Stripe; $150/mo broker edition)
Phase 7   📈  Publisher API + traffic metering + rev-share
Phase 8   🏛️  MLS edition (white-label MLS app)

Parallel from now:
   · SOC 2 controls baked in from day one (formal Type II ~9–12 mo)
   · Form Simplicity partner-credential outreach (4–8 wk lead time, blocks Phase 5 step 4)
Parked (post-MVP + 5 brokers):
   · autonomous AI improvement loop (no-human PR loop on broker-union/{platform,adapters} during idle compute — memory ai_improvement_loop.md). The interactive AI operator above is NOT parked.
```

## 7 · Locked technical decisions

| Decision | Choice | Rationale |
|---|---|---|
| Company / ownership | Broker Union — a private company — owns + operates the platform | Not a co-op. Rev-share to brokers survives as a contractual mechanic, not member governance. |
| Hosting | AWS multi-tenant (Fargate/ALB/RDS class), multi-AZ | Cleanest path to enterprise dedicated clusters later. Where `brokerunion.com` itself is hosted = open item. |
| Core vs adapters | `broker-union/platform` **and** `broker-union/adapters` (SDK + adapters merged) are **both private + proprietary** (revised 2026-05-12 — the public AGPL Commons / Apache "seam" is dropped; no separate `adapter-sdk` repo). The adapter library is a BU asset, built mainly by the AI operator; enterprise tenants get `adapters` repo read/write. Nothing's self-hostable; nothing's distributed publicly. | Full IP control + a simpler licensing story (copyleft-containment is moot when nothing's public). Trade-off: lose the "open / forkable adapters" positioning. See §2. |
| Three surfaces | `listings` (shared, low-security, master copy of all listings + media), `brokerage` (per-broker siloed env: DB + file storage + the broker's deployed instance, `<slug>.brokerunion.com`, CNAME-able), `traffic` (mandatory reporting from all consumers) | One platform, three isolation/security postures. Full detail §4 + §9. |
| `listings` security | Public data only; **no PII, no SOC-2 scope on this surface** | The commodity layer that compounds; keep it cheap and open. |
| `brokerage` ownership + deletes | Broker owns it entirely; soft-delete only (retained for legal/audit, removed from public/active) | Broker trust + legal defensibility. |
| Listing writes | Everyone reads all listings; brokers create/update their own (platform UI/AI or direct DB edit); delete own only pre-active; Broker-Union-created listings get a `BU` ID prefix | Keeps the listings commons coherent while giving brokers real control over their own. |
| Platform authentication / SSO | Broker Union is the **identity provider**. `accounts.brokerunion.com` is the only place a password is entered or stored (argon2id, MFA/TOTP, email verification, reset). Every broker instance — `<slug>.brokerunion.com`, every `mls-edition` deployment, every `env-<slug>` — is an OIDC relying party: no session → redirect to `accounts.` for login → receive a short-lived BU-signed token (RS256, verified against BU's published JWKS) → confirm `tenant_id` matches the subdomain → mint an instance-local, subdomain-scoped session. Backed by a global `identities` table (email + `password_hash` + `mfa_secret`, no `tenant_id`, lives in `public`) and `memberships(identity_id, tenant_id, role, status)` — which instances a given login can enter and as what (the "store picker" when there's more than one). The per-instance `users` table becomes a profile/agent projection keyed by `identity_id + tenant_id`; it never holds a credential. Same shape as Shopify's `accounts.shopify.com → <store>.myshopify.com/admin`. The current per-instance Auth.js (NextAuth v5) layer stays as the *instance-side* session layer — fed by the OIDC handoff instead of being an identity source (magic-link provider → OIDC-client/Credentials provider). The `accounts.` service lives in `broker-union/platform` (the control plane). | One credential store, everywhere. A fully compromised broker instance still can't mint a session for any other instance or read a credential — it only ever holds tenant-scoped, short-lived, BU-signed tokens it verifies against BU's public JWKS. Gives "log in once, switch instances," and lets support assist a broker without touching their data. Where `accounts.brokerunion.com` itself is hosted = part of the `brokerunion.com` hosting open item (§11). |
| External-app SSO / launcher (outbound) | Broker Union acts as the IdP for the broker's external vendors — **outbound only; BU does not consume third-party IdPs**. Per-tenant `external_apps` config (label, icon, protocol [SAML 2.0 IdP-initiated / OIDC / OAuth-redirect / plain link], SP metadata, attribute map, role visibility, sort order) renders as an "Apps" launcher section in the instance nav; a click mints a short-lived signed assertion/token at `accounts.brokerunion.com/sso/launch/:appId` — role-gated, audience-restricted, audit-logged — and drops the user logged-in in the vendor. `external_identity_map(identity_id, app_id, external_user_id)` handles vendor-specific user IDs + JIT provisioning. Vendor adapters (the private `broker-union/adapters` repo) may ship an optional SSO descriptor (the vendor's SAML/OIDC metadata), so "add SkySlope to my menu" is an AI-operator-driven catalog pick, not a hand-entered ACS URL. Reuses the `accounts.` service. | **Business rationale — deeper broker commitment:** when Broker Union is the broker's daily launchpad into all their tools, it's the identity hub, not just another app; raises switching cost and embeds the platform in the broker's workflow. |
| AI operator (per-tenant) | Each tenant gets an **AI operator** — a sandboxed runner (Fargate/sandbox) using the Claude Agent SDK *under the hood, branded generically as "the AI"/"Broker Union AI" — never promoted as "Claude"* — with conversation state in the platform DB (`agent_conversations`/`agent_messages`, tenant- + identity-scoped) and scoped access to the tenant's `env-<slug>` repo + the BU API (the same data reach as the web admin — reuses the Connect-AI scoped-token model below). Two scopes: **broker** (a broker's AI operates *their* instance only — `jamesmeyer@inhabitrealty.com`) and **platform superuser** (operates everything — all tenants, the `platform`/`infra`/`adapters` repos: commits, pushes, opens CI-gated PRs — `jamesmeyer@brokerunion.com`; the interactive sibling of the parked autonomous "improvement loop"). Per-tenant `ai_operator` config: **`enabled`** (default on; fully disable-able — instance still works via the web admin); for *standard/broker* editions the operator runs on BU's infra + BU's keys, **metered via Stripe** like every other API call; **bringing your own AI / connecting an outside agent ("external" mode) requires the enterprise tier** (bigger security/support surface — enterprise has the isolation + the contract to allow it). The `/setup` chatbot is this operator in a constrained mode. Importing `~/.claude/projects/*.jsonl` transcripts → continue server-side. | The founding thesis ("brokers connect their AI to operate their instances") as a first-class platform component. Disable-able for brokers who don't want it; outside-AI gated to enterprise. |
| Connect-AI / MCP (BYO / external) | "Sign in with Claude" (OAuth-style — this path *is* Claude-branded, because you're connecting Claude) → scoped token = the brokerage-surface credential, RLS-bound to that tenant (issued by the instance once the BU SSO session is established); advanced path = paste an MCP config for any MCP client. This is "external" mode for the AI operator — **enterprise tier**. | The broker's own AI gets identical data scope to their web admin; no separate MCP credential model. Contrast the *bundled* operator above (generic "AI", all tiers, metered). |
| Identities & superuser | Login is keyed on email/identity id (`accounts.brokerunion.com`), not on a name — so `jamesmeyer@brokerunion.com` (platform superuser) and `jamesmeyer@inhabitrealty.com` (the first broker, Inhabit's owner) are entirely distinct accounts despite sharing a name (the only confusion is human; BU's own UI should always show the email + tenant context). `identities.is_platform_superuser` (a flag, not a per-tenant membership role) → bypasses tenant scoping, full AI-operator scope, all-tenant admin. | Clean separation of "Broker Union, the company" from "Inhabit Realty, tenant #1". |
| Non-AI path | A **conversational guided wizard** (a Broker Union setup assistant) does brand → vendors → listings → agents by chat; connect/enable an AI later | Same outcome as the AI path; keeps it simple for non-technical brokers. The entire setup UX is chat — no multi-pane stepper. |
| Setup order | Connect/enable AI **first**, then create environment → provision → configure → adapter studio → go live | The AI does the creating. |
| Support access | Environment **code/config** always visible to support (stability); broker **data** requires the broker's permission — **granted by default, broker can opt out**. The AI operator works on broker data under the same switch, auditable. | Support stays unblocked; data access stays broker-controlled + auditable. |
| Metered services / sub-metering | In **broker editions**, Broker Union provides Twilio (SMS), email (SES), and the AI operator as **bundled-but-sub-metered** services — usage recorded per tenant (`usage_records`: `tenant_id, kind [twilio_sms|email_send|ai_tokens|api_call|...], quantity, occurred_at`), aggregated, billed via **Stripe usage-based pricing** (with margin — brokers pay lowest, publishers pay margin). The broker doesn't run their own Twilio/SES/AI accounts. | One bill, one dashboard, no third-party-account juggling for non-technical brokers; BU captures margin on usage. |
| Enterprise overrides | **Enterprise** tenants can bring their own connections — their Twilio account, their email/SES, their own AI key (or external agent), their own adapters (read/write `broker-union/adapters`) — and pay the platform fee without the metered passthrough on what they self-supply. | Enterprises that already have these relationships shouldn't pay BU's margin on them; in exchange they take on the integration + the bigger access surface. |
| Internal CRM | HubSpot | Broker Union's own CRM for brokers/leads/support — distinct from the `brokerage`-surface CRM data brokers own. |
| Transactional email | **Amazon SES** (behind the `packages/email` interface, swappable) | AWS-native — IAM-scoped, bounces/complaints via SNS → straight into observability, cheapest at scale (~$0.10/1k), scales to millions/day, managed DKIM/SPF/DMARC. Carries password reset, email verification, MFA codes, broker invites, support, notifications. Sandbox→production-access is a one-time request. SMTP-compatible so the swap from the current Nodemailer/SMTP transport is near drop-in. Resend / Postmark were the alternatives — rejected as non-AWS-native + extra vendor/secret. |
| MLS edition | Built out from our existing app per operator; AI matches the operator's prior API contract for transparent migration; siloed listings DB per MLS; operator self-governs members; those listings feed the MLS's other vendors | One product, per-tenant config. The operator's existing endpoints define the compatibility target (typically RESO Web API). |
| Adapter home | `broker-union/adapters` — **private, proprietary**, SDK + adapters merged (the `adapter-sdk` repo is folded in; revised 2026-05-12). Built primarily by the AI operator (which has the SDK); used by all tiers; enterprise gets repo read/write. Ingest is broker→platform via push (transform vendor data → normalized schema), not platform→vendor pull. | BU-controlled adapter library; no public Commons. Enterprise contributions credited to the contributing tenant. |
| Vendor skill files | Per-vendor MD playbooks (frontmatter + capabilities + gotchas + troubleshooting context), in the private `broker-union/adapters` repo alongside the adapters | Internal knowledge; the standing rule on inline AI troubleshooting context applies. |
| MLS feed ingest | NO — broker-contributed listings only | Cleanest legal posture; no MLS-contract complexity in the core. |
| `tenant_id` everywhere | Yes, every table, day one | Keeps the multi-cluster federation path open at zero cost. |
| Canonical-URL rule | *(pending re-confirm)* `listings` responses include `canonical_url`; broker display contracts require linking to it unless that listing is upgraded to publisher tier | SEO equity consolidates on the canonical by default; publisher upgrade lets a broker own it. Carried from the pre-pivot model; not re-confirmed in the Broker Union pass. |
| Compliance | SOC 2 controls from MVP, formal Type II ~9–12 mo (excludes `listings`) | Required for the first proptech publisher contract. |

## 8 · Locked business decisions

| Decision | Choice | Rationale |
|---|---|---|
| Entity | **Broker Union** — a private company; owns and operates the platform. Not a co-op. | Replaces the Real Estate Cooperative / .coop model. "The intersection of real estate & AI." Rev-share to brokers survives as a contractual mechanic. |
| Brand wordmark | **BROKER UNION.** (the trailing period is the accent colour) | Lockup-level treatment; in prose this doc writes "Broker Union." |
| Domain | `brokerunion.com` — the platform and the public face. `listingdata.com` retired. | One brand, one domain. |
| Open-source posture | **Dropped (2026-05-12).** Everything is private + proprietary — `platform`, `adapters` (SDK + adapters merged into one private repo; the `adapter-sdk` repo is folded in), `mls-edition`, `infra`, `env-<slug>`. No public AGPL Commons; enterprise tenants get `broker-union/adapters` read/write. | Full IP control; simpler licensing (nothing distributed publicly). Trade-off: lose the "open / forkable adapters" positioning — reconcile `business_model_v2` / `competitive_positioning` memory. |
| AI in the product | The bundled per-tenant **AI operator** is branded generically — "the AI" / "Broker Union AI" — **never promoted as "Claude"** (it uses the Claude Agent SDK under the hood). The Claude-branded surface is only the *external/BYO* "Sign in with Claude" path, which is **enterprise-tier**. Operator usage is **metered via Stripe** like any API call; per-tenant `enabled` flag (disable-able). | Productize the operator without binding the brand to a vendor; keep "connect your own Claude" as a power-user/enterprise option. |
| Service sub-metering | **Broker editions** bundle Twilio (SMS), email (SES), and the AI operator as **sub-metered** services on BU's accounts (`usage_records` → Stripe usage-based billing, with margin). **Enterprise** can override any of these with their own connections/adapters and skip the metered passthrough on what they self-supply. | One bill / one dashboard for non-technical brokers; BU captures usage margin; enterprises that already own these relationships aren't double-charged. |
| Platform superuser | `jamesmeyer@brokerunion.com` is the **Broker Union platform superuser** (identity-level flag, not a per-tenant role) — full AI-operator scope (builds `platform`/`infra`/`adapters` via login), all-tenant admin. Distinct from `jamesmeyer@inhabitrealty.com`, the first broker / Inhabit's owner — same human name, separate accounts. | Keeps "Broker Union, the company" cleanly separate from "Inhabit Realty, tenant #1". |
| Pricing inversion | Brokers pay the lowest rate; publishers pay margin | Inverts the industry norm. |
| Broker pricing | **$150/mo** (broker edition) — of which **$50 is a monthly usage credit**; the rest = siloed `brokerage` surface + hosting + `listings` access. Metered usage (the AI operator, Twilio SMS, SES email, API calls) draws down credits. On depletion the account **auto-renews in $50 increments**. Credits are spent **FIFO** (oldest batch first) and **expire 30 days** after purchase — unused credit doesn't roll indefinitely. | Lowest rate on the platform; predictable base + pay-as-you-go beyond the included $50. The exact unit→credit conversion (margin multiplier, per-unit rates for tokens/SMS/email/calls) is TBD — §11. |
| Enterprise pricing | Broker rate × members, + optional bulk-pay of member fees in exchange for surface access across participating brokers | |
| MLS-operator pricing | White-label MLS-edition build fee + hosting of the operator's siloed listings DB. Flat-fee-per-operator vs per-listing-volume = open item. | |
| Publisher pricing | Per-page-view metered (any listing or creative — photo, video, virtual tour, listing-card embed). **Sold (closed-transaction) data = higher tier than active-only.** Brackets TBD at first publisher contract. | Sold data drives analytics/comps/market reports. |
| Rev-share | Brokers earn rev-share on publisher consumption of *their* listings (contractual, not co-op governance) | Aligns broker incentives toward contributing data. |
| Tenant #1 | The first brokerage onboarded is the proving ground — same rate card as everyone, no special access, no extra data reach | If it doesn't work end-to-end for the first real brokerage, it doesn't ship. |
| Public listings policy | Show only listings the broker represented (list-side OR buyer-side; buyer-side gets `noindex` + no canonical). MLS-feed-only via authenticated MCP only. | Carried forward. |

## 9 · Surfaces, access & pricing

> Reframed 2026-05-11 from "three API tiers" to "three surfaces + participant access." The pre-pivot RESO/Brokerage/Publisher API names were endpoint shapes; the surfaces are `listings`, `brokerage`, `traffic`. The MLS edition's API contract is whatever the operator already runs (typically RESO Web API).

**The three surfaces** — full isolation/security table in §4:
- **`listings`** — shared master copy of all listings + media + public files; low-security (no PII/SOC); everyone reads; brokers write their own (platform UI/AI or direct DB edit), delete own pre-active only; Broker-Union-created listings get a `BU` prefix.
- **`brokerage`** — per-broker siloed; broker owns; soft-delete; the broker's deployed instance lives here; siloed company-file storage; `<slug>.brokerunion.com` + CNAME. Support sees code/config; broker data is opt-out (granted by default).
- **`traffic`** — mandatory reporting from brokers, enterprises, MLS operators, publishers.

**Who gets what:**

| Participant | listings | brokerage | traffic |
|---|---|---|---|
| Broker | Read all; CRUD own (delete own pre-active only) | Own siloed surface, full CRUD, exclusive ownership | Reports |
| Enterprise | Read all + affiliated network | — (can buy into member brokers' surfaces by paying their fees) | Reports; sees network traffic |
| MLS operator | Siloed listings DB; source for the MLS's other vendors | — | Reports |
| Publisher | Read-only consumer view | — | Reports |

**MCP authentication.** "Sign in with Claude" issues a token = the broker's brokerage-surface credential, RLS-bound to that tenant; reads and writes are tenant-scoped automatically. The broker's AI assistant therefore has the same data scope as the broker's web admin. No separate MCP credential model.

**MLS-edition upgrade path.** A broker operating under an MLS-edition deployment can upgrade their tenant to add an AI assistant + the non-RESO platform capabilities. Natural upsell: MLS operator deploys our MLS edition → member brokers individually upgrade.

**Canonical-URL rule (broker-side, pending re-confirmation).** A broker displaying a listing must link to the listing's `canonical_url` unless they upgrade that listing to publisher tier and own the canonical. Carried from the pre-pivot model; not re-confirmed.

**Publisher billing.** Per page view of any listing or creative. Each impression = a metered call. Bulk brackets at first publisher contract.

**Sold-data tier.** Active listings = base publisher access; sold (closed transactions) = higher tier.

**Open items (also §11):** publisher page-view brackets · sold-data tier name + multiplier · MLS-edition pricing model · canonical-URL keep-or-drop + enforcement mechanism · `brokerage`-surface isolation mechanics · where `brokerunion.com` is hosted.

## 10 · Tier-0 vendor adapters

All Tier-0 adapters write into the broker's environment via the `brokerage` write path; they consume external vendor APIs, transform vendor data into the normalized schema, and push it in. They're built against the public Apache-2.0 SDK and contributed to the public AGPL-3.0 Commons, credited to the authoring brokerage. No adapter touches the `listings` or `traffic` surfaces directly.

Build order (post-MVP, Phase 5):

1. **Follow Up Boss** — best-documented API, lowest risk to start.
2. **dotloop** — public API + webhooks; Zillow-owned (data-flow caveat noted).
3. **DocuSign Rooms** — NAR official, SDKs in 6 languages. Forms API requires account-manager approval (4–8 wk lead).
4. **Form Simplicity** — *blocked on partner credentials* (Florida Realtors-operated, "internal use only"). Open the credential ask now so the build slot isn't dead time.
5. **SkySlope** — license agreement required (not self-serve). Strong enterprise compliance + AI Smart Audit.
6. **Mojo** — *unusual API shape*. Posting-PIN model → the adapter is a sync subscriber, not a typical REST client. Pipeline per the OSB matrix: Vulcan7/REDX → Mojo (Posting PIN) → API Nation → GHL; the adapter consumes the same Posting-PIN feed.

Each adapter ships with a `<vendor>.md` vendor-skill playbook (frontmatter + capabilities + gotchas + troubleshooting context).

## 11 · Open items / parking lot

- **`brokerunion.com` hosting** — where is the domain / where do we deploy the public site? (Likely Vercel for the marketing/coming-soon page; platform core + `accounts.brokerunion.com` on AWS.)
- **`accounts.brokerunion.com` build** — hand-rolled OIDC provider on the control plane vs. a thin OSS OIDC server embedded in `broker-union/platform`. Either way the *protocol* (OIDC + JWKS) is the contract every instance plugs into. MVP-scope (the "central auth" line in §5).
- **`brokerage`-surface isolation mechanics** — schema-per-broker + dedicated file bucket, or fully dedicated DB per broker.
- **Hosted-broker access tier** — BU hosts non-technical brokers' `env-<slug>` repos; confirm the strictness (BU-as-host vs. BU-product-team).
- **Publisher pricing brackets** — per 1k / per 10k page views; bulk curves.
- **Sold-data tier** — name + price multiplier vs active-only.
- **MLS-edition pricing** — flat-fee per operator vs per-listing-volume.
- **Canonical-URL rule** — keep it? enforcement mechanism (response header / contract clause / both)?
- **Self-hosting** — confirmed dropped. Everything is private/proprietary now (incl. adapters, as of 2026-05-12). Note in case it resurfaces.
- **Metered-use formula** — *future calc.* How AI-token / Twilio-SMS / SES-email / API-call usage converts to credit-dollars: the per-unit rates and the margin multiplier on each. Drives the credit-burn for the $150/mo broker edition (incl. $50 credit, auto-renew $50 increments, FIFO consumption, 30-day credit life). Stripe handles the billing mechanics; this is the pricing math.
- **Federation across regional clusters** — design freeze deferred; keep the `tenant_id` rule.
- **Compliance** — SOC 2 vendor selection (Vanta / Drata / Secureframe). Pick after Phase 2 infra is up.
- **Marketing direction** — "the intersection of real estate & AI"; "AI-operated brokerage platform"; positions opposite incumbents (BoldTrail/kvCORE/Lofty = features bolted onto legacy plumbing). Not yet committed to brand assets beyond the homepage mockup.

## 12 · For the next AI session

When you read this file in a fresh conversation:

1. **Broker Union is the company.** §1 is the operating thesis — don't redesign it. "Listing Data", "listingdata.com", the co-op, "OSB/Open Source Brokerage", and the old "brokerage PWA workspace" framing are all retired.
2. **§7 + §8 are locked** unless explicitly revisited. Items marked *pending* or in §11 are genuinely open — ask before assuming.
3. **MVP = §5**: the platform stands up + the first brokerage is onboarded end-to-end, zero-downtime, observability + cost model proven. Everything else is later-phase.
4. **`tenant_id` on every row** is the single most important schema rule. Enforce it on every new table. The `listings` surface carries no PII and is out of SOC-2 scope; the `brokerage` surface is the high-security one.
5. **The setup UX is chat** — "Sign in with Claude" first, or a conversational guided wizard. No multi-pane stepper.
6. **Vendor skill files** rule (inline AI troubleshooting context) applies to every new adapter / route / service.
7. **Mockups** live in `pages/brokerunion-home.html` and `pages/brokerunion-setup.html` — design references, not production.
8. When in doubt about prioritization, ask. The user iterates fast; show your work before changing things he's already seen.
