# Pablo Soberón — portable academic website

This package contains the editable source, a complete prebuilt preview in `dist/`, and a local content editor. Nothing has been published, connected to an account, or changed at Wix.

**Revision 2:** the original desktop background, homepage illustration, and personal About sections are restored. The attached portrait is shared across the site. See `docs/REVISION-2.md` for changes and one-file portrait updates.

**Start by opening `START-HERE.html`.** It links to the preview, editor, screenshots, and migration checklist.

## 1. View the site without installing anything

Extract the ZIP completely. Open `START-HERE.html` in a browser and choose **Open website preview**. Alternatively, double-click `dist/index.html`.

The pages, local images, catalog search, and filters are self-contained. Internal links use relative `index.html` paths so they can work from a local folder as well as from a web server. Internet access is still needed for arXiv, external journal pages, and documents currently stored only on Wix. A local file preview is not a reliable environment for testing third-party video embeds; use the local server or a temporary hosted preview for that.

Do not edit files inside `dist/`. They are generated and will be replaced on the next build.

## 2. Run a local server and edit the site

Install a supported Node.js LTS release. Node 24 LTS is the suggested installation; the generator supports Node 22 or later and was tested with Node 22.16.0. Node's installer includes npm. Official download: https://nodejs.org/en/download .

Open Terminal on a Mac. Type `cd ` (including the space), drag the extracted `psoberon-site-v2` folder into the Terminal window, and press Return. On Windows, open a terminal in the extracted folder using File Explorer's context menu. The current folder must contain `package.json`.

Run:

```sh
node --version
npm run dev
```

**There is no `npm install` step.** This project has no third-party package dependencies.

Open:

```text
http://localhost:4321
```

Keep Terminal open. Stop the server with **Control+C**, not Command+C. Saving files in `content/` or `public/` triggers a rebuild and reload. Template or generator changes require restarting the server. A validation error is printed in Terminal; the previous successful site remains available.

A port conflict can be resolved with:

```sh
npm run dev -- --port 4322
```

Then use `http://localhost:4322`. The server binds only to your own computer and has no upload or write API.

## 3. Add or update a paper using the editor

Open `tools/editor.html` directly, or with the development server running open:

```text
http://localhost:4321/__editor/editor.html
```

Choose the Papers collection, then an existing paper or **New record**. Fill in the title, authors, year, status, links, and topics. Choose student coauthors from the names you entered. Add an abstract or short visible overview as needed. The **Draft** checkbox excludes a record from all public pages and feeds; uncheck it when the record is ready.

Click **Download record**. Move the downloaded `your-paper-id.json` file into `content/papers/`, replacing the previous file when editing. Browsers may add `(1)` to duplicate download names; restore the exact `id.json` filename. The filename must match the record's `id`.

The editor does not silently overwrite local files. Its existing-record menu reflects the last build. To edit the newest version before rebuilding, use **Import a JSON file** and select the actual file from `content/papers/`.

Run `npm run check` after saving. With the development server running, the site updates automatically. Without it, run `npm run build`, then reopen or refresh the preview.

One record generates the paper page, chronological catalog entry, topic lists, student lists, coauthor pages, selected-work list where applicable, BibTeX, and machine-readable representations. No publication entry needs to be copied between pages.

For a PDF stored locally, place it at `public/files/papers/my-paper.pdf` and set the record's `pdf` to `/files/papers/my-paper.pdf`. The `public/` prefix is not part of the web address. With just an arXiv ID, the site supplies arXiv and arXiv PDF links automatically.

Keep an existing paper's `id` stable after launch: it determines its public URL. Edit its title, year, status, and reference without changing that ID. All lists then update together.

## 4. Add videos, including direct files

In the editor choose **Talks & videos**. Create a record, choose `paper-explainer` or `talk`, and associate one or more papers. Select the relevant topics. A single recording can be associated with several papers, and a paper can have several recordings.

For YouTube, paste either the video ID or its watch/share URL. The editor stores the ID. For a direct file, select **Direct video file** and supply an HTTPS URL or a local path such as `/files/videos/explanation.mp4`. An optional poster image and caption tracks are supported; caption tracks are edited in the complete JSON record. The player uses normal HTML video controls, not a video-processing service.

Save the downloaded record in `content/videos/`. Associated recordings appear on paper pages, topic pages, the Talks & Videos page, and the homepage's latest-recording section. Papers with actual recordings become available under the **With videos** filter. Slides-only talks do not count as videos.

YouTube embeds load only after the visitor clicks **Load video**; there are no background YouTube thumbnail requests. A Watch on YouTube link remains available. Actual YouTube playback depends on the video's embedding permissions and browser environment. Test it on the temporary public preview before launch.

Large videos should be hosted separately from the website repository. Cloudflare Pages currently limits individual files to 25 MiB; external video hosting or object storage is appropriate for large recordings. Direct MP4 playback does not supply transcoding, adaptive streaming, or a media library. See `docs/DEPLOYMENT.md` and the official sources there.

No new recordings were supplied, so none were invented. The imported talk archive contains three talk listings and the two available slide links.

## 5. Add author-written context without displaying it on paper pages

The editor has an **Author-written context for machines** section. It updates:

```json
{
  "agent_note": {
    "attribution": "author",
    "text": "Your description of the contribution and its context.",
    "updated": "2026-10-03"
  }
}
```

The text appears in `data/papers.json`, `data/papers.md`, and the paper's `index.md`. It does **not** appear in the ordinary paper-page HTML, visible overview, page description, or search-oriented JSON-LD. The feed labels it as the author's assessment, not an independent evaluation.

These are public alternate representations, not secret data or bot-exclusive pages. Anyone can open them, and an agent may quote them. There is no user-agent cloaking, no hidden CSS prose, and no instruction asking crawlers to rank a paper favorably. No private notes belong in these fields. No search engine or AI system is guaranteed to read or use them. `llms.txt` is an optional discovery convention, not a universal standard.

Visible bibliographic information, abstracts, and visible summaries are used in ordinary scholarly metadata. All additional importance/context fields start empty so the site does not manufacture your assessment of a paper.

## 6. Other content

| Content | Editable source |
| --- | --- |
| Site name, role, email, homepage introduction, CV links | `content/site.json` |
| Topic names and descriptions | `content/topics.json` |
| Research, students, teaching, about-page prose | `content/pages/*.md` |
| About-page institutions, education, sculpture explanation, quote | `content/about-details.json` |
| Shared portrait image | `public/images/portrait.jpg` (path in `content/site.json`) |
| Courses | `content/courses.json` |
| Upcoming events | `content/events.json` |
| Books and reading list | `content/books.json`, `content/reading.json` |
| Talks and recordings | `content/videos/*.json` |
| Exploratory / expository notes | `content/notes/*.json` |
| Files that should be served unchanged | `public/` |
| Site layout and styles | `scripts/build.mjs`, `src/html.mjs`, `public/assets/site.css` |

Research notes have a separate collection and are not counted as formal publications. The editor supports a scope/disclosure statement for each note. The collection starts empty. To remove its link from Resources, set `notes_enabled` to `false` in `content/site.json`.

The Markdown renderer intentionally supports a small safe subset: paragraphs, headings, emphasis, code blocks, ordinary links, and simple unordered lists. It does not support LaTeX rendering, nested lists, tables, or arbitrary HTML. Use Unicode/plain-text mathematics in website summaries and link the PDF for full mathematical typesetting. The data remains portable to a larger renderer later.

Events use start and end dates. Expired events are omitted at build time and hidden in browsers between builds. Rebuild periodically to update the static HTML for visitors without JavaScript. Current-course labels are not inferred from the date; update the course records directly.

## 7. Important migration work before leaving Wix

**Do not change DNS or cancel Wix yet.** The archive does not contain everything linked on the live website. This package records **27 Wix-hosted PDFs** that still need to be saved, including both CVs, the current undergraduate notes, teaching handouts, and slides.

The preview uses the existing live URLs for these missing documents. This is a temporary bridge, not independence from Wix. Those URLs are under your own domain and can break after the domain points somewhere else.

While the old website is still working, run:

```sh
npm run recover:wix
```

The utility downloads only the explicit URLs in `migration/remote-assets.json`, verifies a PDF header and end marker, records SHA-256 checksums, rebuilds the site, and does not overwrite valid existing PDFs. All 27 URLs were readable as PDFs through the browsing tool during revision 2, but the original files could not be saved by this environment. The included download report records failures, not a completed backup. Run the command above on your computer; it handles the set automatically. `RECOVER-WIX-DOCUMENTS.command` is a Mac launcher for the same process. See `migration/RECOVERY-STATUS.md`; manual links remain in `migration/DOCUMENTS.html` only as a fallback.

After import, the site automatically uses local files. The builder also supplies redirects and file copies at known old PDF paths to preserve incoming links.

**Notes version mismatch:** the supplied local geometry notes have 77 pages; the PDF currently linked from the website has 111 pages. The older local copy is kept at `public/files/archive/combinatorial-geometry-local-copy.pdf` and explicitly labeled as an archive. The current version is one of the 27 downloads. It has not been replaced by the older file.

Review `migration/CONTENT-REVIEW.md` for bibliographic discrepancies and newly drafted page copy. When approved, set `approved` to `true` in `migration/owner-review.json`. This is your local review flag, not an assertion that the software independently verified every paper or external link.

## 8. Validate, build, and publish later

```sh
npm test
npm run check
npm run build
```

`npm test` runs the included 32 automated tests. `npm run check` builds and checks content, local HTML links, PDF headers, and file sizes. It does not contact every external website.

The deliverable is intentionally set to `preview_noindex: true`. That asks search engines not to index a test deployment; it does not make that deployment private. Once the content is reviewed and all required PDFs are local, set it to `false`, then run:

```sh
npm run check:launch
```

The launch check also requires your review flag and all 27 documents. Only after it passes should you follow `docs/DEPLOYMENT.md`. A passing check cannot inspect your DNS, domain renewal, external videos, or Wix billing.

Upload **only the contents of `dist/`**, never the whole source folder. The editor, source records, migration notes, and documentation do not belong in the deployed directory. Keep the complete source folder backed up; `dist/` alone is not your editable project.

## 9. Architecture and test coverage

This implementation uses a small Node static-site generator rather than Astro. It preserves the proposed content architecture without framework dependencies, package installation, a database, or a server in production. The tradeoff is that this small custom generator is maintained as part of the source instead of relying on Astro's larger ecosystem. Ordinary content changes do not require editing generator code.

Initial build: **63 papers, 17 papers with student coauthors, 9 topics, 50 coauthor pages, and 137 generated content pages**, plus legacy redirects and data files. Exact counts are in `migration/build-report.json`.

Automated checks cover schema errors, cross-record references, escaping, metadata separation, draft exclusion, paper/video association, local links, and the editor's exported records. Revision 2 browser checks covered 42 representative page/viewport combinations at 320, 390, 768, 1024, 1440, and 1920 pixel widths, desktop fixed-background scrolling, uncropped portraits, catalog filters, and mobile navigation. The managed Chromium environment blocked URL navigation, so visual/interaction tests used the generated HTML with local assets inlined; the HTTP server was tested separately. Actual playback of future videos, Safari/Firefox behavior, external-document downloads, DNS changes, and production deployment remain to be tested on your machine or temporary host.

There are no analytics, cookies set by the site itself, remotely loaded fonts, or third-party JavaScript packages. A visitor who loads YouTube or follows an external link uses that provider's service. Original artwork, photographs, and papers retain their existing rights; their inclusion does not grant a new public license.
