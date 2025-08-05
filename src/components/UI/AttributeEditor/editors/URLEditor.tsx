import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface URLEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const URLEditor: React.FC<URLEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'https://example.com',
  attribute,
  onFocus,
  onBlur
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const urlValue = typeof value === 'string' ? value : '';

  return (
    <div className="flex items-center space-x-2">
      <input
        type="url"
        value={urlValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      {urlValue && !disabled && (
        <a
          href={urlValue}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
        >
          打开
        </a>
      )}
    </div>
  );
}; 