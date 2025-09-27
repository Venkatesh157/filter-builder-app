import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { FilterBuilder } from './filter-builder';
import type { Field } from '../core/types';
import { BASE_OPERATORS } from '../core/types';

describe('FilterBuilder interactions', () => {
  const fields: Field[] = [
    {
      id: 'name',
      label: 'Name',
      type: 'string',
      operators: [BASE_OPERATORS.eq, BASE_OPERATORS.contains],
    },
  ];

  it('allows adding and editing a condition while emitting JSON updates', async () => {
    const onJsonChange = vi.fn();

    render(
      <FilterBuilder
        fields={fields}
        onJsonChange={onJsonChange}
        debounceMs={0}
        showPreview={false}
      />
    );

    const addCondition = screen.getByRole('button', { name: /add condition/i });
    fireEvent.click(addCondition);

    const fieldSelect = await screen.findByLabelText('Select field');
    fireEvent.change(fieldSelect, { target: { value: 'name' } });

    const operatorSelect = screen.getByLabelText('Select Operator');
    fireEvent.change(operatorSelect, { target: { value: 'eq' } });

    const valueInput = screen.getByPlaceholderText('Enter value');
    fireEvent.change(valueInput, { target: { value: 'Alice' } });

    await waitFor(() => {
      expect(onJsonChange).toHaveBeenCalled();
    });

    const latest = onJsonChange.mock.calls.at(-1)?.[0];
    expect(latest).toEqual({
      and: [{ field: 'name', operator: 'eq', value: 'Alice' }],
    });
  });
});
