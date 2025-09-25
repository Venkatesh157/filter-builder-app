import {
  createContext,
  type Dispatch,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  Field,
  FilterNode,
  NormalizedSchema,
  ValidationIssue,
} from '../core/types';
import { normalizeSchema } from '../core/schema';
import { validateTree } from '../core/validation';
import { filterReducer } from '../state/reducer';
import { toQueryString } from '../core/serialization';
import type { FilterAction } from '../state/actions';

interface FilterBuilderContextValue {
  schema: NormalizedSchema;
  state: FilterNode;
  dispatch: Dispatch<FilterAction>;
  issues: ValidationIssue[];
}

export const FilterBuilderContext =
  createContext<FilterBuilderContextValue | null>(null);

export const useFilterBuilder = () => {
  const ctx = useContext(FilterBuilderContext);
  if (!ctx) {
    throw new Error(
      'useFilterBuilder must be used inside a FilterBuilderProvider'
    );
  }
  return ctx;
};

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

  const value = useMemo(
    () => ({ schema, state, dispatch, issues }),
    [schema, state, issues]
  );

  return (
    <FilterBuilderContext.Provider value={value}>
      {children}
    </FilterBuilderContext.Provider>
  );
}
