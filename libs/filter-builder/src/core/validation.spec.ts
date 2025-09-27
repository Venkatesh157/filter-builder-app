import { group, condition } from './node';
import { normalizeSchema } from './schema';
import { BASE_OPERATORS, type Field } from './types';
import { validateTree } from './validation';

describe('validation', () => {
  const fields: Field[] = [
    {
      id: 'price',
      label: 'Price',
      type: 'number',
      operators: [BASE_OPERATORS.between, BASE_OPERATORS.gt],
    },
    {
      id: 'category',
      label: 'Category',
      type: 'string',
      operators: [BASE_OPERATORS.in, BASE_OPERATORS.eq],
    },
    {
      id: 'deleted',
      label: 'Deleted',
      type: 'boolean',
      operators: [BASE_OPERATORS.is_null, BASE_OPERATORS.is_not_null],
    },
  ];

  const schema = normalizeSchema(fields);

  it('flags between operators without a pair of values', () => {
    const tree = group('AND', [condition('price', 'between', [10])]);
    const issues = validateTree(tree, schema);
    expect(issues.some((issue) => issue.message.includes('pair'))).toBe(true);
  });

  it('flags list operators without an array of values', () => {
    const tree = group('AND', [condition('category', 'in', 'books')]);
    const issues = validateTree(tree, schema);
    expect(issues.some((issue) => issue.message.includes('array of values'))).toBe(
      true
    );
  });

  it('flags none operators when a value is provided', () => {
    const tree = group('AND', [condition('deleted', 'is_null', true)]);
    const issues = validateTree(tree, schema);
    expect(issues.some((issue) => issue.message.includes('should not receive'))).toBe(
      true
    );
  });

  it('accepts valid configurations', () => {
    const tree = group('AND', [
      condition('price', 'between', [10, 20]),
      condition('category', 'in', ['books', 'music']),
      condition('deleted', 'is_null'),
    ]);

    const issues = validateTree(tree, schema);
    expect(issues).toHaveLength(0);
  });
});

