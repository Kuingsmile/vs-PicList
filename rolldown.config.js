import { readFileSync } from 'node:fs'
import { isBuiltin } from 'node:module'
import path from 'node:path'

import { defineConfig } from 'rolldown'

const fromRoot = file => path.resolve(import.meta.dirname, file)
const isWatch = process.argv.includes('--watch') || process.argv.includes('-w')

export default defineConfig({
  input: fromRoot('src/extension.ts'),
  platform: 'node',
  tsconfig: fromRoot('tsconfig.json'),
  preserveEntrySignatures: 'strict',
  external: id => id === 'vscode' || isBuiltin(id),
  checks: { bundlerTimings: false },
  watch: { watcher: { usePolling: true, compareContentsForPolling: true } },
  // Unresolved imports would otherwise become dependencies missing from the VSIX.
  onwarn(warning, warn) {
    if (warning.code === 'UNRESOLVED_IMPORT') throw new Error(warning.message)
    warn(warning)
  },
  transform: { target: 'es2022' },
  plugins: [
    {
      name: 'clipboard-scripts',
      load: {
        filter: { id: /\.(applescript|ps1|sh)$/ },
        handler(id) {
          // Normalize paths so the Windows watcher detects script changes.
          this.addWatchFile(id.split(path.sep).join('/'))
          return { code: `export default ${JSON.stringify(readFileSync(id, 'utf8'))}`, map: { mappings: '' } }
        },
      },
    },
    {
      name: 'vscode-watch-status',
      buildStart() {
        if (isWatch) console.log('[watch] build started')
      },
      writeBundle() {
        if (isWatch) console.log('[watch] build finished')
      },
    },
  ],
  output: {
    file: fromRoot('dist/extension.js'),
    format: 'esm',
    codeSplitting: false,
    sourcemap: true,
    minify: false,
  },
})
