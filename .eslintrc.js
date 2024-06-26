module.exports = {
  root: true,
  globals: {
    __static: 'readonly'
  },
  env: {
    node: true
  },
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  plugins: ['@typescript-eslint'],
  rules: {
    'no-constant-condition': 'off',
    'no-empty': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    indent: 'off',
    'no-async-promise-executor': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': [
      'error',
      {},
      {
        usePrettierrc: true
      }
    ]
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        'no-undef': 'off' // https://typescript-eslint.io/docs/linting/troubleshooting/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      }
    }
  ],

  ignorePatterns: ['src/**/*.d.ts']
}
