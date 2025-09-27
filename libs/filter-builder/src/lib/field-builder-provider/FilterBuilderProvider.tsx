import { type ReactNode, useEffect, useMemo, useReducer, useRef } from 'react';

import { normalizeSchema } from '../../core/schema';
import type { Field, FilterNode } from '../../core/types';
import { toQueryString } from '../../core/serialization';
import { validateTree } from '../../core/validation';
import { filterReducer } from '../../state/reducer';

import {
  FilterBuilderContext,
  type FilterBuilderContextValue,
} from '../field-builder-context/FilterBuilderContext';

export interface FilterBuilderProviderProps {
  fields: Field[];
  initialState?: FilterNode;
  onChange?: (next: FilterNode) => void;
  onSerialize?: (serialized: string) => void;
  debounceMs?: number;
  children: ReactNode;
}

export function FilterBuilderProvider({
  fields,
  initialState,
  onChange,
  onSerialize,
  debounceMs = 200,
  children,
}: FilterBuilderProviderProps) {
  const schema = useMemo(() => normalizeSchema(fields), [fields]);

  const [state, dispatch] = useReducer(
    filterReducer,
    initialState ?? schema.root
  );

  const issues = useMemo(() => validateTree(state, schema), [state, schema]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!onChange && !onSerialize) return undefined;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onChange?.(state);
      if (onSerialize) {
        onSerialize(toQueryString(state));
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state, debounceMs, onChange, onSerialize]);

  const value = useMemo<FilterBuilderContextValue>(
    () => ({ schema, state, dispatch, issues }),
    [schema, state, issues]
  );

  return (
    <FilterBuilderContext.Provider value={value}>
      {children}
    </FilterBuilderContext.Provider>
  );
}
