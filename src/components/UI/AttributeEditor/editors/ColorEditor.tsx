import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface ColorEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const ColorEditor: React.FC<ColorEditorProps> = (props) => {
  const colorValue = typeof props.value === 'string' ? props.value : '#000000';
  
  return (
    <div className="flex items-center space-x-2">
      <input
        type="color"
        value={colorValue}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.disabled}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
      />
      <input
        type="text"
        value={colorValue}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.disabled}
        placeholder="#000000"
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
}; 