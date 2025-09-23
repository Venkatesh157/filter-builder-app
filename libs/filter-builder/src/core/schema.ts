import { Field, OperatorDef } from './types';

export function normalizeSchema(rawFields: Field[]) {
  const fieldsById: Record<string, Field> = {};
  const operatorsById: Record<string, OperatorDef> = {};

  for (const field of rawFields) {
    fieldsById[field.id] = field;

    for (const operator of field.operators) {
      const existing = operatorsById[operator.id];

      if (existing) {
        if (
          existing.label !== operator.label ||
          existing.arity !== operator.arity
        ) {
          throw new Error(`Operator mismatch for ${operator.id}`);
        }
      } else {
        operatorsById[operator.id] = operator;
      }
    }
  }

  for (const field of rawFields) {
    for (const operator of field.operators) {
      if (!operatorsById[operator.id]) {
        throw new Error(`Unknown operator ${operator.id} on field ${field.id}`);
      }
    }
  }

  return {
    fields: fieldsById,
    operators: operatorsById,
    root: {
      kind: 'group',
      combinator: 'AND',
      children: [],
    },
  };
}
