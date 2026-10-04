# Testing and known limits — revision 2

## Reproducible tests

```sh
npm test
npm run check
```

The 32 tests in `tests/` cover the original content/schema/escaping/privacy/video rules and new shared-image dimensions, path validation, portrait settings, restored content, PDF header/end-marker checks, failure reporting, byte preservation, and resume behavior. Network download tests use controlled in-memory responses, not a successful live Wix download.

`npm run check` rebuilds and checks every local HTML href/src, PDF headers, and the documented 25 MiB hosting file limit. It does not check every external URL. `npm run check:launch` also requires all missing files, explicit owner approval, and the preview noindex flag switched off. The supplied preview is deliberately not launch-approved.

## Browser and server checks performed

`browser-test-report-v2.json` records 42 page/viewport combinations: Home, About, Publications, Research, Students, Videos, and a paper page at widths 320, 390, 768, 1024, 1440, and 1920 px. All decoded images and horizontal overflow were checked. The shared portrait was checked against its original aspect ratio.

Interaction checks verify that the background remains fixed while the foreground scrolls; small-screen and reduced-motion fallbacks; student filtering (17 of 63), title/coauthor search, empty results, and opening/closing the mobile menu. Six loopback HTTP routes were tested separately, including versioned JPEG URLs, the background, the local editor, and the JSON catalog.

The managed Chromium environment blocks navigation to both local file and HTTP URLs. Its policy was not changed. Rendering/interaction tests supplied the actual generated HTML with local assets inlined and images eagerly decoded for capture. The actual HTTP server was tested separately. This is not a claim of a full browser-navigation session or production deployment. Full-page screenshots capture a fixed layer only in its initial viewport; `screenshots/home-desktop-scrolled.png` shows the actual scrolled view.

The original v1 report is retained as `browser-test-report-v1.json`; it is historical, not evidence that every earlier scenario was rerun in v2. Current source and local-link results are `node-test-report.txt` and `local-check-report.txt`.

## Document retrieval

All 27 missing PDFs were opened by the browsing tool. The original binaries could not be saved by the execution/download tools. `migration/live-file-audit.json` distinguishes online readability from local recovery, and `migration/download-report.json` records the attempts in this environment. Run `npm run recover:wix` on your computer; no individual manual downloads are necessary if that run succeeds.

## Still to check before launch

Test the extracted preview and temporary hosted site in your own browsers and on your phone. Open the recovered current CVs, notes, and handouts. Check external links, embedding permissions for future videos, direct-video codecs and captions, DNS (including existing email records), both apex and www addresses, HTTPS, and old-path redirects. No domain, hosting-account, or billing changes were made here.
