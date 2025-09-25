import React from 'react';
import { useOperators } from '../hooks';

export interface OperatorPickerProps {
  operatorId?: string | null;
  fieldId?: string | null;
  onChange: (next: string | null) => void;
  id?: string;
  name?: string;
  'aria-label'?: string;
  disabled?: boolean;
  placeholderLabel?: string;
}
const defaultPlaceholder = 'Select Operator';

function OperatorPicker({
  operatorId,
  fieldId,
  onChange,
  id,
  name,
  disabled,
  placeholderLabel = defaultPlaceholder,
  'aria-label': ariaLabel,
}: OperatorPickerProps) {
  const operators = useOperators(fieldId ?? undefined);
  const value = operatorId ?? '';

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value || null;
    onChange?.(next);
  };

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      aria-label={ariaLabel ?? placeholderLabel}
    >
      <option value="">{placeholderLabel}</option>
      {operators.map((operator) => (
        <option key={operator.id} value={operator.id}>
          {operator.label}
        </option>
      ))}
    </select>
  );
}

export default OperatorPicker;
