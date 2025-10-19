import { sheriff, type SheriffSettings, tseslint } from 'eslint-config-sheriff';

const sheriffOptions: SheriffSettings = {
  react: true,
  storybook: true,
  lodash: false,
  remeda: false,
  next: false,
  astro: false,
  playwright: false,
  jest: false,
  vitest: false,

  ignores: {
    recommended: true,
  },
};

const config: any /* Forgive Me Father For I Have Sinned */ = tseslint.config(
  sheriff(sheriffOptions),
  {
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow', // <-- we want to allow or ignore here
        },
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
);

export default config;

// import { defineConfig } from 'eslint/config';
// import { config } from 'typescript-eslint';
// import globals from 'globals';
//
// export default defineConfig([
//   {
//     ...sheriff(sheriffOptions),
//     languageOptions: {
//       globals: { ...globals.browser },
//     },
//   },
// ]);
