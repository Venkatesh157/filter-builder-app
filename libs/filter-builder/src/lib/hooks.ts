import { useMemo } from 'react';
import { useFilterBuilder } from './field-builder-context/FilterBuilderContext';
import type { FieldType, OperatorDef } from '../core/types';

export interface FieldPickerOption {
  id: string;
  label: string;
  type: FieldType;
}

export function useFieldOptions(): FieldPickerOption[] {
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
