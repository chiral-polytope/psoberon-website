# Deploying the site without disrupting the existing website

The source generates ordinary static files. Hosting is interchangeable; the site does not require Cloudflare, GitHub, a database, or a continuously running Node server. Node is used only to build it.

This guide uses Cloudflare Pages because it supports uploading an already-built folder and a custom domain. Product instructions and limits were checked on 3 October 2026; consult the official links below when deploying.

## Phase 1: a separate test address

Keep the existing Wix site and domain settings unchanged.

After inspecting the local preview, run `npm run check`. Leave `preview_noindex: true` for the temporary test site. In Cloudflare's dashboard, use Workers & Pages, create a Pages application, and choose the Direct Upload / drag-and-drop flow. The current documentation describes Create application → Get started → Drag and drop your files; dashboard labels can change.

Upload the generated `dist` folder, or a ZIP whose root contains `index.html`, `assets/`, `papers/`, and the other generated files. Do not upload the outer source folder. A deployment at a separate `your-project.pages.dev` address does not move your existing domain.

Cloudflare's current Direct Upload flow accepts a folder or ZIP through the dashboard. Its drag-and-drop limits are 1,000 files and 25 MiB per individual file; Wrangler has a different file-count limit. The delivered build is below those limits. Future media additions can change this. A `noindex` preview is publicly accessible, not access-controlled.

Official instructions: https://developers.cloudflare.com/pages/get-started/direct-upload/

Check the temporary site on your computer and phone. Try navigation, several papers, student/topic filters, PDFs, contact links, and any videos you add. Check that the preview did not accidentally include source-only material. The current automated tests do not replace this deployment test.

## Phase 2: choose the long-term update workflow

**Manual deployments** are simplest initially: edit content, run `npm run check`, and upload the new `dist/` folder. Source files remain under your control, with no Git knowledge required.

**Git-integrated deployments** are convenient for frequent updates: keep the source in a repository and connect it to a Pages project. Each pushed change is built automatically. The source repository may be private; the resulting site is public. Use these build settings:

```text
Framework preset: None
Build command: npm test && npm run check
Build output directory: dist
Environment variable: NODE_VERSION = 24
```

The source root contains `package.json`; do not set `dist` as the source root. No dependencies need to be installed for this generator. The generated `.gitignore` excludes `dist/` from Git, because the host rebuilds it.

A crucial Cloudflare distinction: a Direct Upload project cannot later be converted into a Git-integrated project. Create a new Git-integrated project when changing workflows. You are not locked into the hosting provider; this is a project-configuration limitation in its dashboard.

Official Git integration guide: https://developers.cloudflare.com/pages/get-started/git-integration/

Do not put raw full-resolution recordings into Git merely to make them play on the website. Upload them to a separate media host or object store and put their HTTPS URLs in video records. Check its bandwidth/storage charges separately. External caption tracks need appropriate cross-origin access headers; same-origin `.vtt` files avoid that complication. The static site does not provide transcoding or adaptive streaming.

Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/

## Phase 3: preserve all Wix-only documents

Do this **before changing DNS**, while `www.psoberon.com` still points at Wix:

```sh
npm run recover:wix
```

There are 27 documents in the migration manifest. The command downloads the whole set to the correct folders, resumes existing work, rebuilds the preview, and runs local checks. No individual file naming is needed. The original PDFs are not yet included in this package: browsing could read them, but direct downloads failed in the build environment. `migration/DOCUMENTS.html` retains manual links only as a fallback. Confirm the full CV and the current 111-page undergraduate notes in particular. The older 77-page archive copy is not a substitute for the current notes.

The importer records successful files and failures in `migration/download-report.json`. It will not treat an HTML error page as a PDF. A downloaded PDF should also be opened to confirm it is the intended document; a valid file signature alone cannot establish that.

Archive any other live-site assets or unpublished material you still need. The supplied original ZIP remains useful as a backup: this rebuilt site deliberately does not deploy every unused image, logo bundle, or older unrelated plot from it.

## Phase 4: content review and launch checks

Read `migration/CONTENT-REVIEW.md`. Confirm the biography, current courses, student associations, paper statuses, topic assignments, and any explanatory prose. The program cannot decide whether bibliographic information has changed since it was imported.

Set `approved: true` in `migration/owner-review.json`, and set `preview_noindex: false` in `content/site.json`. The configured canonical domain is `https://www.psoberon.com`. Keep it or deliberately change it before launch.

Run:

```sh
npm test
npm run check:launch
```

The launch check rebuilds the site and reports missing required PDFs, source validation errors, broken local links, files exceeding the selected host's limit, a remaining noindex flag, or an unapproved review. Fix the reported issues rather than just deleting the checks.

Deploy this final build to the host and repeat the browser checks. Now you are ready to connect the domain.

## Phase 5: point the domain to the new site

Domain registration, DNS service, and website hosting are separate functions. Moving the website does not require transferring domain registration at the same time. Do not cancel the domain registration or let it expire.

Before changing anything, save the current DNS configuration, especially MX records for email and TXT records for verification, SPF, DKIM, or DMARC. Also preserve any other subdomains. DNS changes should move the website without removing unrelated services.

For **www.psoberon.com**, Cloudflare Pages supports a subdomain without requiring Cloudflare to manage the entire DNS zone. In the Pages project, first add `www.psoberon.com` under Custom domains. Then follow its CNAME instructions at the current DNS provider. The record target is the actual `your-project.pages.dev` address, not an invented address from this guide. Cloudflare says the domain must be associated with the project in its dashboard before adding the CNAME.

For the apex **psoberon.com**, Cloudflare Pages requires the domain to be a Cloudflare zone with the corresponding nameserver configuration. This is broader than adding a `www` record: carefully migrate the existing DNS records first. Another practical arrangement is to make `www` canonical and configure an HTTPS-capable apex redirect at your DNS/hosting provider. The exact arrangement depends on your current registration and DNS services, which this build did not inspect.

Ensure both the apex and `www` ultimately work, and select one canonical hostname. This package does not guess your current nameservers or modify them. The local `_redirects` file handles old page paths; it is not a substitute for DNS configuration or a cross-domain hostname redirect.

Official custom-domain guide: https://developers.cloudflare.com/pages/configuration/custom-domains/

## Phase 6: confirm the move before changing Wix billing

Wait until HTTPS works on the chosen domain. Visit the homepage, publication catalog, several paper pages, and both CVs. Test old addresses including `/full-list`, `/student-activities`, `/more`, and an old PDF URL. On Cloudflare, `_redirects` supplies permanent redirects. Static hosts that ignore this file can still use the generated HTML fallback pages and legacy-path PDF copies, but the HTML fallbacks are not HTTP 301 responses.

Check that your email and unrelated subdomains still work. Check mobile navigation and a video on the real domain. Keep a backup of the old DNS settings, the complete source, and a known-good `dist/` build.

Only after confirming this should you turn off the Wix website-plan renewal you no longer need. Do not inadvertently turn off domain renewal or an email service you still use. The build performs no billing action.

## Costs and portability

No paid service is required by the website code. A mostly static academic site can fit within a hosting free tier, but free-tier conditions can change. Domain renewal remains separate, and independently hosted videos can incur storage/bandwidth costs. Verify pricing at deployment rather than treating this guide as a quote.

To change hosts later, copy the output files and configure the domain at the new host. Your canonical content remains the source JSON and Markdown, not a hosting provider's database. Keep the source even when using automatic hosting builds.

## Sources

The instructions above follow the official Cloudflare documents linked in the relevant sections. Related references:

- Redirect rules: https://developers.cloudflare.com/pages/configuration/redirects/
- Node supported release schedule: https://nodejs.org/en/about/previous-releases
- YouTube embedding and player requirements: https://developers.google.com/youtube/iframe_api_reference
- Structured-data policies: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- The optional llms.txt convention: https://llmstxt.org/
