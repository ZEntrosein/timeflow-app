import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface CurrencyEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const CurrencyEditor: React.FC<CurrencyEditorProps> = (props) => {
  const currency = props.attribute.options?.currency || '¥';
  const numericValue = typeof props.value === 'number' ? props.value : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    props.onChange(isNaN(val) ? 0 : val);
  };

  return (
    <div className="flex items-center">
      <span className="px-3 py-2 theme-bg-secondary border theme-border-primary border-r-0 rounded-l-md theme-text-tertiary">
        {currency}
      </span>
      <input
        type="number"
        value={numericValue}
        onChange={handleChange}
        disabled={props.disabled}
        placeholder="0.00"
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        step="0.01"
        min="0"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
}; 