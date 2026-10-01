// Cloudflare (OpenNext) adapter config
// No incremental cache yet: add an R2 bucket and r2IncrementalCache
// to persist ISR/unstable_cache, see https://opennext.js.org/cloudflare/caching
import { defineCloudflareConfig } from '@opennextjs/cloudflare';

const config = {
  ...defineCloudflareConfig({}),
  // `pnpm build` runs this OpenNext build on Cloudflare CI, so call
  // next directly to avoid recursion
  buildCommand: 'pnpm exec next build',
};

export default config;
