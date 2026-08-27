# Jason Liao — Academic Portfolio

English-first, bilingual academic and engineering portfolio for Jason Liao. The site presents robotics research, engineering systems, academic work, leadership, teaching, and public artifacts through a single evidence-based content model.

## Local development

```bash
npm install
npm run dev
npm run lint
npm test
```

The public site uses unprefixed English routes and matching Traditional Chinese routes under `/zh`. Legacy `/en/...` and approved coursework aliases redirect permanently to their canonical routes.

## Content and media

- `lib/content-data.ts` is the bilingual public content registry.
- `lib/media-manifest.json` maps sanitized, deduplicated public images and documents to their public pages without exposing source-governance metadata.
- `lib/course-record.json` is the bilingual, visitor-safe derivative behind the complete course-record page; `scripts/generate-course-record.mjs` rebuilds it from the authoritative local academic summary without deploying that source file.
- `lib/event-public-details.json` and `lib/coursework-public-details.json` preserve the complete approved bilingual website narratives used by detail pages.
- `lib/videos.ts` maps the twelve canonical YouTube uploads to page-level click-to-load players.
- `scripts/build_public_assets.py` rebuilds metadata-clean public derivatives without modifying source material.
- `scripts/build_public_course_record_pdf.py` creates the designed bilingual course-record PDF and its public preview formats.

To rebuild public media on another computer, install the pinned media-tooling ranges first:

```bash
python -m pip install -r scripts/requirements-media.txt
python scripts/build_public_assets.py
```

HEIC files are decoded with `pillow-heif` so tiled iPhone originals are reconstructed at their full dimensions rather than reduced to a single preview tile.

The public information architecture includes focused Research, Projects, Academics, Leadership, Writing, About, and Contact collections plus `/archive`, a university-first index of every public record. High-school and earlier foundations remain complete in the later sections of that index.

## Trusted Access

The invited-materials route requires server-side environment variables:

- `TRUSTED_ACCESS_PASSWORD`
- `TRUSTED_SESSION_SECRET` (at least 32 bytes)

No restricted originals are included in the public bundle. Runtime values are configured through Sites secrets, never committed to this repository.

## Deployment

The Sites project binding lives in `.openai/hosting.json`. Validate with `npm test`, package the current committed source with the bundled Sites packaging script, save a version, deploy privately for verification, and then explicitly publish its access policy.

For the complete local recovery inventory and re-publication procedure, see [LOCAL_RECOVERY.md](./LOCAL_RECOVERY.md).
