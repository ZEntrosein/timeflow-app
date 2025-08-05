import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface ProgressEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const ProgressEditor: React.FC<ProgressEditorProps> = (props) => {
  const progressValue = typeof props.value === 'number' ? Math.min(100, Math.max(0, props.value)) : 0;
  const unit = props.attribute.options?.progressUnit || '%';

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min="0"
          max="100"
          value={progressValue}
          onChange={(e) => props.onChange(Number(e.target.value))}
          disabled={props.disabled}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          className="flex-1"
        />
        <span className="text-sm theme-text-secondary min-w-[3rem]">
          {progressValue}{unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressValue}%` }}
        />
      </div>
    </div>
  );
}; 