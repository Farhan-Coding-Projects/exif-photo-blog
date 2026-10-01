// Cloudflare (OpenNext) adapter config
// No incremental cache yet: add an R2 bucket and r2IncrementalCache
// to persist ISR/unstable_cache, see https://opennext.js.org/cloudflare/caching
import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({});
