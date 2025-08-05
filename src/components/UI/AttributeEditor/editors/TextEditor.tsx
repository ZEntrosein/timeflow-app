import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface TextEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = '',
  attribute,
  suggestions = [],
  onFocus,
  onBlur
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const isMultiline = attribute.validation?.maxLength && attribute.validation.maxLength > 100;

  if (isMultiline) {
    return (
      <textarea
        value={(value as string) || ''}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical"
        rows={4}
        maxLength={attribute.validation?.maxLength}
      />
    );
  }

  return (
    <input
      type="text"
      value={(value as string) || ''}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      maxLength={attribute.validation?.maxLength}
    />
  );
}; 