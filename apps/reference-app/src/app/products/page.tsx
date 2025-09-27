import { cache } from 'react';

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
          { id: 'contains', label: 'Contains', arity: 1 },
          { id: 'starts_with', label: 'Starts with', arity: 1 },
          { id: 'eq', label: 'Equals', arity: 1 },
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
        operators: [
          { id: 'eq', label: 'Equals', arity: 1 },
          { id: 'neq', label: 'Does Not Equal', arity: 1 },
        ],
      },
    },
    {
      path: 'price',
      field: {
        id: 'price',
        label: 'Price',
        type: 'number',
        operators: [
          { id: 'eq', label: 'Equals', arity: 1 },
          { id: 'gt', label: 'Greater Than', arity: 1 },
          { id: 'lt', label: 'Less Than', arity: 1 },
          { id: 'between', label: 'Between', arity: 2 },
        ],
      },
    },
    {
      path: 'rating.rate',
      field: {
        id: 'rating_rate',
        label: 'Rating',
        type: 'number',
        operators: [
          { id: 'gt', label: 'Greater Than', arity: 1 },
          { id: 'lt', label: 'Less Than', arity: 1 },
        ],
      },
    },
    {
      path: 'rating.count',
      field: {
        id: 'rating_count',
        label: 'Review Count',
        type: 'number',
        operators: [
          { id: 'gt', label: 'Greater Than', arity: 1 },
          { id: 'lt', label: 'Less Than', arity: 1 },
        ],
      },
    },
    {
      path: 'description',
      field: {
        id: 'description',
        label: 'Description',
        type: 'string',
        operators: [
          { id: 'contains', label: 'Contains', arity: 1 },
          { id: 'eq', label: 'Equals', arity: 1 },
        ],
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

