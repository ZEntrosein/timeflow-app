import React from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface FileEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const FileEditor: React.FC<FileEditorProps> = (props) => {
  const fileValue = typeof props.value === 'string' ? props.value : '';
  const allowedExtensions = props.attribute.options?.allowedExtensions;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      props.onChange(file.name);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        onChange={handleFileChange}
        disabled={props.disabled}
        accept={allowedExtensions ? allowedExtensions.map(ext => `.${ext}`).join(',') : undefined}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      {fileValue && (
        <div className="text-sm theme-text-secondary theme-bg-secondary px-3 py-2 rounded">
          当前文件: {fileValue}
        </div>
      )}
    </div>
  );
}; 