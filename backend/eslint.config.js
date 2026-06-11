const js = require('@eslint/js');
const globals = require('globals');

// Minimal flat config — a regression tripwire, not a style overhaul. Catches
// undefined references and unused bindings across the CommonJS backend.
module.exports = [
  { ignores: ['node_modules/**', 'public/**', 'uploads/**', 'prisma/migrations/**'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
