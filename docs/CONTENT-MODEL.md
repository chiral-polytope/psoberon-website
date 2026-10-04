# Content model

## Paper records

Each `content/papers/ID.json` is canonical. Required fields: `id`, `title`, `authors` (nonempty array), integer `year`, `status` (`preprint`, `submitted`, `accepted`, `published`), `type` (`research`, `survey`), `topics` (array of central topic IDs), and `student_authors` (array of exact names from `authors`). The filename must equal `id.json`.

Optional bibliographic/display fields: `date` (YYYY-MM-DD), `publication_year`, `reference` (free text), `arxiv` (ID only), `doi` (identifier only), `pdf`, `summary`, `abstract`, `image`, `image_alt`, `resources` (objects with `label` and `url`), `related_papers` (IDs), `notice`, `notice_source`.

`featured: true` puts a record among representative papers. `draft: true` excludes it from pages and feeds. Drafts still need to be syntactically valid and pass the schema, so an accidental typo is not silently deferred until publication.

The catalog sorts by year descending, then `sort_order` ascending, then date descending and title. Imported values preserve the website's order within a year. A new record defaults to `sort_order: 0`; edit this number to control position among papers in the same year. Use a lower number to move a paper earlier. The homepage shows the first four records in this order.

`agent_note` contains explicitly author-written context. Only a nonempty note is exported. `methods` and `related_problems` are machine-oriented arrays. These are public fields. `_file`, `source_urls`, `imported_on`, and arbitrary extra properties are not exported by the machine-feed allowlist. They are still present in a source repository, so keep that repository private when it contains unpublished source material.

No publication database or external API is queried during the build. Changing an arXiv or journal reference on another website does not silently update your record. This prevents unreviewed remote changes but means the bibliography still needs editorial maintenance.

## Video records

A record in `content/videos/` has an ID, title, integer year, optional date/event/description, `kind` (`talk` or `paper-explainer`), `papers` (array of associated public paper IDs), `topics`, and `draft`.

`video` can be null for a slides-only talk, or one of:

```json
{"type":"youtube","id":"abcdefghijk"}
```

The ID above is a format example, not a real recording to publish.

```json
{
  "type": "file",
  "url": "https://your-media-host.example/explanation.mp4",
  "mime": "video/mp4",
  "poster": "/images/explanation-poster.webp",
  "captions": [
    {"url":"/files/captions/explanation-en.vtt","language":"en","label":"English"}
  ]
}
```

```json
{"type":"link","url":"https://your-recording-host.example/talk"}
```

`slides` holds an ordinary URL/path. `slides_asset` is used for imported Wix assets and refers to an ID in the migration manifest. For a new talk, use `slides` rather than editing the migration manifest. If replacing an imported talk's slides URL, clear its `slides_asset` field in the complete JSON record; otherwise that legacy field takes priority.

The association is canonical in the video record, not copied into each paper. One recording may point to several papers. The topic page uses video topics, so fill those in as well as paper associations. There are no fake recordings in the initial catalog.

## Notes

Each `content/notes/ID.json` has `id`, `title`, `date`, `kind`, `topics`, `summary`, `body`, optional `pdf`, optional `disclaimer`, and `draft`. Notes generate separate pages and never enter the paper catalog. The body accepts the small Markdown subset documented in the README.

## Files and source

`public/` is copied unchanged into `dist/`. A file at `public/images/figure.webp` is linked as `/images/figure.webp`. Avoid spaces and use stable lowercase filenames. An uploaded file is not resized or optimized automatically; resize large images before adding them. The original supplied figures were optimized during this migration.

All JSON is UTF-8. Arrays use square brackets; strings use double quotes. The local editor handles these details. `npm run check` gives the filename and validation issue for malformed content. The complete schema checks are in `src/data.mjs`, and the generated page templates are in `scripts/build.mjs`.


## Shared images and personal About sections

`content/site.json` has one `portrait` path for all portrait uses, one `desktop_background` path, and a `home_artwork` object (`image`, `alt`, `title`, `caption`). Shared paths must be local `/images/` paths. `src/images.mjs` reads PNG/JPEG/WebP dimensions and adds a content-hash query string at build time. Source image files are not cropped or retouched. A new portrait at the same source path updates Home, About, and social metadata after rebuilding; redeploying is still necessary for the live site.

`content/about-details.json` contains `institutions`, `education`, `soberonita`, and `quote`. The biography remains in `content/pages/about.md`. These records deliberately preserve the original site's personal material rather than treating it as disposable design filler.
