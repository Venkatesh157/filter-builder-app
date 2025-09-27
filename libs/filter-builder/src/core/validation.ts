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

  const value = node.value;
  const shape = operator.valueShape;

  const ensureNone = () => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value) && value.length === 0) {
      return;
    }

    issues.push({
      path,
      message: `Operator "${operator.id}" should not receive a value.`,
      severity: 'error',
    });
  };

  const ensureSingle = () => {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        issues.push({
          path,
          message: `Operator "${operator.id}" expects a value.`,
          severity: 'error',
        });
      }
      return;
    }

    if (value === undefined || value === null) {
      issues.push({
        path,
        message: `Operator "${operator.id}" expects a value.`,
        severity: 'error',
      });
    }
  };

  const ensurePair = () => {
    if (!Array.isArray(value) || value.length !== 2) {
      issues.push({
        path,
        message: `Operator "${operator.id}" expects a pair of values.`,
        severity: 'error',
      });
      return;
    }

    const [first, second] = value;
    if (first === undefined || first === null || second === undefined || second === null) {
      issues.push({
        path,
        message: `Operator "${operator.id}" requires both values to be provided.`,
        severity: 'error',
      });
    }
  };

  const ensureList = () => {
    if (!Array.isArray(value) || value.length === 0) {
      issues.push({
        path,
        message: `Operator "${operator.id}" expects an array of values.`,
        severity: 'error',
      });
    }
  };

  switch (shape) {
    case 'none':
      ensureNone();
      break;
    case 'single':
      ensureSingle();
      break;
    case 'pair':
      ensurePair();
      break;
    case 'list':
      ensureList();
      break;
    default:
      break;
  }

  return issues;
}
