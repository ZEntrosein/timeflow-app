import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface EmailEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const EmailEditor: React.FC<EmailEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'example@domain.com',
  attribute,
  onFocus,
  onBlur
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const emailValue = typeof value === 'string' ? value : '';

  return (
    <div className="flex items-center space-x-2">
      <input
        type="email"
        value={emailValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      {emailValue && !disabled && (
        <a
          href={`mailto:${emailValue}`}
          className="px-3 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
        >
          发送
        </a>
      )}
    </div>
  );
}; 