import js from '@eslint/js';

export default [
  { ignores: ['node_modules/**'] },
  js.configs.recommended,
  {
    files: ['calendar_to_call.js', 'calendar-demo.js'],
    languageOptions: {
      sourceType: 'script',
      globals: { document: 'readonly' },
    },
    rules: { 'no-console': 'error' },
  },
  {
    files: ['calendar-demo.js'],
    languageOptions: { globals: { setCalendar: 'readonly' } },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { __dirname: 'readonly' },
    },
  },
];
