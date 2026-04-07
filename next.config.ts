import type { NextConfig } from "next";

const emptyStub = "./src/lib/stubs/empty.js";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // Axios imports Node.js builtins in its http adapter.
      // These don't exist in browser — stub them for client bundles.
      http2: { browser: emptyStub },
      zlib: { browser: emptyStub },
      stream: { browser: emptyStub },
      "follow-redirects": { browser: emptyStub },
    },
  },
};

export default nextConfig;
