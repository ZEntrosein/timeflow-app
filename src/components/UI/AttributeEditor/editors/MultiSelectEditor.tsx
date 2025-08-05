import React, { useState } from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface MultiSelectEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const MultiSelectEditor: React.FC<MultiSelectEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = '选择选项...',
  attribute,
  onFocus,
  onBlur
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 获取选项列表
  const options = attribute.options?.choices || attribute.enumValues || [];
  const selectedValues = Array.isArray(value) ? value.filter(v => typeof v === 'string') as string[] : [];
  const allowCustom = attribute.options?.allowCustom || false;

  // 过滤选项
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleOption = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option];
    onChange(newValues);
  };

  const handleAddCustom = () => {
    if (searchTerm && !options.includes(searchTerm) && !selectedValues.includes(searchTerm)) {
      const newValues = [...selectedValues, searchTerm];
      onChange(newValues);
      setSearchTerm('');
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    const newValues = selectedValues.filter(v => v !== valueToRemove);
    onChange(newValues);
  };

  return (
    <div className="relative">
      {/* 选中值显示 */}
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedValues.map((val, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
          >
            {String(val)}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveValue(String(val))}
                className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>

      {/* 下拉选择器 */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          className="w-full px-3 py-2 text-left border theme-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedValues.length > 0 
            ? `已选择 ${selectedValues.length} 项` 
            : placeholder
          }
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="w-4 h-4 theme-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>

        {/* 下拉选项 */}
        {isOpen && !disabled && (
          <div 
            className="absolute z-50 w-full mt-1 theme-bg-secondary theme-border-primary border rounded-md shadow-lg max-h-60 overflow-auto"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)'
            }}
          >
            {/* 搜索框 */}
            <div 
              className="p-2 theme-border-secondary border-b"
              style={{ backgroundColor: 'var(--input-bg)' }}
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索或添加新选项..."
                className="w-full px-2 py-1 text-sm border theme-input rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {allowCustom && searchTerm && !options.includes(searchTerm) && (
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  添加 "{searchTerm}"
                </button>
              )}
            </div>

            {/* 选项列表 */}
            <div 
              className="max-h-40 overflow-auto"
              style={{ backgroundColor: 'var(--input-bg)' }}
            >
              {filteredOptions.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center px-3 py-2 hover:theme-bg-primary cursor-pointer transition-colors duration-150"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => handleToggleOption(option)}
                    className="mr-2 text-blue-600 focus:ring-blue-500 theme-bg-secondary"
                  />
                  <span className="text-sm theme-text-primary">{option}</span>
                </label>
              ))}
              {filteredOptions.length === 0 && (
                <div 
                  className="px-3 py-2 text-sm theme-text-tertiary"
                  style={{ backgroundColor: 'var(--input-bg)' }}
                >
                  没有找到匹配的选项
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 