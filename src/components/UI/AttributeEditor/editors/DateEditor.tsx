import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface DateEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const DateEditor: React.FC<DateEditorProps> = ({
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
      onChange(new Date(val));
    }
  };

  // 将值转换为日期字符串格式
  const formatValue = () => {
    if (!value) return '';
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    }
    return '';
  };

  const dateFormat = attribute.options?.dateFormat || 'date';
  const inputType = dateFormat === 'datetime' ? 'datetime-local' : 'date';

  return (
    <input
      type={inputType}
      value={formatValue()}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
    />
  );
}; 