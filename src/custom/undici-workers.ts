// Stand-in for `undici` in Cloudflare Workers builds: its HTTP parser
// compiles WebAssembly at runtime, which Workers forbids. Workers
// already provides these as globals. Aliased in next.config.ts
export const {
  fetch,
  Headers,
  Request,
  Response,
  FormData,
  File,
} = globalThis;

const undici = { fetch, Headers, Request, Response, FormData, File };

export default undici;
