import type { FilterNode } from './types';
import { toJSON, toQueryString, type FilterJSON } from './serialization';

export interface FilterRequest {
  url: string;
  init: RequestInit;
  json: FilterJSON;
  queryString: string;
}

export interface FilterGetConfig {
  mode: 'get';
  url: string;
  paramName?: string;
  headers?: Record<string, string>;
}

export interface FilterPostConfig {
  mode: 'post';
  url: string;
  headers?: Record<string, string>;
  bodyKey?: string | null;
}

export type FilterApiConfig = FilterGetConfig | FilterPostConfig;

const DEFAULT_PARAM = 'filters';

export function buildFilterRequest(
  node: FilterNode,
  config: FilterApiConfig
): FilterRequest {
  const json = toJSON(node);

  if (config.mode === 'get') {
    const paramName = config.paramName ?? DEFAULT_PARAM;
    const queryString = toQueryString(node, paramName);
    const separator = config.url.includes('?') ? '&' : '?';
    const url = `${config.url}${separator}${queryString}`;

    return {
      url,
      init: {
        method: 'GET',
        headers: config.headers,
      },
      json,
      queryString,
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    ...config.headers,
  } as Record<string, string>;

  const bodyKey = config.bodyKey ?? null;
  const payload = bodyKey ? { [bodyKey]: json } : json;
  const body = JSON.stringify(payload);

  return {
    url: config.url,
    init: {
      method: 'POST',
      headers,
      body,
    },
    json,
    queryString: '',
  };
}

export type { FilterJSON } from './serialization';
