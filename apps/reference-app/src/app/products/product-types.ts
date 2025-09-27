import type { Field } from '@json-filter-builder/filter-builder';

export interface ProductRating {
  rate: number;
  count: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image?: string;
  rating: ProductRating;
}

export interface ProductFieldConfig {
  field: Field;
  path: string;
}

