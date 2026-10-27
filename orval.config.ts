import { defineConfig } from 'orval';

// Контракт приходит из корня монорепо: cd server && pnpm openapi:export
// (или из корня: pnpm api:generate). Руками openapi.json не редактируем.
export default defineConfig({
  admin: {
    input: '../openapi.json',
    output: {
      target: './src/shared/api/generated/api.ts',
      schemas: './src/shared/api/generated/model',
      client: 'react-query',
      mode: 'tags-split',
      mock: false,
      clean: true,
      prettier: false,
      override: {
        mutator: {
          path: './src/shared/api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
