import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface PhoneEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const PhoneEditor: React.FC<PhoneEditorProps> = (props) => {
  return (
    <input
      type="tel"
      value={typeof props.value === 'string' ? props.value : ''}
      onChange={(e) => props.onChange(e.target.value)}
      disabled={props.disabled}
      placeholder={props.placeholder || '请输入电话号码'}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
    />
  );
}; 