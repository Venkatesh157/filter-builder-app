import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import { normalizeSchema } from '../../core/schema';
import type { Field, FilterNode } from '../../core/types';
import {
  toJSON,
  toQueryString,
  fromJSON,
  fromQueryString,
  type FilterJSON,
} from '../../core/serialization';
import {
  buildFilterRequest,
  type FilterApiConfig,
  type FilterRequest,
} from '../../core/api';
import { validateTree } from '../../core/validation';
import { filterReducer } from '../../state/reducer';

import {
  FilterBuilderContext,
  type FilterBuilderContextValue,
} from '../field-builder-context/FilterBuilderContext';

export type FilterBuilderApiConfig = FilterApiConfig & {
  autoSubmit?: boolean;
  onRequest?: (request: FilterRequest) => void | Promise<void>;
  fetchImpl?: typeof fetch;
};

export interface FilterBuilderProviderProps {
  fields: Field[];
  initialState?: FilterNode;
  initialFilterJson?: FilterJSON;
  initialQueryString?: string;
  onChange?: (next: FilterNode) => void;
  onSerialize?: (serialized: string) => void;
  onJsonChange?: (json: FilterJSON) => void;
  debounceMs?: number;
  apiConfig?: FilterBuilderApiConfig;
  children: ReactNode;
}

export function FilterBuilderProvider({
  fields,
  initialState,
  initialFilterJson,
  initialQueryString,
  onChange,
  onSerialize,
  onJsonChange,
  debounceMs = 200,
  apiConfig,
  children,
}: FilterBuilderProviderProps) {
  const schema = useMemo(() => normalizeSchema(fields), [fields]);

  const resolvedInitialState = useMemo(() => {
    if (initialState) return initialState;
    if (initialFilterJson) return fromJSON(initialFilterJson);
    if (initialQueryString) return fromQueryString(initialQueryString);
    return schema.root;
  }, [initialState, initialFilterJson, initialQueryString, schema.root]);

  const [state, dispatch] = useReducer(filterReducer, resolvedInitialState);

  const defaultQueryParam = apiConfig?.mode === 'get' ? apiConfig.paramName : undefined;

  const json = useMemo(() => toJSON(state), [state]);
  const queryString = useMemo(
    () => toQueryString(state, defaultQueryParam),
    [state, defaultQueryParam]
  );

  const issues = useMemo(() => validateTree(state, schema), [state, schema]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!onChange && !onSerialize && !onJsonChange && !apiConfig) {
      return undefined;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onChange?.(state);
      onSerialize?.(queryString);
      onJsonChange?.(json);

      if (apiConfig) {
        const { autoSubmit, onRequest, fetchImpl, ...transportConfig } = apiConfig;
        const request = buildFilterRequest(state, transportConfig as FilterApiConfig);
        if (onRequest) {
          void Promise.resolve(onRequest(request));
        }
        if (autoSubmit) {
          const runner = fetchImpl ?? fetch;
          void runner(request.url, request.init);
        }
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    state,
    debounceMs,
    onChange,
    onSerialize,
    onJsonChange,
    apiConfig,
    queryString,
    json,
  ]);

  const toJson = useCallback(() => toJSON(state), [state]);
  const toQuery = useCallback(
    (paramName?: string) => toQueryString(state, paramName),
    [state]
  );
  const buildRequest = useCallback(
    (config?: FilterApiConfig) => {
      if (config) {
        return buildFilterRequest(state, config);
      }
      if (apiConfig) {
        const { autoSubmit, onRequest, fetchImpl, ...transportConfig } = apiConfig;
        return buildFilterRequest(state, transportConfig as FilterApiConfig);
      }
      throw new Error('No API config provided to build the filter request.');
    },
    [state, apiConfig]
  );

  const value = useMemo<FilterBuilderContextValue>(
    () => ({
      schema,
      state,
      dispatch,
      issues,
      toJson,
      toQueryString: toQuery,
      buildRequest,
    }),
    [schema, state, issues, toJson, toQuery, buildRequest]
  );

  return (
    <FilterBuilderContext.Provider value={value}>
      {children}
    </FilterBuilderContext.Provider>
  );
}
