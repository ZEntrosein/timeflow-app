import React, { useState } from 'react';
import { Attribute, AttributeValue } from '../../../../types';

interface ListEditorProps {
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  suggestions?: AttributeValue[];
  onFocus?: () => void;
  onBlur?: () => void;
}

export const ListEditor: React.FC<ListEditorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = '添加项目...',
  attribute,
  onFocus,
  onBlur
}) => {
  const [newItem, setNewItem] = useState('');
  const listValues = Array.isArray(value) ? value.filter(v => typeof v === 'string') as string[] : [];

  const handleAddItem = () => {
    if (newItem.trim() && !listValues.includes(newItem.trim())) {
      const newValues = [...listValues, newItem.trim()];
      onChange(newValues);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const newValues = listValues.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  return (
    <div className="space-y-2">
      {/* 现有项目列表 */}
      {listValues.length > 0 && (
        <div className="space-y-1">
          {listValues.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md"
            >
              <span className="text-sm">{item}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  删除
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 添加新项目 */}
      {!disabled && (
        <div className="flex space-x-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            onFocus={onFocus}
            onBlur={onBlur}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddItem}
            disabled={!newItem.trim()}
            className="px-4 py-2 theme-btn-primary rounded-md"
          >
            添加
          </button>
        </div>
      )}

      {/* 空状态提示 */}
      {listValues.length === 0 && (
        <div className="text-sm theme-text-tertiary text-center py-4 border-2 border-dashed theme-border-secondary rounded-md">
          暂无项目
        </div>
      )}
    </div>
  );
}; 