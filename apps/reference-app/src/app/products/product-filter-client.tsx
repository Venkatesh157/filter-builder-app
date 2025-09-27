'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  FilterBuilder,
  type FilterNode,
} from '@json-filter-builder/filter-builder';

import type {
  Product,
  ProductFieldConfig,
} from './product-types';

type ProductFilterClientProps = {
  products: Product[];
  fieldConfig: ProductFieldConfig[];
};

const joinClassNames = (
  ...classes: Array<string | false | null | undefined>
) => classes.filter(Boolean).join(' ');

const getValueByPath = (item: Product, path: string) => {
  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc === null || acc === undefined) return undefined;
    if (typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[segment];
  }, item);
};

const isGroupNode = (node: FilterNode): node is Extract<FilterNode, { kind: 'group' }> =>
  node.kind === 'group';

function evaluateNode(
  node: FilterNode,
  product: Product,
  fieldMap: Map<string, ProductFieldConfig>
): boolean {
  if (isGroupNode(node)) {
    if (node.children.length === 0) {
      return true;
    }

    const results = node.children.map((child) =>
      evaluateNode(child, product, fieldMap)
    );

    return node.combinator === 'AND'
      ? results.every(Boolean)
      : results.some(Boolean);
  }

  const fieldMeta = fieldMap.get(node.fieldId);
  if (!fieldMeta) {
    return true;
  }

  const actual = getValueByPath(product, fieldMeta.path);
  const operatorId = node.operator;
  const value = node.value;

  if (operatorId === 'eq') {
    if (value === undefined || value === null || value === '') return true;
    return actual === value;
  }

  if (operatorId === 'neq') {
    if (value === undefined || value === null || value === '') return true;
    return actual !== value;
  }

  if (operatorId === 'contains' || operatorId === 'starts_with') {
    if (typeof value !== 'string' || value.trim() === '') return true;
    if (typeof actual !== 'string') return false;
    const haystack = actual.toLowerCase();
    const needle = value.toLowerCase();

    return operatorId === 'contains'
      ? haystack.includes(needle)
      : haystack.startsWith(needle);
  }

  if (operatorId === 'gt' || operatorId === 'lt') {
    if (typeof value !== 'number') return true;
    if (typeof actual !== 'number') return false;
    return operatorId === 'gt' ? actual > value : actual < value;
  }

  if (operatorId === 'between') {
    if (!Array.isArray(value)) return true;
    const [start, end] = value as Array<unknown>;
    if (typeof start !== 'number' && typeof end !== 'number') return true;
    if (typeof actual !== 'number') return false;

    const lower = typeof start === 'number' ? start : Number.NEGATIVE_INFINITY;
    const upper = typeof end === 'number' ? end : Number.POSITIVE_INFINITY;

    return actual >= lower && actual <= upper;
  }

  return true;
}

const filterProducts = (
  state: FilterNode | null,
  products: Product[],
  fieldConfig: ProductFieldConfig[]
): Product[] => {
  if (!state) return products;

  if (isGroupNode(state) && state.children.length === 0) {
    return products;
  }

  const fieldMap = new Map(
    fieldConfig.map((config) => [config.field.id, config] as const)
  );

  return products.filter((product) => evaluateNode(state, product, fieldMap));
};

function ProductResults({
  products,
  total,
}: {
  products: Product[];
  total: number;
}) {
  const resultLabel = products.length === 1 ? 'product' : 'products';

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Results
        </h2>
        <p className="text-sm text-slate-600">
          Showing {products.length} of {total} {resultLabel}
        </p>
      </header>

      {products.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-800">
                {product.title}
              </h3>
              <p className="text-sm text-slate-600">
                {product.description}
              </p>
              <dl className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                <div>
                  <dt className="font-medium text-slate-500">Category</dt>
                  <dd>{product.category}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Price</dt>
                  <dd>${product.price.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Rating</dt>
                  <dd>{product.rating.rate.toFixed(1)} / 5</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">Reviews</dt>
                  <dd>{product.rating.count}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white/80 p-6 text-center text-sm text-slate-500">
          No products match the active filters.
        </p>
      )}
    </section>
  );
}

export function ProductFilterClient({
  products,
  fieldConfig,
}: ProductFilterClientProps) {
  const [filterState, setFilterState] = useState<FilterNode | null>(null);
  const [queryString, setQueryString] = useState('');

  const fields = useMemo(
    () => fieldConfig.map((config) => config.field),
    [fieldConfig]
  );

  const filteredProducts = useMemo(
    () => filterProducts(filterState, products, fieldConfig),
    [filterState, products, fieldConfig]
  );

  const handleFilterChange = useCallback((next: FilterNode) => {
    setFilterState(next);
  }, []);

  const builderContainerClass = joinClassNames(
    'space-y-6',
    filteredProducts.length === 0 && 'pb-2'
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 lg:px-8">
      <FilterBuilder
        fields={fields}
        onChange={handleFilterChange}
        onSerialize={setQueryString}
        emptyState={
          <p className="text-sm text-slate-500">
            Add a condition to start narrowing the product catalog.
          </p>
        }
        className={builderContainerClass}
        previewProps={{ className: 'lg:sticky lg:top-6' }}
      />

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-3 text-xs text-indigo-700">
        <span className="font-semibold">Query string:</span>{' '}
        <code className="break-words">{queryString || '—'}</code>
      </div>

      <ProductResults products={filteredProducts} total={products.length} />
    </div>
  );
}
