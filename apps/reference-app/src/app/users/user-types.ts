import type { Field } from '@json-filter-builder/filter-builder';

export interface User {
  id: number;
  email: string;
  password?: string;
  name: string;
  role: string;
  avatar?: string;
  creationAt?: string;
  updatedAt?: string;
}

export interface UserFieldConfig {
  field: Field;
  path: string;
}

