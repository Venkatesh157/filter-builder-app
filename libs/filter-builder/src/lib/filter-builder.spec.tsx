import { render } from '@testing-library/react';

import { FilterBuilder } from './filter-builder';
import type { Field } from '../core/types';

describe('FilterBuilder', () => {
  it('renders successfully with minimal schema', () => {
    const fields: Field[] = [
      {
        id: 'name',
        label: 'Name',
        type: 'string',
        operators: [
          { id: 'contains', label: 'Contains', valueShape: 'single' },
        ],
      },
    ];

    const { baseElement } = render(
      <FilterBuilder fields={fields} showPreview={false} debounceMs={0} />
    );

    expect(baseElement).toBeTruthy();
  });
});
