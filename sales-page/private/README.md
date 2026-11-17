# Private NOBODY RUNS deliverable

This folder holds the paid NOBODY RUNS zip for the gated `/api/nr-download` function.

The zip is **not** committed to the public git repository (see `.gitignore`). To include it in a Vercel deployment that uses `includeFiles`, place this file here on the machine that runs the deploy:

`private/nr90d-axo6m5bcfa1j.zip`

Git auto-deploys from GitHub will not have the file until it is stored in a private Vercel Blob (or a similar private store) instead. Do not add the zip under `public/` as a new path.
