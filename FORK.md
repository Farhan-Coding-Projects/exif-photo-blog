# Fork notes

This repo is a fork of [sambecker/exif-photo-blog](https://github.com/sambecker/exif-photo-blog)
(remote: `upstream`) with the photo-graphy customizations layered on top.
**Upstream is the base; keep changes to upstream files as small as possible.**

## Syncing with upstream

```sh
git fetch upstream
git checkout main
git merge upstream/main
```

- `pnpm-lock.yaml` conflict: take upstream's and reinstall:
  `git checkout --theirs pnpm-lock.yaml && pnpm install`
- `git rerere` is enabled locally, so a conflict resolved once is
  replayed automatically next time
- Then run `pnpm tsc --noEmit`, `pnpm lint`, `pnpm test --watchAll=false`
  and `pnpm build`

## Where customizations live

Own files (never conflict):

- `src/location/`, `app/location/`, `app/admin/locations/`,
  `src/admin/AdminLocation*.tsx`: location collections
- `src/custom/`: small overrides, e.g. compact camera label
  (`Samsung Galaxy S25 Ultra` -> `S25 Ultra`) in the mobile top strip,
  and `PhotoCollections` (a photo's locations/albums in detail meta)
- `__tests__/location-path.test.ts`
- `wrangler.jsonc`, `open-next.config.ts`, `public/_headers`,
  `src/custom/sharp-unavailable.ts`: Cloudflare Workers
  hosting via OpenNext (`pnpm build` runs `build:cf` on Cloudflare CI via `WORKERS_CI`; `pnpm preview`, `pnpm deploy` locally)
- `public/favicon.ico`, `public/favicons/`, `app/manifest.ts`: branding
- `scripts/*r2*.mjs`: R2 migration/metadata scripts

Small hooks in upstream files (resolve conflicts by keeping upstream's
change and re-adding the hook):

| Feature | Upstream files touched |
| --- | --- |
| Location collections | `src/app/path.ts`, `src/cache/index.ts`, `src/category/{index,data,mobile,useCategoryCounts,CategoryIcon}.ts*`, `src/db/{index,query}.ts`, `src/photo/{actions,PhotoDetailPage,PhotoEditPageClient,UploadPageClient,PhotoGridSidebar,TopPhotoEntities}.ts*`, `src/photo/form/{index,PhotoForm}.ts*`, `src/admin/{AdminNav,AdminBatchUploadActions,AdminUploadsClient}.tsx`, `src/admin/select/*`, `src/cmdk/CommandKClient.tsx`, `src/library/data.ts`, `app/sitemap.ts`, admin edit/upload pages, `src/app/config.ts` (`SHOW_LOCATIONS`) |
| Locations/albums in photo detail meta | `src/photo/{PhotoDetailPage,PhotoLarge}.tsx`, `src/album/{query,cache}.ts` |
| Cloudflare Workers hosting (`CLOUDFLARE_BUILD=1` aliases, per-query pg client, font from ASSETS) | `next.config.ts`, `src/platforms/postgres.ts`, `src/app/font.ts`, `package.json`, `pnpm-workspace.yaml` (`allowBuilds`) |
| Phones open full view at `/` (redirect to `/full`), grid toggle targets `/grid` | `proxy.ts`, `src/photo/sort/path.ts` |
| Quicksand font | `tailwind.css` |
| Favicons, hydration warning fix | `app/layout.tsx` |
| Sort categories by count, hide single-photo categories | `src/category/data.ts`, `src/{camera,lens,tag,recipe,focal}/index.ts`, `src/film/index.tsx`, `src/photo/query.ts` |
| 3-column grid (incl. masonry on desktop) | `src/photo/{PhotoGrid,PhotoGridMasonry}.tsx` |
| Favorites (`favs` tag) first in every sort | `src/db/index.ts` (`getOrderByFromOptions`), `__tests__/postgres.test.ts` |
| Lens/camera label cleanup (Samsung, Sony, DJI) | `src/photo/form/server.ts`, `src/platforms/sony.ts`, `src/lens/index.ts`, `src/camera/index.ts` |
| Hide meta on mobile (`NEXT_PUBLIC_HIDE_FEED_META_ON_MOBILE`) | `src/photo/{PhotoLarge,PhotosLarge}.tsx`, `src/app/config.ts` |
| Camera make marks (Samsung, Sony, DJI, Canon); brand wordmarks across the blog (`NEXT_PUBLIC_SHOW_CAMERA_BRAND_LOGOS = 1`) | `src/camera/PhotoCamera.tsx`, `src/app/config.ts` |
| Upload error messages | `src/admin/{AddUploadButton,AdminUploadsTableRow}.tsx` |
| OG font fallback | `src/app/font.ts` |

## Local environment

- `.env.local` comes from the photo-graphy Vercel project
  (`vercel env pull` from `../photo-graphy`, then copy here). Values
  marked Sensitive on Vercel come back as `[SENSITIVE]` and must be
  filled in from a previous copy.
- `.env.production.local` sets `NEXT_PUBLIC_DOMAIN` for local
  `next build` only (Vercel provides its own URL vars).
