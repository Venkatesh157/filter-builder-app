import { createContext, useContext, type Dispatch } from 'react';

import type {
  FilterNode,
  NormalizedSchema,
  ValidationIssue,
} from '../../core/types';
import type { FilterAction } from '../../state/actions';

export interface FilterBuilderContextValue {
  schema: NormalizedSchema;
  state: FilterNode;
  dispatch: Dispatch<FilterAction>;
  issues: ValidationIssue[];
}

export const FilterBuilderContext =
  createContext<FilterBuilderContextValue | null>(null);

export function useFilterBuilder() {
  const ctx = useContext(FilterBuilderContext);
  if (!ctx) {
    throw new Error(
      'useFilterBuilder must be used inside a FilterBuilderProvider'
    );
  }
  return ctx;
}
