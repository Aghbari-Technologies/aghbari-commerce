import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

type BuildEnv = Record<string, string | undefined>;

const buildMetadataPlugin = (): Plugin => ({
  name: 'aghbari-build-metadata',
  generateBundle() {
    const env = ((globalThis as typeof globalThis & { process?: { env?: BuildEnv } }).process?.env ?? {}) as BuildEnv;
    const gitSha = env.VERCEL_GIT_COMMIT_SHA || env.GITHUB_SHA || env.VITE_BUILD_SHA || 'unknown';
    const version = env.npm_package_version || '0.1.0';
    const builtAt = new Date().toISOString();
    this.emitFile({
      type: 'asset',
      fileName: 'build-meta.json',
      source: JSON.stringify({
        product: 'aghbari-commerce',
        version,
        git_sha: gitSha,
        built_at: builtAt,
      }, null, 2) + '\n',
    });
  },
});

export default defineConfig({
  plugins: [react(), buildMetadataPlugin()],
  server: { host: true, port: 5173 },
  build: { sourcemap: true },
});
