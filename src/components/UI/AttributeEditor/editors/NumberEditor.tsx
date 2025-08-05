import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface NumberEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const NumberEditor: React.FC<NumberEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = '',
  attribute,
  onFocus,
  onBlur
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(null);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
  };

  const step = attribute.options?.step || 1;
  const min = attribute.validation?.min;
  const max = attribute.validation?.max;

  return (
    <input
      type="number"
      value={typeof value === 'number' ? value : ''}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      onFocus={onFocus}
      onBlur={onBlur}
      step={step}
      min={min}
      max={max}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
    />
  );
}; 