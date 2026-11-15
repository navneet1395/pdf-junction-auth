# PDF Junction – Anugya-Patra (mandi transit permit) generator

A Vite + React + shadcn/ui app for preparing Madhya Pradesh **अनुज्ञा-पत्र** (agricultural
produce transit permits). Fill the bilingual form, preview the Hindi A4 permit in the browser and
download it as a PDF. Mandi, district, crop and variety fields offer live suggestions from the
Government of India's Open Government Data platform ([data.gov.in](https://data.gov.in)).

## Features

- Bilingual (Hindi / English) permit form with inline validation (GSTIN, vehicle number, quantities).
- A4 PDF rendered with `@react-pdf/renderer` and Noto Sans Devanagari (regular + bold); preview and download.
- **data.gov.in prefill**: searchable dropdowns for *Market District → Mandi → Crop → Variety*, plus
  today's modal price (₹/quintal) for the selection, from the Agmarknet dataset
  *Current Daily Price of Various Commodities from Various Markets (Mandi)*
  (resource `9ef84268-d588-465a-a308-a864a43d0070`). Every dropdown still accepts typed values, and
  the last successful response is cached in the browser so the form works offline.
- Documents are stored per user in `localStorage` (auth is a client-side mock; see *Roadmap*).

## Local development

```sh
npm install --legacy-peer-deps
cp .env.example .env        # optional, see below
npm run dev                 # http://localhost:8080
```

Other scripts: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## data.gov.in (OGD) integration

The browser never talks to `api.data.gov.in` directly. A Supabase Edge Function,
[`supabase/functions/ogd-mandi`](supabase/functions/ogd-mandi/index.ts), holds the API key,
pages through the dataset (up to 5 000 rows), caches each query for 6 hours and answers with CORS
headers. The client (`src/integrations/ogd/`) calls it and derives the dropdown lists in
`derive.ts`.

### 1. Get a free API key

1. Create an account at <https://data.gov.in/user/register> and sign in.
2. Open *My Account → API Key* (or the dataset's *API* tab) and generate a key.

### 2. Deploy the edge function

```sh
npm i -g supabase            # or: brew install supabase/tap/supabase
supabase login
supabase link --project-ref bhzeajepzmrryrivmrga
supabase secrets set DATA_GOV_IN_API_KEY=your-key-here
supabase functions deploy ogd-mandi
```

Test it (the `x-region` header matters: data.gov.in only accepts connections from Indian IP
ranges, and Supabase otherwise runs the function at the edge nearest the caller):

```sh
curl "https://bhzeajepzmrryrivmrga.supabase.co/functions/v1/ogd-mandi?district=Gwalior" \
  -H "apikey: $VITE_SUPABASE_PUBLISHABLE_KEY" -H "x-region: ap-south-1"
```

The JSON contains `records`, `fields` (the column descriptors echoed from OGD, handy to confirm
the schema), `total` and `fetchedAt`. The dataset is a daily snapshot, so only mandis and crops that
reported prices that day appear; anything else can be typed in.

### 3. Run the function locally (optional)

```sh
supabase functions serve ogd-mandi --env-file supabase/.env.local   # file holds DATA_GOV_IN_API_KEY
# then in .env:
VITE_OGD_MANDI_URL=http://127.0.0.1:54321/functions/v1/ogd-mandi
```

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `.env` (public) | Supabase project URL; defaults to the linked project |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` (public) | Supabase publishable (anon) key; defaults to the linked project |
| `VITE_OGD_MANDI_URL` | `.env` (public, optional) | Override the edge-function URL (local dev) |
| `VITE_OGD_EDGE_REGION` | `.env` (public, optional) | Supabase edge region to pin; default `ap-south-1` (Mumbai) |
| `DATA_GOV_IN_API_KEY` | Supabase secret | data.gov.in key used by the edge function only |

## Project layout

```
src/
  components/PDFForm.tsx            permit form (comboboxes + validation errors)
  components/form/ComboboxField.tsx searchable dropdown that accepts custom text
  components/form/MandiPriceHint.tsx today's Agmarknet price for the selection
  components/pdf/AnugyaPatraDocument.tsx  react-pdf layout of the permit
  components/pdf/fonts.ts           Devanagari font registration
  hooks/useMandiData.ts             React Query + localStorage cache of OGD rows
  integrations/ogd/                 OGD types, fetch client, pure list/price helpers (+ tests)
  lib/permit.ts                     blank permit + migration of older stored documents
  lib/permitSchema.ts               zod validation (+ tests)
  pages/                            Login, Signup, Dashboard, PDFGenerator, PDFPreview
supabase/functions/ogd-mandi/       edge-function proxy for data.gov.in
```

## Roadmap

- Replace the mock login with Supabase Auth and store permits in a Postgres table with RLS.
- Commit a seed list of MP mandis/commodities so suggestions are complete even when the daily
  snapshot is sparse.

## Lovable

This project was bootstrapped with [Lovable](https://lovable.dev/projects/b8e65f23-7f3d-42cc-86b8-c31f80cd7ffb);
pushes to this repository are reflected there.
