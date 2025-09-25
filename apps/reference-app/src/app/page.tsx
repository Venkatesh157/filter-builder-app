'use client';
import { FilterBuilderProvider } from '@json-filter-builder/filter-builder';
import type { Field } from '@json-filter-builder/filter-builder';

const mockFields = [
  {
    id: 'status',
    label: 'Status',
    type: 'enum',
    operators: [
      { id: 'eq', label: 'Equals', arity: 1 },
      { id: 'neq', label: 'Does Not Equal', arity: 1 },
    ],
  },
  {
    id: 'status', // duplicate on purpose
    label: 'Employment Status',
    type: 'enum',
    operators: [
      { id: 'eq', label: 'Equals', arity: 1 },
      { id: 'neq', label: 'Does Not Equal', arity: 1 },
    ],
  },
] satisfies Field[];

export default function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.tailwind file.
   */
  return (
    <FilterBuilderProvider fields={mockFields}>
      {/* TODO: render FieldPicker */}
      <div>Filter builder UI coming soon…</div>
    </FilterBuilderProvider>
  );
}
