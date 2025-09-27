import { condition, group } from './node';
import type { Combinator, FilterNode } from './types';

export type FilterConditionJSON = {
  field: string;
  operator: string;
  value?: unknown;
};

export type FilterGroupJSON =
  | { and: FilterJSON[] }
  | { or: FilterJSON[] };

export type FilterJSON = FilterConditionJSON | FilterGroupJSON;

const combinatorKey: Record<Combinator, 'and' | 'or'> = {
  AND: 'and',
  OR: 'or',
};

const keyToCombinator: Record<'and' | 'or', Combinator> = {
  and: 'AND',
  or: 'OR',
};

const QUERY_PARAM = 'filters';

export function toJSON(
  node: FilterNode,
  options?: { emptyPolicy?: 'preserve' | 'prune' }
): FilterJSON {
  if (node.kind === 'condition') {
    const payload: FilterConditionJSON = {
      field: node.fieldId,
      operator: node.operator,
    };

    if (node.value !== undefined) {
      payload.value = node.value;
    }

    return payload;
  }

  const key = combinatorKey[node.combinator];
  let children = node.children.map((child) => toJSON(child, options));

  if (options?.emptyPolicy === 'prune') {
    children = children.filter((child) => {
      if (isGroupJSON(child)) {
        const entries = isAndGroup(child) ? child.and : child.or;
        return entries.length > 0;
      }
      return true;
    });
  }

  return { [key]: children } as FilterGroupJSON;
}

export function fromJSON(json: FilterJSON): FilterNode {
  if (isConditionJSON(json)) {
    return condition(json.field, json.operator, json.value);
  }

  const [key, value] = Object.entries(json)[0] as [
    'and' | 'or',
    FilterJSON[]
  ];

  return group(
    keyToCombinator[key],
    (value ?? []).map((child) => fromJSON(child))
  );
}

export function toQueryString(node: FilterNode, paramName = QUERY_PARAM): string {
  const json = JSON.stringify(toJSON(node));
  return `${encodeURIComponent(paramName)}=${encodeURIComponent(json)}`;
}

export function fromQueryString(
  qs: string,
  paramName = QUERY_PARAM
): FilterNode {
  const params = new URLSearchParams(qs.startsWith('?') ? qs.slice(1) : qs);
  const raw = params.get(paramName);

  if (!raw) {
    return group();
  }

  const json = JSON.parse(decodeURIComponent(raw)) as FilterJSON;
  return fromJSON(json);
}

function isConditionJSON(value: FilterJSON): value is FilterConditionJSON {
  return 'field' in value;
}

function isGroupJSON(value: FilterJSON): value is FilterGroupJSON {
  return 'and' in value || 'or' in value;
}

function isAndGroup(
  value: FilterGroupJSON
): value is { and: FilterJSON[] } {
  return 'and' in value;
}
