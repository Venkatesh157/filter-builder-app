'use client';

import Link from 'next/link';

import {
  FilterBuilder,
  type Field,
  BASE_OPERATORS,
} from '@json-filter-builder/filter-builder';

const fields: Field[] = [
  {
    id: 'name',
    label: 'Name',
    type: 'string',
    operators: [
      BASE_OPERATORS.eq,
      BASE_OPERATORS.contains,
      BASE_OPERATORS.starts_with,
    ],
  },
  {
    id: 'age',
    label: 'Age',
    type: 'number',
    operators: [
      BASE_OPERATORS.eq,
      BASE_OPERATORS.gt,
      BASE_OPERATORS.lt,
      BASE_OPERATORS.between,
    ],
  },
  {
    id: 'signup_date',
    label: 'Sign Up Date',
    type: 'date',
    operators: [
      BASE_OPERATORS.before,
      BASE_OPERATORS.after,
      BASE_OPERATORS.between,
    ],
  },
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    operators: [
      BASE_OPERATORS.eq,
      BASE_OPERATORS.neq,
    ],
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ],
  },
];

export default function IndexPage() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-slate-100/70 p-6">
      <div className="w-full max-w-4xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-800">
            Filter Builder
          </h1>
          <p className="text-sm text-slate-600">
            Experiment with the core filtering UI. Check out the{' '}
            <Link href="/products" className="font-medium text-indigo-600">
              product catalog
            </Link>{' '}
            or{' '}
            <Link href="/users" className="font-medium text-indigo-600">
              user directory
            </Link>{' '}
            demos to see live data filtering in action.
          </p>
        </header>
        <FilterBuilder fields={fields} />
      </div>
    </main>
  );
}
