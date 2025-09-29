# json-filter-builder monorepo

This Nx workspace contains the `json-filter-builder` React library and a Next.js reference app that demonstrates it with live data.

- 📦 [`libs/filter-builder`](libs/filter-builder/README.md) — npm package documentation, API reference, and contributor guide.
- 🧪 [`apps/reference-app`](apps/reference-app/README.md) — demo application with installation steps, configuration notes, and architecture decisions.
- 🚀 Live demo: https://filter-builder-app.vercel.app
- 📘 npm package: https://www.npmjs.com/package/json-filter-builder

## Quick commands

```bash
# Install workspace dependencies
npm install

# Library quality gates
npx nx lint json-filter-builder
npx nx test json-filter-builder
npx nx build json-filter-builder --skip-nx-cache

# Reference app
npx nx dev @filter-builder-app/reference-app
NX_DAEMON=false npx nx run @filter-builder-app/reference-app-e2e:e2e
```
