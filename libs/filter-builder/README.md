# json-filter-builder &nbsp;|&nbsp; Schema-first React query builder

`json-filter-builder` is a reusable React toolkit for building nested `AND`/`OR` filter trees and serializing them into stable JSON or query-string payloads. Describe your dataset once and the library handles UI, validation, and API wiring—no custom reducers or bespoke form logic required.

- **Schema driven**: operators, labels, and value editors come from your field config.
- **Nested groups**: unlimited depth with accessible controls, keyboard-friendly semantics, and Tailwind-ready styling.
- **Spec-compliant serialization**: emits the `{ and: [] }` / `{ or: [] }` format expected by the challenge spec, along with helpers for round-tripping filters and generating GET/POST requests.
- **Framework friendly**: works anywhere React runs; the reference app uses Next.js 15 + React 19.
- **Server-safe entry point**: import `json-filter-builder/schema` in loaders or API routes without pulling in client hooks.

---

## Installation

```bash
npm install json-filter-builder
# or
yarn add json-filter-builder
pnpm add json-filter-builder
```
