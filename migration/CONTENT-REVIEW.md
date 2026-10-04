# Content and migration review — 3 October 2026

This is an imported editorial draft, not a claim that every bibliographic detail has been independently reconciled against the publisher. The source records remain editable. Nothing has been deployed.

## What was imported

63 unique paper records from the live full publication list, checked against the publicly linked CV and topical/student pages where useful. The dataset contains 17 student-coauthored papers, 9 overlapping topic classifications, and 50 distinct coauthors other than Pablo. Each record has source URLs and an import date in the source file; these provenance fields are not automatically displayed on the public site.

Three talk listings were carried over from the Slides/seminars page. Two have slide PDFs. No paper-explanation recordings were supplied. No YouTube IDs or video URLs have been fabricated.

The homepage portrait and mathematical illustrations come from the uploaded archive. Raster images used by the site were optimized into WebP. The original archive should still be retained. Unused images, old coronavirus plots, nested logo bundles, and other unrelated items were not put on the public website. See `asset-inventory.csv` for the complete extracted-file inventory.

## PDF availability and the notes mismatch

27 current Wix-hosted documents are recorded in `remote-assets.json` and the clickable `DOCUMENTS.html`. Their bytes were not available locally during the build, so links temporarily point to the existing site. Download them before moving the domain.

The local `Discrete_Geometry_for_Undergraduate_Students.pdf` has 77 pages; its PDF metadata has a January 2022 timestamp. The current live notes link points to a 111-page PDF. The older file is explicitly retained as a local archive, not represented as the current manuscript. The new site uses the live notes URL until the current PDF is downloaded to the designated destination.

The site labels its CV links without repeating the old page's "June 2026" label: the linked full CV contains later 2026 material, so that old label is not a reliable revision date. Both full and short CV files require downloading.

## Decisions requiring the owner's review

- **Paper year versus publication year.** The original full-list year generally determines the catalog grouping. In particular, the complex Tverberg–Vrećica paper was listed under 2024 while its journal reference is dated 2026; its record preserves the list year and separately records publication_year=2026. Decide whether the complete catalog should instead use publication years.
- **Partitions of mass assignments with spheres and wedges.** The full list and other pages had inconsistent status text. The imported record uses the explicit accepted-in-European-Journal-of-Combinatorics status from the student/topic material. Confirm the latest reference.
- **On a Problem by Dol'nikov.** Alexander Magazinov was included using the CV, even though the full-list entry omitted that coauthor. Confirm the canonical author list/order.
- **Fixed-direction mass partitions.** The imported journal page range follows the full list/CV. A different page range appeared in another indexed source; check the publisher reference before signoff.
- **High-dimensional envy-free partitions.** The website gives 19 pages; the CV appeared to give a different page count. The live publication-list reference was retained.
- **Blank status fields.** Empty statuses were normalized to "preprint", not guessed as accepted or published. "Submitted" was retained where explicitly stated. Change statuses that have moved on.
- **Frick–Soberón 2020 preprint.** The public arXiv v2 comments for `2005.05251` explicitly report a gap in the proof of Theorem 1.1. The new paper page includes a narrowly worded author-correction notice and does not assert the original main theorem as established. This is not a withdrawal label or a claim that the entire paper is unusable. Review the exact presentation.
- **Student coauthors.** Associations combine the student page, CV, and collaborator markers. They refer to the relationship on the paper, not the person's present career stage. Confirm all 17 associations, spelling, and author order.
- **Topics.** The taxonomy is an editorial proposal, not a new mathematical classification claim. Papers may have multiple topics. Review assignments and the descriptions of the nine topics, particularly newer themes outside the old category pages.
- **Selected work.** Featured records largely follow the existing selected-work section. They are not a ranking and are independent of date-based recent work.

## Prose and omitted content

The research overview, mentoring overview, topic descriptions, and streamlined About page are new draft copy based on the public site and CV, not verbatim preservation of every sentence. Review voice and emphasis. A few recent papers have short source-based summaries; only four have imported plain-text abstracts. Other paper pages link to the source abstract rather than fabricating one.

The preliminary source uses Unicode/plain mathematics. It does not yet render LaTeX expressions in abstracts. A full typesetting library can be added later, but is not required to maintain the current site.

The original contact form was replaced by a working email link; a static site has no mail-submission backend. There is no inert form pretending to send a message. Current/recent courses come from the public CV and should be confirmed. No tentative future REU dates were promoted to confirmed events. The BUGCAT date and location were checked against the event's own page.

The collaborator directory computes joint-paper counts; it does not reproduce potentially stale institutional affiliations. Some original reading-list entries have no retained external link and remain identifiable bibliographic entries. Optional author-context/significance fields are empty pending the owner's own wording. The research-notes collection is empty; it is distinct from publications.

No artwork attribution, PDF redistribution license, or rights claim was invented. Retain the originals and confirm which illustrations you want displayed publicly.

## Main sources used

- https://www.psoberon.com/
- https://www.psoberon.com/full-list
- https://www.psoberon.com/research
- https://www.psoberon.com/student-activities
- https://www.psoberon.com/collaborators
- https://www.psoberon.com/cv-about-me
- https://www.psoberon.com/more
- https://www.psoberon.com/teaching
- https://www.psoberon.com/putnam-resources
- https://www.psoberon.com/other-publications
- https://www.psoberon.com/esp
- https://www.psoberon.com/must-read
- Full CV: https://www.psoberon.com/_files/ugd/fca340_5a43d1671b0d488ab14ef5d355d40069.pdf
- Current geometry notes: https://www.psoberon.com/_files/ugd/fca340_c979e3fe622348a2bebdf354058f1ee0.pdf
- Correction notice: https://arxiv.org/abs/2005.05251v2
- BUGCAT: https://sites.google.com/binghamton.edu/bugcat-website/home

The exact paper/arXiv sources are also recorded in the individual JSON files. Sources were read on 3 October 2026. This is not an exhaustive publisher-by-publisher bibliography audit.

## Signoff

After reviewing and changing the source as appropriate, set `approved` to `true` and fill in `reviewed_on` in `owner-review.json`. Download and inspect the required PDFs. Then follow the README and run `npm run check:launch`. Do not treat the default review file as an approval.


## Revision 2

Original About-page biography, institutions, education, Soberonita explanation, and Hilbert quotation restored from https://www.psoberon.com/cv-about-me . Added the user-supplied portrait and fixed background, and the original breaking-symmetries illustration. The new personal sections are editable in `content/about-details.json`. All 27 original PDF links were rechecked as online-readable; their bytes are not saved in this package. This does not change the owner-approval flag.
