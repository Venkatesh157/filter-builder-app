# Filter Builder Library

A reusable, schema-driven React library for building nested filter expressions and serializing them into a portable JSON format. The package is designed to work with any dataset and supports both GET (query string) and POST (JSON body) submissions.

## Getting Started

```sh
# install dependencies
npm install

# run story/demo app
npx nx dev @filter-builder-app/reference-app

# run tests
npx nx test filter-builder
```

The reference Next.js app exposes three demos:

- `/` – minimal playground with synthetic people fields
- `/products` – live product catalog from fakestoreapi.com
- `/users` – live user directory from api.escuelajs.co

## Library Usage

### Schema Configuration

Define your fields and operators before rendering the builder. Operators describe their expected value shape (`none`, `single`, `pair`, or `list`), which powers validation, serialization, and the appropriate input controls.

```ts
import {
  FilterBuilder,
  type Field,
  BASE_OPERATORS,
  type FilterJSON,
  type FilterApiConfig,
} from '@json-filter-builder/filter-builder';

const fields: Field[] = [
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

### Rendering the Builder

```tsx
const apiConfig: FilterApiConfig = {
  mode: 'get',
  url: '/api/search',
  paramName: 'filters',
};

<FilterBuilder
  fields={fields}
  debounceMs={150}
  onJsonChange={(json: FilterJSON) => console.log(json)}
  onSerialize={(qs) => console.log(qs)}
  apiConfig={apiConfig}
/>;
```

`FilterBuilder` wraps a `FilterBuilderProvider`; both are exported for custom composition. The provider now accepts:

| Prop | Description |
| --- | --- |
| `fields` | Field definitions (see above). |
| `initialState` / `initialFilterJson` / `initialQueryString` | Optional starting point for the builder. |
| `onChange` | Receives the raw `FilterNode` tree. |
| `onJsonChange` | Receives the spec-compliant JSON representation. |
| `onSerialize` | Receives the encoded query string (`filters=...`). |
| `apiConfig` | GET/POST configuration. When provided, the provider exposes `buildRequest` and (optionally) auto-submits requests. |

### Context Helpers

`useFilterBuilder()` now includes serialization utilities:

- `toJson()` – returns a fresh JSON representation
- `toQueryString(paramName?: string)` – produces a query string fragment
- `buildRequest(config?: FilterApiConfig)` – creates a `RequestInit` + URL pair for GET/POST submissions

These helpers power components like `QueryPreview` and let consumers integrate with custom data flows.

## Serialization Format

Filters are serialized to the target structure described in the challenge spec:

```json
{
  "and": [
    { "field": "age", "operator": "gt", "value": 30 },
    {
      "or": [
        { "field": "role", "operator": "eq", "value": "admin" },
        { "field": "isActive", "operator": "eq", "value": true }
      ]
    }
  ]
}
```

Helpers exported from `@json-filter-builder/filter-builder`:

- `toJSON` / `fromJSON`
- `toQueryString` / `fromQueryString`
- `buildFilterRequest` for GET/POST payload creation

## Validation Rules

Validation is driven off the operator `valueShape`:

- `none` → no value allowed (e.g., `is_null`)
- `single` → single primitive value
- `pair` → two-element tuple (`between`)
- `list` → non-empty array (`in`, `not_in`)

Tests cover invalid combinations (missing values, wrong shapes) and ensure the resulting `ValidationIssue`s surface through both the provider context and the default UI.

## Testing

- `libs/filter-builder/src/core/serialization.spec.ts` – JSON/query serialization and GET/POST request helpers
- `libs/filter-builder/src/core/validation.spec.ts` – operator shape validation scenarios
- `libs/filter-builder/src/lib/filter-builder.integration.spec.tsx` – user-level interactions (adding/editing conditions) exercising the debounced callback pipeline

Run all tests with `npx nx test filter-builder`.

## Architecture Notes

- **Schema normalization** – Fields and operators are normalized once per render. Operators are treated as canonical records keyed by ID; conflicting definitions throw during normalization.
- **Operator shapes** – Moving from numeric `arity` to descriptive `valueShape` allows the library to cleanly support `between`, `in`, and null checks while driving validation and input rendering from a single source of truth.
- **Provider callbacks** – The provider now emits raw nodes, JSON, query strings, and optional network requests, letting consumers pick the level of abstraction they need.
- **API helper** – `buildFilterRequest` centralizes GET/POST request creation so the React layer and external scripts can share the same serialization logic.
- **Example apps** – The Next.js demo shows how to wire different datasets without leaking domain logic into the library (all dataset evaluation lives alongside the app data).

## Contributing

1. Make schema/operator changes in `libs/filter-builder/src/core`
2. Update or add tests (`nx test filter-builder`)
3. Run lint (`nx lint filter-builder`)
4. Update the reference app or README when introducing new public APIs

Happy filtering!

