import { cache } from 'react';

import { BASE_OPERATORS } from '@json-filter-builder/filter-builder/schema';

import type { Product, ProductFieldConfig } from './product-types';
import { ProductFilterClient } from './product-filter-client';

const fetchProducts = cache(async (): Promise<Product[]> => {
  const response = await fetch('https://fakestoreapi.com/products', {
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    console.error('Failed to load products', response.statusText);
    return [];
  }

  const products = (await response.json()) as Product[];
  return products ?? [];
});

const buildFieldConfig = (products: Product[]): ProductFieldConfig[] => {
  const uniqueCategories = Array.from(
    new Set(products.map((product) => product.category))
  ).sort((a, b) => a.localeCompare(b));

  return [
    {
      path: 'title',
      field: {
        id: 'title',
        label: 'Title',
        type: 'string',
        operators: [
          BASE_OPERATORS.contains,
          BASE_OPERATORS.starts_with,
          BASE_OPERATORS.eq,
        ],
      },
    },
    {
      path: 'category',
      field: {
        id: 'category',
        label: 'Category',
        type: 'enum',
        options: uniqueCategories.map((category) => ({
          value: category,
          label: category,
        })),
        operators: [BASE_OPERATORS.eq, BASE_OPERATORS.neq],
      },
    },
    {
      path: 'price',
      field: {
        id: 'price',
        label: 'Price',
        type: 'number',
        operators: [
          BASE_OPERATORS.eq,
          BASE_OPERATORS.gt,
          BASE_OPERATORS.lt,
          BASE_OPERATORS.between,
        ],
      },
    },
    {
      path: 'rating.rate',
      field: {
        id: 'rating_rate',
        label: 'Rating',
        type: 'number',
        operators: [BASE_OPERATORS.gt, BASE_OPERATORS.lt],
      },
    },
    {
      path: 'rating.count',
      field: {
        id: 'rating_count',
        label: 'Review Count',
        type: 'number',
        operators: [BASE_OPERATORS.gt, BASE_OPERATORS.lt],
      },
    },
    {
      path: 'description',
      field: {
        id: 'description',
        label: 'Description',
        type: 'string',
        operators: [BASE_OPERATORS.contains, BASE_OPERATORS.eq],
      },
    },
  ];
};

export default async function ProductPage() {
  const products = await fetchProducts();
  const fieldConfig = buildFieldConfig(products);

  return (
    <main className="min-h-screen bg-slate-100/70">
      <ProductFilterClient products={products} fieldConfig={fieldConfig} />
    </main>
  );
}
