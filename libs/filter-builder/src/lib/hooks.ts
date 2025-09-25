import { useMemo } from 'react';
import { useFilterBuilder } from './filter-builder';
import type { FieldType, OperatorDef } from '../core/types';

export interface FieldOption {
  id: string;
  label: string;
  type: FieldType;
}

export function useFieldOptions(): FieldOption[] {
  const { schema } = useFilterBuilder();
  return useMemo(() => {
    return Object.values(schema.fields)
      .map(({ id, label, type }) => ({ id, label, type }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [schema.fields]);
}

export function useOperators(fieldId?: string): OperatorDef[] {
  const { schema } = useFilterBuilder();
  const fieldOperators = fieldId
    ? schema.fields[fieldId]?.operators
    : undefined;

  return useMemo(() => {
    const source = fieldOperators ?? Object.values(schema.operators);
    return source.slice().sort((a, b) => a.label.localeCompare(b.label));
  }, [fieldOperators, schema.operators]);
}
