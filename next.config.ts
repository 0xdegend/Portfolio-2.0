import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled because React StrictMode double-mounts components in dev, which
  // makes R3F call forceContextLoss() on a throwaway WebGL context. The
  // `postprocessing` EffectComposer then crashes in addPass reading
  // getContextAttributes().alpha on the dead context ("Cannot read properties
  // of null (reading 'alpha')"). StrictMode never runs in production anyway.
  reactStrictMode: false,
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
