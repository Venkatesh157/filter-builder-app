import { condition, group } from './node';
import { Combinator, FilterNode } from './types';

type JsonCondition = { field: string; op: string; value?: unknown };
type JsonGroup = { combinator: Combinator; children: JsonNode[] };
type JsonNode = JsonCondition | JsonGroup;

export function toJSON(
  node: FilterNode,
  options?: { emptyPolicy?: 'preserve' | 'prune' }
): JsonNode {
  if (node.kind === 'condition') {
    return {
      field: node.fieldId,
      op: node.operator,
      value: node.value,
    };
  }

  let children = node.children.map((child) => toJSON(child, options));

  if (options?.emptyPolicy === 'prune') {
    children = children.filter(
      (child) => !('children' in child && child.children.length === 0)
    );
  }

  return {
    combinator: node.combinator,
    children,
  };
}

export function fromJSON(json: JsonNode): FilterNode {
  if ('field' in json) {
    return condition(json.field, json.op, json.value);
  }

  return group(
    json.combinator,
    json.children.map((child) => fromJSON(child))
  );
}

export function toQueryString(node: FilterNode): string {
  const json = JSON.stringify(toJSON(node));
  return `q=${encodeURIComponent(json)}`;
}

export function fromQueryString(qs: string): FilterNode {
  const params = new URLSearchParams(qs);
  const raw = params.get('q');

  if (!raw) {
    return group();
  }

  const json = JSON.parse(decodeURIComponent(raw));
  return fromJSON(json);
}
