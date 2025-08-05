import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface BooleanEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const BooleanEditor: React.FC<BooleanEditorProps> = ({
  value,
  onChange,
  disabled = false,
  attribute,
  onFocus,
  onBlur
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  const booleanValue = typeof value === 'boolean' ? value : false;

  return (
    <div className="flex items-center space-x-3">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={booleanValue}
          onChange={handleChange}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="ml-2 text-sm theme-text-secondary">
          {booleanValue ? '是' : '否'}
        </span>
      </label>
    </div>
  );
}; 