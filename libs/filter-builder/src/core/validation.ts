import {
  ConditionNode,
  FilterNode,
  NormalizedSchema,
  ValidationIssue,
} from './types';

export function validateTree(
  root: FilterNode,
  schema: NormalizedSchema
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  function walk(node: FilterNode, path: string[]) {
    const nextPath = [...path, node.id];

    if (node.kind === 'condition') {
      issues.push(...validateCondition(node, schema, nextPath));
      return;
    }

    if (node.children.length === 0) {
      issues.push({
        path: nextPath,
        message: 'Group has no conditions',
        severity: 'warning',
      });
      return;
    }

    for (const child of node.children) {
      walk(child, nextPath);
    }
  }

  walk(root, ['root']);

  return issues;
}

function validateCondition(
  node: ConditionNode,
  schema: NormalizedSchema,
  path: string[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const field = schema.fields[node.fieldId];
  if (!field) {
    issues.push({
      path,
      message: `Field "${node.fieldId}" does not exist.`,
      severity: 'error',
    });
    return issues;
  }

  const operator = schema.operators[node.operator];
  if (!operator) {
    issues.push({
      path,
      message: `Operator "${node.operator}" is not available.`,
      severity: 'error',
    });
    return issues;
  }

  let valueCount = 0;

  if (operator.arity === 0) {
    valueCount = 0;
  } else if (Array.isArray(node.value)) {
    valueCount = node.value.length;
  } else if (node.value !== undefined && node.value !== null) {
    valueCount = 1;
  } else {
    valueCount = 0;
  }

  if (valueCount !== operator.arity) {
    issues.push({
      path,
      message: `Operator "${operator.id}" expects ${operator.arity} value(s), but received ${valueCount}.`,
      severity: 'error',
    });
  }

  return issues;
}
