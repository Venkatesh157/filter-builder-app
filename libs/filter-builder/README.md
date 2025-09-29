# json-filter-builder &nbsp;•&nbsp; Schema-first React query builder

`json-filter-builder` is a production-ready toolkit for teams that need powerful, nested filtering UIs without reinventing reducers, validation rules, or serialization. Describe your dataset once and the library gives you: polished React components, spec-compliant `{ and: [] }` / `{ or: [] }` JSON, URL-safe query strings, and ready-to-send GET/POST request builders. It’s the fastest path from “we need advanced filters” to “ship it.”

---

## Why teams choose json-filter-builder

- **Schema-first design** — Operators, labels, and value editors are generated from the schema you provide. Swap datasets by swapping configs.
- **Unlimited nesting** — Build arbitrarily deep `AND`/`OR` groups with accessible keyboard navigation and Tailwind-friendly styling.
- **Spec-compliant serialization** — Out-of-the-box support for the take-home challenge format, including hydration from JSON or query strings.
- **Server-safe helpers** — Import `json-filter-builder/schema` anywhere (APIs, loaders, scripts) without pulling in client-only hooks.
- **API-aware** — `buildFilterRequest()` produces GET query parameters or POST bodies with consistent headers, so your client and server stay in sync.
- **Framework agnostic** — Works anywhere React runs; the reference app uses Next.js 15 + React 19 to showcase real-world usage.

---

## Installation

```bash
npm install json-filter-builder
# or
yarn add json-filter-builder
pnpm add json-filter-builder
```

Need helpers on the server (e.g., Next.js route handlers, Remix loaders)? Import from the /schema entry:

```
import {
  BASE_OPERATORS,
  normalizeSchema,
  toJSON,
  toQueryString,
} from 'json-filter-builder/schema';
```

---

## Quick start

### 1. Describe you dataset

```
// schema/productFields.ts
import { BASE_OPERATORS, type Field } from 'json-filter-builder/schema';

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

```
import {
  FilterBuilder,
  type FilterBuilderApiConfig,
  type FilterJSON,
} from 'json-filter-builder';
import { productFields } from './schema/productFields';

const apiConfig: FilterBuilderApiConfig = {
  mode: 'get',
  url: '/api/products',
  paramName: 'filters',
};

export function ProductFilter() {
  return (
    <FilterBuilder
      fields={productFields}
      debounceMs={150}
      showPreview
      onJsonChange={(json: FilterJSON) => console.log('Filter JSON', json)}
      onSerialize={(qs) => console.log('Query string', qs)}
      apiConfig={apiConfig}
      emptyState={<p>Select a field to get started.</p>}
    />
  );
}
```

### 3. Consume the output

```
import { useFilterBuilder } from 'json-filter-builder';

function ExportButton() {
  const { toJson, toQueryString, buildRequest } = useFilterBuilder();

  const handleExport = () => {
    const json = toJson();                        // Spec-compliant payload
    const qs = toQueryString('filters');          // filters=%7B%22and%22...
    const request = buildRequest({ mode: 'post', url: '/api/search' });
    void fetch(request.url, request.init);
  };

  return <button onClick={handleExport}>Export filters</button>;
}
```

## API Overview

### Components & hooks

| Export                  | Type      | Purpose / Signature                                                                   |
| ----------------------- | --------- | ------------------------------------------------------------------------------------- |
| `FilterBuilder`         | Component | High-level component combining provider, UI shell, preview, and empty-state handling. |
| `FilterBuilderProvider` | Component | Provider-only variant for composing your own UI shell.                                |
| `useFilterBuilder()`    | Hook      | Returns `{ schema, state, dispatch, issues, toJson, toQueryString, buildRequest }`.   |
| `FilterGroup`           | Component | Composable building block for bespoke layouts (group of conditions).                  |
| `FilterCondition`       | Component | Composable building block for a single field/operator/value condition.                |
| `OperatorPicker`        | Component | UI control for selecting an operator for the active field.                            |
| `ValueEditor`           | Component | UI control for editing the condition value(s).                                        |
| `GroupControls`         | Component | Buttons/controls for adding/removing groups and conditions.                           |
| `FieldPicker`           | Component | UI control for selecting a field.                                                     |
| `QueryPreview`          | Component | Read-only preview of the current filter as JSON / query string.                       |

### Provider props

```
interface FilterBuilderProps {
  fields: Field[];
  initialState?: FilterNode;
  initialFilterJson?: FilterJSON;
  initialQueryString?: string;
  onChange?: (node: FilterNode) => void;
  onJsonChange?: (json: FilterJSON) => void;
  onSerialize?: (qs: string) => void;
  debounceMs?: number;
  showPreview?: boolean;
  apiConfig?: {
    mode: 'get' | 'post';
    url: string;
    paramName?: string;
    headers?: Record<string, string>;
    bodyKey?: string | null;
    autoSubmit?: boolean;
    onRequest?: (request: FilterRequest) => void | Promise<void>;
    fetchImpl?: typeof fetch;
  };
  emptyState?: React.ReactNode;
  filterGroupProps?: Partial<FilterGroupProps>;
  previewProps?: Partial<QueryPreviewProps>;
}

```

### Schema helpers (json-filter-builder/schema)

| Export                                                | Description                                                                            |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `BASE_OPERATORS`                                      | Reusable operators (`eq`, `between`, `in`, `is_null`, etc.) with correct `valueShape`. |
| `normalizeSchema(fields)`                             | Validates fields, deduplicates operators, and seeds the root group.                    |
| `toJSON(node)` / `fromJSON(json)`                     | Convert between filter trees and `{ and: [] }` / `{ or: [] }` JSON.                    |
| `toQueryString(node, param?)` / `fromQueryString(qs)` | URL-safe encoding/decoding of filters.                                                 |
| `buildFilterRequest(node, config)`                    | Produce `{ url, init, json, queryString }` for GET/POST API calls.                     |

### Validation rules

Operators declare a valueShape so the library knows which UI control to render and how to validate:

| Value shape | Expectation                                | Example operators                   |
| ----------- | ------------------------------------------ | ----------------------------------- |
| `none`      | No value permitted                         | `is_null`, `is_not_null`, `is_true` |
| `single`    | Single primitive (string/number/date/bool) | `eq`, `contains`, `gt`, `before`    |
| `pair`      | Tuple of two values                        | `between`                           |
| `list`      | Non-empty array                            | `in`, `not_in`                      |

validateTree() runs automatically. Inspect issues via useFilterBuilder().issues; the default <QueryPreview /> surfaces them with accessible alerts.

### Styling & customization

- Components accept className props and ship with Tailwind-friendly defaults.

- Override child rendering via FilterGroup’s renderChild or GroupControls’ renderActions.

- Replace inputs entirely by injecting your own ValueEditor or using FilterBuilderProvider + custom shell.

## Architecture briefing

| Concern        | Implementation                                                                      |
| -------------- | ----------------------------------------------------------------------------------- |
| State updates  | Pure reducer with structural cloning (`libs/filter-builder/src/state/reducer.ts`).  |
| Serialization  | Dedicated helpers for JSON/query string round-trips (`core/serialization.ts`).      |
| API wiring     | `buildFilterRequest()` abstracts GET query strings and POST bodies (`core/api.ts`). |
| Validation     | Operator-shape enforcement + group sanity checks (`core/validation.ts`).            |
| UI composition | Modular components under `src/lib/**`, built with hooks + Tailwind classes.         |
| Bundle output  | Rollup + Babel produce ESM modules + types in `dist/` (`rollup.config.cjs`).        |

## Development workflow

```
# Install workspace dependencies
npm install

# Library checks
npx nx lint json-filter-builder
npx nx test json-filter-builder
npx nx build json-filter-builder --skip-nx-cache

# Demo app (optional)
npx nx dev @filter-builder-app/reference-app
NX_DAEMON=false npx nx run @filter-builder-app/reference-app-e2e:e2e
```

## Contributing

- Fork the repo and create a topic branch.

- Keep commits focused; our PRs are squash-merged for a clean history.

- Run nx lint and nx test before pushing.

- Update documentation (libs/filter-builder/README.md, CHANGELOG.md) when adding features.

- Include screenshots or a Loom if you tweak UI components.

- For larger ideas, open a discussion or issue first to align on direction.

## Release playbook

- Update CHANGELOG with the new highlights.

- npm version <patch|minor|major> (from the workspace root or library directory).

- npx nx build json-filter-builder --skip-nx-cache — ensure dist/README.md and bundles are current.

- From libs/filter-builder/, run npm publish --access public.

- Push commits + tags (git push && git push --tags) and draft a GitHub release with the same version.

## Keywords

React filter builder · Query builder · Nested filters · Advanced search UI · JSON serialization · Tailwind components · Next.js filter form · Schema-driven filters · Dynamic rule engine · GET/POST API helper

## Support & visibility

- Issues & feature requests → GitHub Issues

- Questions → GitHub Discussions or issues with a “question” label

- Showcase your build → share screenshots or demos; we love seeing what teams create with json-filter-builder.

Happy filtering! ✨
