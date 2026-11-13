import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // IIS forwards requests to the Node service as localhost:4400, so Next sees a different host than the
      // browser's "origin" header and blocks every form post. These are the public addresses it should trust.
      allowedOrigins: ["localhandsandfeet.org", "www.localhandsandfeet.org", "lhf-new.blocktrustnetwork.com"],
    },
  },
};

export default nextConfig;
