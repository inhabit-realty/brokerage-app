# Master Directory — Business + Technical Architecture

**Status:** Phase 0 capture · 2026-05-10
**Audience:** Internal (Inhabit + future LD/Coop employees + the AI assistant in fresh sessions). NOT public; do NOT commit into the OSB AGPL repo. Lives in the Inhabit workspace docs.
**Source-of-truth:** This file. When prior memory entries conflict with this doc, this doc wins. Older entries (v1_architecture.md, inhabit_app_architecture.md, inhabitrealty_com_isr_plan.md) are superseded.

---

## 1 · Entity map

```
   ┌─────────────────────────────────────────────────────────────┐
   │  REAL ESTATE COOPERATIVE  (legal entity, .coop TLD)         │
   │  - signs contracts, receives revenue, pays rev-share        │
   │  - "Brokerunion.com" is a deferred marketing surface        │
   │    for the same entity (agent-recruiting brand)             │
   └───────────────────────┬─────────────────────────────────────┘
                           │ owns
                           ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  LISTING DATA  (proprietary infrastructure company)         │
   │  - listingdata.com — AWS Fargate · ALB · RDS · multi-tenant │
   │  - hosts OSB instances on behalf of brokers + enterprise    │
   │  - operates two API surfaces:                               │
   │      Standard API   → tenant-internal use (broker tools)    │
   │      Publisher API  → external re-display (proptech)        │
   │  - eventually: white-label MLS software for MLS operators   │
   └───────────────────────┬─────────────────────────────────────┘
                           │ runs the framework
                           ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  OSB / Brokerage MCP  (AGPL-3.0 framework)                  │
   │  - public repo `inhabit-realty/open-source-brokerage`       │
   │  - same codebase whether self-hosted or LD-hosted           │
   │  - LD_HOSTED=1 env flag toggles multi-tenant + metering     │
   │  - vendor adapters (FUB, dotloop, …) live here              │
   │  - vendor-skills/ (per-vendor playbooks) live here too      │
   └───────────────────────┬─────────────────────────────────────┘
                           │ deployed as a tenant of
                           ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  Inhabit Realty  (Florida brokerage, tenant #1)             │
   │  - inhabitrealty.com → CNAME → inhabit.listingdata.com      │
   │  - pays Coop the same broker rate as everyone else          │
   │  - reference customer + dog-food test                       │
   └─────────────────────────────────────────────────────────────┘
```

The pricing inversion that makes the model work:

> **Brokers pay the lowest rate. Proptech publishers pay margin.**
> Brokers earn rev-share on Publisher API consumption of their listings.

## 2 · GitHub repo organization (locked 2026-05-10 evening)

> Three orgs / repos, three roles. Cleaner than the earlier `inhabit-realty/open-source-brokerage` plan because the maintainer org matches the company that builds the framework, and Inhabit becomes a clear first customer.

| GitHub repo | License | Role | Author credit |
|---|---|---|---|
| `listing-data/infrastructure` | Proprietary | AWS CDK + ops + LD host control plane | Listing Data |
| `listing-data/open-source-brokerage` | AGPL-3.0 | The OSB framework — schema, MCP, web admin, **default LD adapter** | Listing Data (LD adapter); Inhabit Realty (all other adapters once added) |
| `inhabit-realty/brokerage-app` | Proprietary | Inhabit's deployment — brand assets, content, deployment config, customizations | Inhabit Realty |

**Adapter credit split (locked):**
- LD-RESO + LD-Brokerage adapter ⇒ Listing Data
- All other adapters (FUB, dotloop, DocuSign, SkySlope, Form Simplicity, Mojo, Matrix, Flexmls, Bridge, MLS Grid, QBO, etc.) ⇒ Inhabit Realty (the working brokerage builds them against real operational needs and contributes upstream)

See `repo_organization.md` memory for full rationale + attribution rules.

**Long-term physical layout** (when the moves happen — deferred for now):

```
~/Desktop/brokerage/                      # parent folder; sibling repos, NOT a monorepo
├── infrastructure/      # listing-data/infrastructure
├── open-source-brokerage/  # listing-data/open-source-brokerage (AGPL)
├── brokerage-app/       # inhabit-realty/brokerage-app (Inhabit's deployment)
└── docs/                # cross-cutting strategy (this file moves here)
```

**Today** (2026-05-10) on disk — physical reorg deferred per "foundation stable to build on" directive:

```
~/Desktop/Inhabit Realty/                 # is the inhabit-realty/brokerage-app workspace
├── real-estate-mcp/     # will become listing-data/open-source-brokerage
├── inhabitrealty-com/   # Eleventy marketing site, folds into brokerage-app
└── docs/                # ← this file is here; eventual cross-cutting home is brokerage-level
~/Desktop/Listing Data/                   # contains the listing-data/* sources
└── infra/               # will become listing-data/infrastructure
```

## 3 · Dependency hierarchy

```
   Inhabit + future brokerage tenants
        ↓ deploy on
   Listing Data infrastructure (AWS Fargate · ALB · RDS)
        ↓ runs
   OSB framework (AGPL, single codebase, LD_HOSTED=1 flag)
        ↓ pulls vendor data via
   Vendor adapters (in OSB) → FUB · dotloop · DocuSign · Form Simplicity · SkySlope · Mojo
        ↓ documented by
   Vendor skill files (osb/vendor-skills/, MD + YAML frontmatter)
        ↓ governed by
   Real Estate Cooperative (legal entity, billing, rev-share)
```

External money flows:

```
   Proptech publishers   ──$──>  Coop  ──$──>  Brokers (rev-share on their listings)
                                   │
                                   └──$──>  LD infra cost + Coop margin
   Brokers + enterprise  ──$──>  Coop  (lowest rate; covers hosting + Standard API + bucket of calls)
```

## 4 · Tenant model

Two tiers, both supported on the same LD codebase:

| Tier | DB isolation | URL | Use case |
|---|---|---|---|
| **Shared** (default broker) | Row-level w/ `tenant_id` on every table | `<slug>.listingdata.com` + optional CNAME | Solo brokers, small offices |
| **Enterprise / Franchise** | Schema-per-tenant (`brokerage_<slug>`) | Same URL pattern + dedicated cluster option later | Multi-office franchises, regional SLAs |

**Lock now (even though enterprise tier ships later):**

- Every row in every table includes `tenant_id` from day one. Shared-tier rows partition by it; enterprise-tier rows redundantly carry it (cheap; lets schema-per-tenant data flow back into multi-tenant analytics if needed).
- Postgres RLS policies as belt-and-suspenders on the shared tier so a missed `WHERE tenant_id` in code can't leak data.

The **federation question** — "can a franchise have its own cluster with listings still queryable by others?" — is a yes-but-not-now. Logical replication or Postgres FDW solves it when the first enterprise asks. The `tenant_id` rule is what keeps that path open.

## 5 · MVP scope

> **MVP success criterion:** Inhabit Realty migrated to LD host, zero downtime, observability stack proven.

**In scope:**

- LD infrastructure on AWS (Fargate + ALB + RDS, multi-AZ for SOC 2)
- OSB code with `LD_HOSTED=1` runtime flag — multi-tenant routing, central auth, audit logging
- Inhabit migrated as tenant #1 (subdomain default + `inhabitrealty.com` CNAME)
- Observability: CloudWatch + structured app logs + audit trail
- Zero-downtime cutover plan (DB replication or blue/green)

**Out of scope for MVP:**

- Vendor adapters (FUB, dotloop, etc.) — Phase 5
- Self-serve signup at signup.listingdata.com — Phase 6
- Publisher API + IP allowlist — Phase 6
- Rev-share engine — Phase 6
- White-label MLS software for MLS operators — Phase 7
- Brokerunion.com brand — deferred until 5–10 brokers sound out the framing

## 6 · Phased plan

```
Phase 0   ✏️  Capture & lock the model in writing      (this file + memory)
Phase 1   🛠️  OSB schema readiness                     (tenant_id everywhere, LD_HOSTED flag)
Phase 2   ☁️  LD infra scaffolding                     (Terraform/CDK, Fargate/ALB/RDS)
Phase 3   🚀  Inhabit migration to LD host              (the MVP — zero-downtime cutover)
Phase 4   📚  Vendor skill files                        (convert OSB matrix → MD per vendor)
Phase 5   🔌  Tier-0 adapters                           (FUB → dotloop → DocuSign → FS → SkySlope → Mojo)
Phase 6   💳  Self-serve signup + Publisher API         (signup.listingdata.com + Stripe + rev-share)
Phase 7   🏛️  MLS-as-customer (white-label MLS)         (long-term)

Parallel from now:
   · SOC 2 controls baked in from day one (formal Type II ~9–12 mo)
   · Form Simplicity partner credential outreach (4–8 wk lead time, blocks Phase 5 step 4)
   · realestate.coop reservation (~$150, time-sensitive)
```

## 7 · Locked technical decisions

| Decision | Choice | Rationale |
|---|---|---|
| Hosting platform | AWS Fargate + ALB host-based routing + RDS multi-AZ | LD's purpose is to *run infra*, not be a SaaS. Cleanest path to enterprise dedicated clusters later. |
| Code unification | Single OSB codebase, `LD_HOSTED=1` runtime flag | One repo, one truth. Self-host and LD-host diverge only in env, not in code. |
| Tenant DB (shared) | Row-level w/ `tenant_id` + RLS | Cheapest at small scale; RLS is the safety net. |
| Tenant DB (enterprise) | Schema-per-tenant (`brokerage_<slug>`) | Logical isolation as upsell feature; clean extraction to dedicated cluster later. |
| Tenant URL | `<slug>.listingdata.com` default + CNAME for owned domains | Standard SaaS pattern; works on Vercel and AWS the same way. |
| Tenant_id everywhere | Yes, every table, day one | Keeps the multi-cluster federation path open at zero cost. |
| Publisher API auth | API key + IP allowlist | Simple, audit-friendly. OAuth path documented for v2. |
| Compliance | SOC 2 controls baked in from MVP, formal Type II in 9–12 mo | Required for first proptech publisher contract; retrofitting is more expensive than building in. |
| Vendor adapter home | `osb/packages/adapters/` (in AGPL repo) | Brokerages get adapters via fork. Ingest is broker→LD via push, not LD→vendor pull. |
| Vendor skills home | `osb/vendor-skills/` (also AGPL) | Public knowledge. Ships with the framework. Distributes the playbook. |
| MLS feed ingest | NO — broker-contributed only | Cleanest legal posture. Brokers syndicate listings they represented (list-side); no MLS contract complexity. |

## 8 · Locked business decisions

| Decision | Choice | Rationale |
|---|---|---|
| Legal entity | **Real Estate Cooperative** (.coop TLD) | Cooperative is the accurate legal model — rev-share to contributing brokers + member governance. The .coop TLD requires verification, which lends instant credibility. |
| Marketing brand (deferred) | **Brokerunion.com** | Provocative, agent-frustrated, NAR friction is a feature for that audience. Not committing $4k until 5–10 brokers respond to the framing. |
| Domain spend now | Reserve `realestate.coop` (~$150) | Time-sensitive (good co-op names get registered). Defer brokerunion.com until tested. |
| Inhabit's role | Just-another-tenant. Same rate card. No special access. | Reference customer + dog-food test. If it doesn't work for Inhabit it doesn't work. Avoids competitor narrative that Inhabit "sees more." |
| Pricing model | Brokers: $100 + margin for shared DB + bucket of API calls. Enterprise: dedicated instance with listings shared. Margin TBD when call volume measured. | Inversion of industry norm: brokers pay least, publishers pay most. |
| Syndication payout | Rev-share on Publisher API consumption only (not Standard) | Aligns broker incentives toward contributing data; keeps Standard API simple. |
| Public listings policy | (Existing rule, unchanged) Show only listings broker represented (list-side OR buyer-side; buyer-side gets `noindex`). MLS-feed-only via authenticated MCP only. | Carries over from v1 architecture. |

## 9 · Tier-0 vendor adapters

Build order (post-MVP, Phase 5):

1. **Follow Up Boss** — best-documented API, Inhabit's active CRM, lowest risk to start.
2. **dotloop** — public GitHub API + webhooks; Zillow-owned (data-flow caveat noted).
3. **DocuSign Rooms** — NAR official, SDKs in 6 languages. Forms API requires account-manager approval (4–8 wk lead).
4. **Form Simplicity** — *blocked on partner credentials*. Florida Realtors-operated, "internal use only." **Open the credential ask now (parallel work) so the build slot isn't dead time.**
5. **SkySlope** — license agreement required (not self-serve). Strong enterprise compliance + AI Smart Audit.
6. **Mojo** — *unusual API shape*. Posting PIN model means the adapter is a sync subscriber, not a typical REST client. Recommended pipeline per OSB matrix: Vulcan7/REDX → Mojo (Posting PIN) → API Nation → GHL. The OSB adapter consumes the same Posting PIN feed.

Each adapter ships with a corresponding `osb/vendor-skills/<vendor>.md` playbook (frontmatter + capabilities + gotchas + troubleshooting context, per the standing rule on inline AI troubleshooting).

## 10 · Open items / parking lot

- **Pricing model precision** — $100 base + margin + bucket-of-calls. Margin and bucket size depend on call-volume data we don't have yet. Re-decide after MVP load testing.
- **Broker Union brand validation** — defer until 5–10 brokers weigh in.
- **Federation across regional clusters** — design freeze deferred; keep `tenant_id` rule.
- **MLS-as-customer (Phase 7)** — white-label MLS software offering. Match RESO Web API contract. Compete at the Bridge/Trestle/Spark layer. Long-term, not on the MVP path.
- **Form Simplicity credentials** — start the conversation now (Florida Realtors partner program).
- **Compliance** — SOC 2 vendor selection (Vanta / Drata / Secureframe). Pick after Phase 2 infra is up.
- **AI improvement loop** — autonomous Claude/GPT/etc. work on the OSB framework during idle-compute windows, PRs-only with CI gates, funded by Publisher API margin; aligns with the cooperative model ("while you sleep, the cooperative builds"). Detail + safety rules in memory `ai_improvement_loop.md`. Trigger to pick up: post-MVP + 5+ brokers + a single first-use-case (suggested: auto-generate `osb/vendor-skills/*.md` from the OSB matrix as the proof-of-concept).
- **Marketing direction** — *"intentional architecture for the next gen of real estate"*. Positions the platform opposite incumbents (BoldTrail/kvCORE/Lofty = features-bolted-on-legacy-plumbing). Word **intentional** does the most work; quiet rebuke to industry's accidental tech sprawl. Captured 2026-05-10 conversation; not yet committed to brand assets.

## 11 · For the next AI session

When you read this file in a fresh conversation:

1. The **business model** in §1 is the operating thesis. Don't redesign it.
2. The **technical decisions** in §7 are locked unless explicitly revisited.
3. The **MVP scope** in §5 is what we're actively building. Anything else is later-phase.
4. **`tenant_id` on every row** is the single most important schema rule. Enforce it on every new table.
5. The **vendor skill files** rule (inline AI troubleshooting context) applies to every new adapter / route / service. Same standing rule from feedback memory.
6. When in doubt about prioritization, ask. The user is iterating fast and welcomes 3–4 targeted questions per round.
