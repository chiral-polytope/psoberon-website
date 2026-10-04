# Revision 2 — original artwork and personal details

Nothing has been published and the Wix site is unchanged. The paper catalog, metadata, videos, editor, and deployment workflow remain intact.

## View this version

Extract this ZIP into a new folder and open `START-HERE.html`. Choose **Open website preview**. No installation is required to browse. On a desktop-sized browser, scroll the Home and About pages to see the fixed background and the panels moving over it. The default width breakpoint is 1024 px. Mobile layouts do not use this layer. A reduced-motion preference also disables it.

Use `npm run dev` for editing and local-server testing. Visit `http://localhost:4321` and stop with Control+C. Before deploying, use `npm test` and `npm run check`.

## Changes

The exact attached `back.png` is used as the fixed desktop background. Opaque, off-white content panels keep text readable while allowing the drawing to show through their gaps and around the page. There is no JavaScript parallax effect.

The original **breaking-symmetries** illustration, recovered from the original Wix ZIP, now has a prominent section directly below the introduction. The full image is displayed without cropping.

The About page restores **Institutions close to my heart**, with UNAM, UCL, Michigan, and Northeastern; the education details and supplied UNAM/UCL logos; the attached **La Soberonita** photograph and the explanation about your grandfather; and the complete Hilbert quotation used on the original site. The biography is taken from the original site rather than the earlier draft. Source: https://www.psoberon.com/cv-about-me .

The extra `brancusi.jpeg` is preserved, unchanged, in `source-assets/`. It has not been put on a page or given an invented caption, and it is not copied into the deployed website.

## Replace the portrait once

The attached portrait is now the canonical source:

```text
public/images/portrait.jpg
```

Replace that file with a new JPG using the same name. Run `npm run build`, or save it while `npm run dev` is running. The Home portrait, About portrait, and social-image metadata update together. The image is displayed at its full aspect ratio rather than cropped to the previous photograph's proportions.

The shared setting is in `content/site.json`:

```json
"portrait": "/images/portrait.jpg"
```

To use a different filename or PNG/WebP format, put that image in `public/images/` and change this one setting. Build-time image dimensions and a content hash are calculated from this single source. Changing its bytes changes the image's versioned URL, reducing stale browser caching after deployment. Other services may still cache their own link previews.

Do not edit the generated copy in `dist/images/`. A local edit changes only the local site until you redeploy `dist/`.

## Edit the restored material

| Item | Editable source |
| --- | --- |
| Portrait, background path, homepage-artwork title/caption/path | `content/site.json` |
| Biography | `content/pages/about.md` |
| Institutions, education, sculpture caption, Hilbert quotation | `content/about-details.json` |
| Desktop layout and breakpoint | `public/assets/site.css` (Revision 2 section) |
| Images | `public/images/` |

## Missing documents

All 27 document URLs were readable as PDFs through the browsing tool, but their original bytes could not be downloaded into this package. The visual revision is complete; the PDF backup is **not** complete. See `migration/RECOVERY-STATUS.md` and `migration/live-file-audit.json`.

Run this one command from the source folder while the old site is still live:

```sh
npm run recover:wix
```

It downloads the set into the right folders, resumes safely, rebuilds local links, and checks the result. The Mac launcher `RECOVER-WIX-DOCUMENTS.command` does the same thing. Nothing needs to be downloaded and named individually. Do not leave Wix until the report says 27/27 and the launch checklist has been completed.

## Testing

Revision 2 passes 32 source tests and the local output-link checks. Browser checks cover 42 page/viewport combinations at widths 320, 390, 768, 1024, 1440, and 1920; the fixed layer under scrolling; its mobile/reduced-motion fallback; uncropped portrait ratios; catalog filtering; and mobile-menu interactions. Actual loopback HTTP serving was checked separately.

The managed browser blocks file/HTTP navigation, so the render and interaction checks used the actual generated HTML with local assets inlined, without changing that policy. The HTTP server was tested separately. This is not a claim of an end-to-end hosted deployment, successful original-PDF downloads, or external video playback. See `docs/TESTING.md`.
