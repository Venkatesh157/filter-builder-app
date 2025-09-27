import { condition, group } from './node';
import { toJSON, fromJSON, toQueryString, fromQueryString } from './serialization';
import { buildFilterRequest } from './api';

describe('serialization', () => {
  const exampleTree = () =>
    group('AND', [
      condition('age', 'gt', 30),
      group('OR', [
        condition('role', 'eq', 'admin'),
        condition('isActive', 'eq', true),
      ]),
    ]);

  const expectedJson = {
    and: [
      { field: 'age', operator: 'gt', value: 30 },
      {
        or: [
          { field: 'role', operator: 'eq', value: 'admin' },
          { field: 'isActive', operator: 'eq', value: true },
        ],
      },
    ],
  };

  it('serializes to the spec-compliant JSON format', () => {
    const json = toJSON(exampleTree());
    expect(json).toEqual(expectedJson);
  });

  it('hydrates from the spec-compliant JSON format', () => {
    const node = fromJSON(expectedJson);
    expect(node.kind).toBe('group');
    if (node.kind !== 'group') return;

    expect(node.combinator).toBe('AND');
    expect(node.children).toHaveLength(2);
    const [first, second] = node.children;
    expect(first.kind).toBe('condition');
    if (second.kind !== 'group') throw new Error('Expected nested group');
    expect(second.combinator).toBe('OR');
    expect(second.children).toHaveLength(2);
  });

  it('round-trips through query string encoding', () => {
    const qs = toQueryString(exampleTree());
    expect(qs.startsWith('filters=')).toBe(true);

    const [, encoded] = qs.split('=');
    const parsed = JSON.parse(decodeURIComponent(encoded));
    expect(parsed).toEqual(expectedJson);

    const rebuilt = fromQueryString(qs);
    expect(rebuilt.kind).toBe('group');
  });

  it('builds GET and POST requests via the API helper', () => {
    const tree = exampleTree();

    const getRequest = buildFilterRequest(tree, {
      mode: 'get',
      url: '/api/search',
    });
    expect(getRequest.url).toContain('filters=');
    expect(getRequest.init.method).toBe('GET');
    expect(getRequest.json).toEqual(expectedJson);

    const postRequest = buildFilterRequest(tree, {
      mode: 'post',
      url: '/api/search',
    });
    expect(postRequest.init.method).toBe('POST');
    expect(typeof postRequest.init.body).toBe('string');
    expect(JSON.parse(postRequest.init.body as string)).toEqual(expectedJson);
  });
});

