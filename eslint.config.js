import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import jsonc from 'eslint-plugin-jsonc'
import pluginPrettier from 'eslint-plugin-prettier/recommended'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginUnicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const jsFiles = ['**/*.{js,jsx,mjs,cjs}']
const tsFiles = ['**/*.{ts,tsx,mts,cts}']
const jsoncFiles = ['**/*.jsonc', '**/tsconfig.json', '**/tsconfig.*.json', '**/.vscode/*.json']
const unusedVarsOptions = {
  varsIgnorePattern: '^_',
  args: 'all',
  argsIgnorePattern: '^_',
  caughtErrors: 'all',
  caughtErrorsIgnorePattern: '^_',
}

export default defineConfig(
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/out/**',
    '**/coverage/**',
    '**/.vscode-test/**',
    'release/**',
  ]),
  {
    name: 'vs-piclist/code',
    files: [...jsFiles, ...tsFiles],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      unicorn: pluginUnicorn,
    },
    rules: {
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-module': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      eqeqeq: 'error',
      'no-caller': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-eval': 'error',
      'no-extra-bind': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-throw-literal': 'error',
      'no-undef-init': 'error',
      'no-unused-vars': ['error', unusedVarsOptions],
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'prefer-object-spread': 'error',
      'unicode-bom': ['error', 'never'],
      'no-debugger': 'error',
      // Preserve the existing extension's rule exceptions.
      'no-async-promise-executor': 'off',
      'no-case-declarations': 'off',
      'no-cond-assign': 'off',
      'no-control-regex': 'off',
      'no-empty': 'off',
      'no-extra-boolean-cast': 'off',
    },
  },
  {
    name: 'vs-piclist/jsx',
    files: ['**/*.jsx'],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    name: 'vs-piclist/typescript',
    files: tsFiles,
    extends: [tseslint.configs.recommended, tseslint.configs.stylistic],
    rules: {
      'no-undef': 'off', // TypeScript checks undefined names.
      '@typescript-eslint/no-unused-vars': ['error', unusedVarsOptions],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  {
    name: 'vs-piclist/commonjs',
    files: ['**/*.{cjs,cts}'],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      'unicorn/prefer-module': 'off',
    },
  },
  {
    name: 'vs-piclist/esm',
    files: ['**/*.{js,mjs,mts}'],
    rules: {
      'no-restricted-globals': ['error', '__filename', '__dirname', 'require', 'module', 'exports'],
    },
  },
  {
    name: 'vs-piclist/json',
    files: ['**/*.json', '**/.prettierrc'],
    ignores: jsoncFiles,
    extends: [jsonc.configs['recommended-with-json'], jsonc.configs.prettier],
    language: 'jsonc/json',
  },
  {
    name: 'vs-piclist/jsonc',
    files: jsoncFiles,
    extends: [jsonc.configs['recommended-with-jsonc'], jsonc.configs.prettier],
    language: 'jsonc/jsonc',
  },
  {
    name: 'vs-piclist/json5',
    files: ['**/*.json5'],
    extends: [jsonc.configs['recommended-with-json5'], jsonc.configs.prettier],
    language: 'jsonc/json5',
  },
  {
    files: ['tsconfig.json'],
    rules: {
      'jsonc/sort-keys': ['error', 'asc', { caseSensitive: false, natural: true }],
    },
  },
  // Keep Prettier last so it disables conflicting formatting rules.
  pluginPrettier,
)
