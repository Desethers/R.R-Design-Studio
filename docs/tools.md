# Reusable Tools

The studio Tools section is defined in `src/tools/registry.js`. Artwork PDF Generator is standalone. Searchable Inventory and Gallery Archive AI read the Gallery OS source project. Morning Briefing links to its original assistant; automated briefings remain unconnected. Inquiry Tracker remains a development placeholder.

## Inventory and archive interfaces

Start both servers with `npm run dev` and `npm run dev:gallery-os`. Searchable Inventory and Gallery Archive AI use the same local frame bridge as Morning Briefing. All database reads, retrieval and AI generation stay in the Gallery OS checkout, using its existing `sanityReadClient`, `getDexHome` and Groq configuration. The studio contains no credentials or duplicated database.

Gallery OS additions:

- `/studio/inventory`: live artwork search, artist/status filters, EUR maximum budget, 24-item pagination and artwork details. Each artwork exposes its source record, document attachments and recorded Conversations matching its title.
- `/studio/archive`: source search by kind plus AI questions with numbered references. Browse artwork records, artist biographies/statements, exhibition texts, attachment metadata and recorded relationship events. Source links open the original Gallery OS records.
- `/api/studio/inventory` and `/api/studio/archive`: read-only integration endpoints. Archive POST calls the existing configured model only on an explicit question; database writes are never performed.
- `src/lib/studio-tools.ts` and `src/components/studio/StudioTools.tsx`: source adapters and minimal interfaces; no copied records in the studio.

Archive retrieval covers the 500 most recently updated artworks and 500 artist/exhibition records, plus the existing Conversations feed. The UI reports the scope and demo-feed mode. Search shows up to 30 matching source records; the model receives up to 12 of those, with text capped per source. Answers with absent or invalid reference numbers are replaced by a verification message. Attachment links do not imply PDF content extraction/OCR. Email/message subjects and logged summaries are not full message transcripts. The source project's development demo feed is preserved and flagged rather than silently presented as live conversations.

`npm run test:morning` covers these interfaces against live source reads, and intercepts the AI response for UI testing so no provider is invoked. The no-matching-source branch is tested against the real backend. These linked tools require the Gallery OS server even when the studio is packaged independently.

If the configured provider rejects access (HTTP 401/403) or reaches a request limit, the UI reports that provider error and keeps the retrieved sources visible. Fix provider access in Gallery OS; never put its key in this studio. During initial integration the configured Groq endpoint returned HTTP 403, so a successful real model answer was not verified.

## Morning Briefing — local Gallery OS alias

This is an iframe window onto the real Gallery OS chat, not a copy of its source or backend. Run `npm run dev:gallery-os` alongside `npm run dev`, then select Morning Briefing. The source server runs on `http://localhost:3010`; the studio stays on port 3006.

The launcher points to `../gallery-OS/.worktrees/conversations-crm/dashboard`, where the original `AssistantChat.tsx` currently lives. Set `GALLERY_OS_DASHBOARD` if that checkout moves. The original project has one small additional route, `/studio/assistant`, which imports its existing chat without the surrounding Gallery OS navigation. It still calls its own `/api/conversations/assistant`. No secrets, datasets, packages or LLM code are copied into this project; `.env.local` is read only by Next in the source project.

`src/tools/gallery-os.js` holds the alias origin and route. If the source server is unavailable, Morning Briefing shows a launch command and a Retry button. The page confirms it has loaded with an origin-checked message. Opening a linked person or work stays within Gallery OS inside that window.

This local integration does not connect email/calendar summaries and is not an independently deployable Morning Briefing product. For deployment, Gallery OS would need a suitable hosted integration endpoint and its own access controls; the studio does not proxy or bypass them.

Run `npm run test:morning` to verify embedding, chat submission and reconnection. Its chat response is intercepted for the test, so it never invokes the LLM or sends gallery records to a model.

## Run

Run `npm ci` and `npm run dev`. In the studio, select **Tools → Artwork PDF Generator**. Standalone access: <http://localhost:3006/tools/artwork-pdf/>.

## Client configuration

Add a configuration entry in `src/tools/clients.js`, then open `/tools/artwork-pdf/?client=your-client-id`. There is no copy of the application per client. The supplied examples are `studio` and `atelier`.

- `galleryName`, `logo`: default identity; logo can be a same-origin path or a CORS-enabled image URL.
- `typography`: `sans` (Noto Sans) or `serif` (Noto Serif). Fonts and their OFL licence are bundled locally. Other scripts require adding an appropriate font; unsupported glyphs produce an actionable error.
- `language`: `en` or `fr` for PDF default titles and labels. The internal app interface uses English.
- `artworkFields`: ordered PDF field names. Standard fields are artist, title, year, medium, dimensions and price. Extra CSV columns can be listed here, too.
- `defaultLayout`: `editorial`, `pair` or `contact`.
- `showPrices`: default price visibility. Prices remain visible in the internal inventory, but are omitted from the generated PDF when disabled.

The session can override identity, typography, language, layout, cover, prices and artwork order. Settings, imported data and images live in memory and reset on reload. No server receives inventory uploads.

## Inventory

Import UTF-8 CSV with a header row. `artist` and `title` are required; `year`, `medium`, `dimensions`, `price`, `image` and custom columns are optional. Header matching ignores case and surrounding spaces. Comma, semicolon and tab delimiters are detected by Papa Parse. Quoted commas, quotes and multiline fields are supported. Invalid rows leave the current inventory intact.

Use **Sample CSV** to download a valid example. Sample works are demonstration records; prices are illustrative, not valuations. CSV import replaces the current inventory and clears the selection. Limit: 1,000 records, 5 MB per CSV, 100 selected artworks per PDF.

Images can be same-origin paths, HTTP(S) URLs, or filenames matched using **Attach images**. Local filenames are matched case-sensitively and with Unicode normalization. PNG, JPEG and WebP are accepted, up to 20 MB each. Remote image hosts must allow CORS for PDF generation. Missing/unreadable images produce a labelled placeholder and a visible warning; they do not silently disappear. Attaching a local image with the same filename overrides a remote image.

## Code map

- `src/tools/artwork-pdf/app.js`: the Artworks, Design and Preview views and session state.
- `inventory.js`: CSV validation and search.
- `data.js`: sample artwork records, separate from client configuration.
- `templates.js`: PDF layout definitions and document translations.
- `pdf.js`: PDF generation, image preparation, font embedding and page breaks.
- `style.css`: standalone tool styling. `src/tools/studio.css` is scoped to the studio's Tools area only.

PDFs use pdf-lib and embedded fonts. Images are proportionally contained, up to 2,200 pixels on the longest edge, with JPEG quality 94%. Very long metadata continues on additional pages. Preview uses PDF.js to render the exact downloadable bytes; changing a setting or selection invalidates the prior document and disables its download.

## Independent deployment

Run `npm run build:tools`. Serve `dist/tools/` as a standalone static site over HTTP(S). The package contains only tool code, browser dependencies, font licences and sample images; it does not depend on the studio shell, authentication, a database or a build framework. Client selection remains `/tools/artwork-pdf/?client=atelier`. To supply client-specific sample data, edit/import `data.js` rather than duplicating the app. No deployment is performed by the build command.

## Verification

Run `npx playwright install chromium` once, then `npm run test:tools`. Tests cover existing studio navigation, development placeholders, CSV validation/import, search, selection, ordering, identity, logo upload, settings invalidation, all three layouts, actual PDF generation/download and mobile overflow. Generated files/screenshots stay in ignored `test-results/`. This static project has no TypeScript compiler or existing framework build; `build:tools` validates the standalone packaging.
