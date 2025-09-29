# Reference App · json-filter-builder Playground

This Next.js app showcases `json-filter-builder` in action. It ships with playground data plus two live integrations (Fake Store products and Escuela users) so you can see the filter builder operating against real APIs.

---

## Installation & Usage

# from the workspace root

npm install
npx nx dev @filter-builder-app/reference-app

The dev server runs at http://localhost:3000.

## Routes

/ — Mock “people” dataset for quick experimentation.
/products — Live data from https://fakestoreapi.com/products.
/users — Live data from https://api.escuelajs.co/api/v1/users/.

## Useful scripts

npx nx dev @filter-builder-app/reference-app
npx nx build @filter-builder-app/reference-app
npx nx lint @filter-builder-app/reference-app
NX_DAEMON=false npx nx run @filter-builder-app/reference-app-e2e:e2e

### Configuration API

The app demonstrates three integration points with the library:

**Field schemas** — each page defines a schema mapping dataset fields to operators, populated via helpers in json-filter-builder/schema (products/page.tsx, users/page.tsx).
**Client components** — ProductFilterClient and UserFilterClient pass fields, onJsonChange, onSerialize, and apiConfig to <FilterBuilder />, showing client-side filtering plus serialized outputs.
**API requests** — buildRequest from useFilterBuilder() yields ready-to-send GET/POST requests when you need to hit remote services.

## Architecture Decisions

| Decision                 | Why                                                                             | Files                                        |
| ------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------- |
| Nx monorepo              | Consolidate build/lint/test tooling with the library.                           | `nx.json`, root `package.json`               |
| Next.js App Router       | Mix server and client components, use native `fetch`, incremental revalidation. | `apps/reference-app/src/app/**`              |
| Tailwind styling         | Align with library defaults; easy to theme.                                     | `tailwind.config.js`                         |
| Live API data            | Real-world schemas derived from API responses.                                  | `products/page.tsx`, `users/page.tsx`        |
| Minimal Playwright smoke | Ensure the landing page renders across browsers.                                | `apps/reference-app-e2e/src/example.spec.ts` |

## Project Structure

```
apps/reference-app/
├── src/app/
│ ├── page.tsx # Playground landing
│ ├── products/
│ │ ├── page.tsx # Server component fetching products
│ │ └── product-filter-client.tsx # Client component using FilterBuilder
│ └── users/
│ ├── page.tsx
│ └── user-filter-client.tsx
├── tailwind.config.js
├── next.config.js
└── package.json
```

## Extending the demo

Add new datasets under src/app/<your-dataset> and reuse the FilterBuilder client pattern.
Expand the Playwright suite for deeper regression coverage.
Capture screenshots or short videos when proposing UI changes so reviewers see the impact instantly.

## Contributing

The reference app’s purpose is to demonstrate the library. Keep contributions focused on clarity and maintainability:

Use Tailwind classes that align with the library’s styling principles.
Avoid duplicating logic—compose with the library components wherever possible.
Run nx lint, nx build, and the Playwright smoke test before submitting PRs.
