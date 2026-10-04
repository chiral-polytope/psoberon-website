# Wix document recovery — revision 2

All **27 manifest URLs were opened successfully as PDFs** through the web browsing tool during this revision. The audit records the exact URLs, source pages, and observed page counts in `live-file-audit.json`.

**The original PDF files were not saved in this package.** Direct download attempts failed in the file-execution environment. Online readability is not the same as having a usable local backup. There are no placeholder/reconstructed PDFs posing as the originals.

From the source folder, run:

```sh
npm run recover:wix
```

This single command attempts every download, validates the PDF header and end marker, saves the bytes in the correct folders, records SHA-256 checksums, rebuilds the site, and checks local links. It skips valid files already present. It reports failures and can be rerun to resume. Invalid existing files are left untouched and reported. Header/end-marker checks do not replace opening the files to inspect them.

On a Mac, `RECOVER-WIX-DOCUMENTS.command` launches the same process when Node.js is installed. If macOS does not allow opening the downloaded launcher, use the Terminal command above; no security settings need to be changed.

`migration/download-report.json` is updated after every completed item. The included report records failures in this environment; your run replaces it with your actual results. A successful run reports **27/27 documents available locally**. Do not change DNS or cancel Wix before that, and open the CVs and notes once to confirm they are the intended versions.

The current notes are 111 pages; the 77-page supplied copy remains separately labeled as an archive. The live full CV is 11 pages, and the short CV is 3. The source filenames are preserved as old-path copies/redirects after successful recovery so incoming document links can continue to work.

This procedure saves files into this project only. It does not edit the live site, upload anything, change domain settings, or cancel a subscription.
