import { Combinator, ConditionNode, FilterNode, GroupNode } from './types';

export function id(): string {
  return Math.random().toString(36).slice(2);
}

export function group(
  combinator: Combinator = 'AND',
  children: FilterNode[] = []
): GroupNode {
  return {
    id: id(),
    kind: 'group',
    combinator,
    children,
  };
}

export function condition(
  fieldId = '',
  operator = '',
  value?: unknown
): ConditionNode {
  return {
    id: id(),
    kind: 'condition',
    fieldId,
    operator,
    value,
  };
}

export function deepClone<T>(node: T) {
  return JSON.parse(JSON.stringify(node));
}
