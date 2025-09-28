# json-filter-builder <br/>_Schema-first React filter UI toolkit_

`json-filter-builder` lets you ship a production-ready query builder without writing bespoke condition editors, tree reducers, or serialization logic. Define the fields and operators your API understands, render the builder, and receive clean JSON and query-string payloads that work with any backend.

## Quick links

- 🚀 **Live demo** (Next.js reference app): https://filter-builder-app.vercel.app
- 📦 **npm**: [`json-filter-builder`](https://www.npmjs.com/package/json-filter-builder)
- 🧠 **API docs**: jump to [Usage](#usage) and [API Reference](#api-reference)

## Highlights

- **Schema driven** – supply your field catalog once; the client UI, validation rules and serialization all derive from it.
- **Nested groups out of the box** – unlimited `AND`/`OR` depth with accessible keyboard navigation.
- **Spec-compliant JSON** – emits `{and:[...]}` and `{or:[...]}` structures, plus a prebuilt `buildFilterRequest()` helper for GET/POST integrations.
- **Server-safe helpers** – import `json-filter-builder/schema` inside `getStaticProps`/app router loaders without pulling in client hooks.
- **Framework friendly** – battle-tested with Next.js 15 / React 19, but works anywhere React runs.
- **Batteries included UI** – Tailwind-friendly components that you can swap or style via props.

## Installation

```bash
npm install json-filter-builder
# or
yarn add json-filter-builder
```

If you need the schema helpers (usable in Node/server contexts) install once and import from the `/schema` entry:

```ts
import { BASE_OPERATORS } from 'json-filter-builder/schema';
```

## Usage

### 1. Describe your dataset

```ts
import {
  BASE_OPERATORS,
  type Field,
} from 'json-filter-builder/schema';

export const productFields: Field[] = [
  {
    id: 'title',
    label: 'Title',
    type: 'string',
    operators: [
      BASE_OPERATORS.contains,
      BASE_OPERATORS.starts_with,
      BASE_OPERATORS.eq,
    ],
  },
  {
    id: 'price',
    label: 'Price',
    type: 'number',
    operators: [
      BASE_OPERATORS.gt,
      BASE_OPERATORS.lt,
      BASE_OPERATORS.between,
    ],
  },
  {
    id: 'category',
    label: 'Category',
    type: 'enum',
    options: [
      { value: 'books', label: 'Books' },
      { value: 'toys', label: 'Toys' },
    ],
    operators: [BASE_OPERATORS.eq, BASE_OPERATORS.neq],
  },
];
```

### 2. Render the builder

```tsx
import {
  FilterBuilder,
  type FilterJSON,
  type FilterBuilderApiConfig,
} from 'json-filter-builder';

const apiConfig: FilterBuilderApiConfig = {
  mode: 'get',
  url: '/api/products',
  paramName: 'filters',
};

export function ProductBuilder() {
  return (
    <FilterBuilder
      fields={productFields}
      debounceMs={200}
      onJsonChange={(json: FilterJSON) => console.log(json)}
      onSerialize={(qs) => console.log(qs)}
      apiConfig={apiConfig}
    />
  );
}
```

### 3. Consume the results

`FilterBuilderProvider` emits three flavors of output:

- `onChange(node)` → raw filter tree for low-level control.
- `onJsonChange(json)` → spec-compliant JSON ready for POST bodies.
- `onSerialize(queryString)` → URL-safe string, e.g. `filters=%7B%22and%22...%7D`.

Or grab the context methods anywhere inside the tree:

```ts
const { toJson, toQueryString, buildRequest } = useFilterBuilder();

const request = buildRequest({ mode: 'post', url: '/api/search' });
await fetch(request.url, request.init);
```

## API Reference

### Components & Hooks

| Export | Description |
| --- | --- |
| `FilterBuilder` | High-level component that bundles provider + UI shell. |
| `FilterBuilderProvider` | Lower-level provider when you want to supply custom shells. |
| `useFilterBuilder()` | Returns `{ schema, state, issues, dispatch, toJson, toQueryString, buildRequest }`. |
| `FilterGroup`, `FilterCondition`, `OperatorPicker`, `ValueEditor`, `GroupControls`, `FieldPicker`, `QueryPreview` | Modular UI pieces for custom layouts. |

### Schema helpers (`json-filter-builder/schema`)

| Export | Description |
| --- | --- |
| `BASE_OPERATORS` | Catalog of reusable operators (`eq`, `between`, `in`, `is_null`, etc.). |
| `normalizeSchema(fields)` | Validates your field list and attaches canonical operator metadata. |
| `toJSON(node)` / `fromJSON(json)` | Convert between filter trees and the `{and|or}` JSON format. |
| `toQueryString(node, paramName?)` / `fromQueryString(qs)` | Encode/decode URL parameters. |
| `buildFilterRequest(node, config)` | Produce GET or POST `RequestInit` objects. |

### Operator shapes

Every `OperatorDef` declares a `valueShape` so the UI and validation know what to expect:

| Shape | Meaning | Example operators |
| --- | --- | --- |
| `none` | No value allowed | `is_null`, `is_not_null`, `is_true` |
| `single` | Single primitive | `eq`, `contains`, `gt`, `before` |
| `pair` | Two-element tuple | `between` |
| `list` | Non-empty array | `in`, `not_in` |

Validation errors surface through `FilterBuilderContext.issues` and are rendered by default in `FilterCondition`.

## Serialization format

```json
{
  "and": [
    { "field": "price", "operator": "gt", "value": 100 },
    {
      "or": [
        { "field": "category", "operator": "eq", "value": "electronics" },
        { "field": "category", "operator": "eq", "value": "smart-home" }
      ]
    }
  ]
}
```

That structure is stable and language agnostic—drop it straight into SQL/Prisma builders, Elasticsearch DSLs, or serverless filters.

## Reference app

Clone the repository, then:

```bash
npm install
npx nx dev @filter-builder-app/reference-app  # http://localhost:3000
```

- `/` – playground with mock “people” data.
- `/products` – powered by fakestoreapi.com.
- `/users` – backed by api.escuelajs.co.

Deploy to Vercel effortlessly:

```
Root Directory: .
Build Command: npx nx build @filter-builder-app/reference-app
Output Directory: apps/reference-app/.next
```

## Testing & linting

```bash
npx nx lint @json-filter-builder/filter-builder
npx nx test @json-filter-builder/filter-builder
npx nx build @json-filter-builder/filter-builder --watch
```

Vitest covers serialization/validation logic and integration flows; ESLint keeps the React pieces consistent.

## Release workflow

1. `npm version --no-git-tag-version <patch|minor|major>`
2. `npx nx lint && npx nx test && npx nx build @json-filter-builder/filter-builder`
3. `npm publish --access public` from `libs/filter-builder`
4. Tag + push: `git tag vX.Y.Z && git push --tags`
5. Update `README.md` with highlights and new version badge.

## SEO-friendly keywords

React filter builder, nested query builder, advanced search UI, JSON filter serialization, Tailwind filter components, Next.js filter form, schema driven filters, dynamic rule builder, AND/OR group UI, GET/POST filter API helper.

## Support & feedback

- Issues & feature requests: open them on the project repo.
- Questions? Reach out via GitHub discussions or raise an issue with the “question” label.

Happy filtering! If you build something cool with `json-filter-builder`, share it—we love seeing creative UIs built on top of the engine.

