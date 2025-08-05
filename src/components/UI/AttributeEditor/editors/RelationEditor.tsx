import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface RelationEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const RelationEditor: React.FC<RelationEditorProps> = (props) => {
  const relationValue = typeof props.value === 'string' ? props.value : '';
  const targetType = props.attribute.options?.relationTarget || '对象';

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={relationValue}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.disabled}
        placeholder={`选择关联的${targetType}`}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <div className="text-xs text-gray-500">
        关联类型: {targetType}
      </div>
    </div>
  );
}; 