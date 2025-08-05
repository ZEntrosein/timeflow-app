import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface DurationEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const DurationEditor: React.FC<DurationEditorProps> = (props) => {
  const durationValue = typeof props.value === 'string' ? props.value : '';

  return (
    <input
      type="text"
      value={durationValue}
      onChange={(e) => props.onChange(e.target.value)}
      disabled={props.disabled}
      placeholder="例如: 2小时30分钟, 1天, 3周"
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
    />
  );
}; 