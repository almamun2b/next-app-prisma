import { z } from "zod";

/**
 * Zod v4 probes `new Function()` to enable its JIT. Our CSP forbids eval, so
 * opt out explicitly — avoids a CSP violation report in every browser.
 * Import `z` from here, not from "zod", in code that can run on the client.
 */
z.config({ jitless: true });

export { z };
