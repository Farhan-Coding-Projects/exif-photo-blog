// Stand-in for `sharp` in Cloudflare Workers builds (native module
// can't run there); aliased in next.config.ts when CLOUDFLARE_BUILD=1
const sharpUnavailable = () => {
  throw new Error('sharp is not available on Cloudflare Workers');
};

export default sharpUnavailable;
