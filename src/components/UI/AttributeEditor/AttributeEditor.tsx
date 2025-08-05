import React, { useState, useEffect } from 'react';
import { Attribute, AttributeType, AttributeValue, AttributeValidation } from '../../../types';

// 导入专用编辑器组件
import { TextEditor } from './editors/TextEditor';
import { NumberEditor } from './editors/NumberEditor';
import { DateEditor } from './editors/DateEditor';
import { BooleanEditor } from './editors/BooleanEditor';
import { MultiSelectEditor } from './editors/MultiSelectEditor';
import { ListEditor } from './editors/ListEditor';
import { URLEditor } from './editors/URLEditor';
import { EmailEditor } from './editors/EmailEditor';
import { PhoneEditor } from './editors/PhoneEditor';
import { ColorEditor } from './editors/ColorEditor';
import { RatingEditor } from './editors/RatingEditor';
import { ProgressEditor } from './editors/ProgressEditor';
import { CurrencyEditor } from './editors/CurrencyEditor';
import { DurationEditor } from './editors/DurationEditor';
import { LocationEditor } from './editors/LocationEditor';
import { FileEditor } from './editors/FileEditor';
import { RelationEditor } from './editors/RelationEditor';

// 暂时使用简化的编辑器，避免导入错误
const SimpleEditor: React.FC<{
  value: AttributeValue;
  onChange: (value: AttributeValue) => void;
  disabled?: boolean;
  placeholder?: string;
  attribute: Attribute;
  type?: string;
  onConfigChange?: (config: Partial<Attribute>) => void;
}> = ({ value, onChange, disabled, placeholder, attribute, type = 'text', onConfigChange }) => {
  // 直接使用属性中的选项，避免状态同步问题
  const getOptions = () => {
    return attribute.options?.choices || attribute.enumValues || [];
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let newValue: AttributeValue = e.target.value;
    
    if (attribute.type === AttributeType.NUMBER || attribute.type === AttributeType.RATING || 
        attribute.type === AttributeType.PROGRESS || attribute.type === AttributeType.CURRENCY) {
      newValue = parseFloat(e.target.value) || 0;
    } else if (attribute.type === AttributeType.BOOLEAN) {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (attribute.type === AttributeType.LIST || attribute.type === AttributeType.MULTI_SELECT) {
      newValue = e.target.value.split(',').map(v => v.trim()).filter(Boolean);
    }
    
    onChange(newValue);
  };

  // 布尔值编辑器
  if (attribute.type === AttributeType.BOOLEAN) {
    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={handleChange}
          disabled={disabled}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="ml-2 text-sm theme-text-secondary">
          {value ? '是' : '否'}
        </span>
      </div>
    );
  }

  // 数字编辑器
  if (attribute.type === AttributeType.NUMBER || attribute.type === AttributeType.RATING || 
      attribute.type === AttributeType.PROGRESS || attribute.type === AttributeType.CURRENCY) {
    return (
      <input
        type="number"
        value={typeof value === 'number' ? value : ''}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        step={attribute.options?.step || 1}
        min={attribute.validation?.min}
        max={attribute.validation?.max}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  }

  // 日期编辑器
  if (attribute.type === AttributeType.DATE) {
    const dateValue = value instanceof Date ? value.toISOString().split('T')[0] : 
                     typeof value === 'string' ? value : '';
    return (
      <input
        type="date"
        value={dateValue}
        onChange={(e) => onChange(new Date(e.target.value))}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  }

  // 多选编辑器
  if (attribute.type === AttributeType.MULTI_SELECT || attribute.type === AttributeType.ENUM) {
    const currentOptions = getOptions();
    const currentValues = Array.isArray(value) ? value.filter(v => typeof v === 'string') as string[] : [];
    
    const handleAddOption = () => {
      const newOption = prompt('请输入新选项:');
      if (newOption?.trim() && !currentOptions.includes(newOption.trim())) {
        const updatedOptions = [...currentOptions, newOption.trim()];
        
        // 如果有配置变更回调，则持久化保存
        if (onConfigChange) {
          // 更新属性的选项配置
          const newConfig: Partial<Attribute> = {
            ...attribute,
            options: {
              ...attribute.options,
              choices: updatedOptions
            },
            // 如果使用的是旧的enumValues，也要更新
            enumValues: attribute.enumValues ? updatedOptions : undefined
          };
          onConfigChange(newConfig);
          alert(`新选项"${newOption.trim()}"已永久添加到属性配置中！`);
        } else {
          // 如果没有配置回调，提示用户无法持久化
          alert(`无法保存新选项"${newOption.trim()}"。请联系开发者添加配置回调功能。`);
        }
      } else if (newOption?.trim() && currentOptions.includes(newOption.trim())) {
        alert('该选项已存在！');
      }
    };

    const handleToggleValue = (optionValue: string) => {
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    };
    
    return (
      <div className="space-y-2">
        {/* 选项列表 */}
        <div className="space-y-1">
          {currentOptions.map((option: string, index: number) => (
            <label key={index} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentValues.includes(option)}
                onChange={() => handleToggleValue(option)}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm theme-text-secondary">{option}</span>
            </label>
          ))}
        </div>
        
        {/* 添加新选项按钮 */}
        {!disabled && (
          <button
            type="button"
            onClick={handleAddOption}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            + 添加新选项
          </button>
        )}
        
        {/* 已选择的值显示 */}
        {currentValues.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {currentValues.map((val, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {val}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleToggleValue(val)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 列表编辑器
  if (attribute.type === AttributeType.LIST) {
    const currentItems = Array.isArray(value) ? value.filter(v => typeof v === 'string') as string[] : [];
    
    const handleAddItem = () => {
      const newItem = prompt('请输入新项目:');
      if (newItem?.trim()) {
        const newItems = [...currentItems, newItem.trim()];
        onChange(newItems);
      }
    };

    const handleRemoveItem = (index: number) => {
      const newItems = currentItems.filter((_, i) => i !== index);
      onChange(newItems);
    };

    const handleEditItem = (index: number) => {
      const currentItem = currentItems[index];
      const editedItem = prompt('编辑项目:', currentItem);
      if (editedItem !== null && editedItem.trim()) {
        const newItems = [...currentItems];
        newItems[index] = editedItem.trim();
        onChange(newItems);
      }
    };
    
    return (
      <div className="space-y-2">
        {/* 项目列表 */}
        <div className="space-y-1">
          {currentItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
              <span className="flex-1 text-sm theme-text-secondary">{item}</span>
              {!disabled && (
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => handleEditItem(index)}
                    className="text-xs text-blue-600 hover:text-blue-800 px-1"
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-xs text-red-600 hover:text-red-800 px-1"
                    title="删除"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* 添加新项目按钮 */}
        {!disabled && (
          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-2 px-3 text-sm text-blue-600 border border-blue-300 border-dashed rounded-md hover:bg-blue-50 transition-colors"
          >
            + 添加项目
          </button>
        )}
        
        {/* 快速输入区域 */}
        {!disabled && (
          <div>
            <textarea
              placeholder="或者在这里输入多个项目，用换行分隔，点击回车添加..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  const textarea = e.target as HTMLTextAreaElement;
                  const newItems = textarea.value
                    .split('\n')
                    .map(item => item.trim())
                    .filter(Boolean);
                  if (newItems.length > 0) {
                    onChange([...currentItems, ...newItems]);
                    textarea.value = '';
                  }
                }
              }}
            />
            <div className="text-xs theme-text-tertiary mt-1">
              每行一个项目，按 Enter 键添加，Shift+Enter 换行
            </div>
          </div>
        )}
        
        {currentItems.length === 0 && (
          <div className="text-xs theme-text-tertiary text-center py-4 border border-dashed theme-border-secondary rounded">
            暂无项目
          </div>
        )}
      </div>
    );
  }

  // 默认文本编辑器
  const isMultiline = attribute.validation?.maxLength && attribute.validation.maxLength > 100;
  
  if (isMultiline) {
    return (
      <textarea
        value={typeof value === 'string' ? value : ''}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={4}
        maxLength={attribute.validation?.maxLength}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
      />
    );
  }

  return (
    <input
      type={attribute.type === AttributeType.EMAIL ? 'email' : 
            attribute.type === AttributeType.URL ? 'url' :
            attribute.type === AttributeType.PHONE ? 'tel' :
            attribute.type === AttributeType.COLOR ? 'color' : 'text'}
      value={typeof value === 'string' ? value : ''}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder}
      maxLength={attribute.validation?.maxLength}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

interface AttributeEditorProps {
  /** 属性定义 */
  attribute: Attribute;
  /** 当前值 */
  value: AttributeValue;
  /** 值变更回调 */
  onChange: (value: AttributeValue) => void;
  /** 属性配置变更回调 */
  onConfigChange?: (config: Partial<Attribute>) => void;
  /** 是否禁用编辑 */
  disabled?: boolean;
  /** 是否显示验证错误 */
  showValidation?: boolean;
  /** 额外的CSS类名 */
  className?: string;
  /** 占位符文本 */
  placeholder?: string;
  /** 自动建议值列表 */
  suggestions?: AttributeValue[];
}

interface ValidationError {
  field: string;
  message: string;
}

/**
 * 智能属性编辑器组件
 * 根据属性类型自动选择合适的编辑器
 */
export const AttributeEditor: React.FC<AttributeEditorProps> = ({
  attribute,
  value,
  onChange,
  onConfigChange,
  disabled = false,
  showValidation = true,
  className = '',
  placeholder,
  suggestions = []
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // 验证属性值
  const validateValue = (val: AttributeValue): string | null => {
    if (!attribute.validation) return null;

    const validation = attribute.validation;

    // 必填验证
    if (validation.required) {
      if (val === null || val === undefined || val === '') {
        return `${attribute.name}为必填项`;
      }
      if (Array.isArray(val) && val.length === 0) {
        return `${attribute.name}至少需要一个值`;
      }
    }

    // 字符串长度验证
    if (typeof val === 'string') {
      if (validation.minLength && val.length < validation.minLength) {
        return `${attribute.name}最少需要${validation.minLength}个字符`;
      }
      if (validation.maxLength && val.length > validation.maxLength) {
        return `${attribute.name}最多${validation.maxLength}个字符`;
      }
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(val)) {
          return `${attribute.name}格式不正确`;
        }
      }
    }

    // 数值验证
    if (typeof val === 'number') {
      if (validation.min !== undefined && val < validation.min) {
        return `${attribute.name}不能小于${validation.min}`;
      }
      if (validation.max !== undefined && val > validation.max) {
        return `${attribute.name}不能大于${validation.max}`;
      }
    }

    // 自定义验证
    if (validation.custom) {
      const result = validation.custom(val);
      if (typeof result === 'string') {
        return result;
      }
      if (result === false) {
        return `${attribute.name}验证失败`;
      }
    }

    return null;
  };

  // 处理值变更
  const handleChange = (newValue: AttributeValue) => {
    onChange(newValue);
    
    // 验证新值
    if (showValidation) {
      const error = validateValue(newValue);
      setValidationError(error);
    }
  };

  // 根据属性类型渲染对应的编辑器
  const renderEditor = () => {
    const commonProps = {
      value,
      onChange: handleChange,
      disabled,
      placeholder: placeholder || `请输入${attribute.name}`,
      attribute,
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
    };

    switch (attribute.type) {
      case AttributeType.TEXT:
        return <TextEditor {...commonProps} />;
      case AttributeType.NUMBER:
        return <NumberEditor {...commonProps} />;
      case AttributeType.DATE:
        return <DateEditor {...commonProps} />;
      case AttributeType.BOOLEAN:
        return <BooleanEditor {...commonProps} />;
      case AttributeType.MULTI_SELECT:
        return <MultiSelectEditor {...commonProps} />;
      case AttributeType.LIST:
        return <ListEditor {...commonProps} />;
      case AttributeType.URL:
        return <URLEditor {...commonProps} />;
      case AttributeType.EMAIL:
        return <EmailEditor {...commonProps} />;
      case AttributeType.PHONE:
        return <PhoneEditor {...commonProps} />;
      case AttributeType.COLOR:
        return <ColorEditor {...commonProps} />;
      case AttributeType.RATING:
        return <RatingEditor {...commonProps} />;
      case AttributeType.PROGRESS:
        return <ProgressEditor {...commonProps} />;
      case AttributeType.CURRENCY:
        return <CurrencyEditor {...commonProps} />;
      case AttributeType.DURATION:
        return <DurationEditor {...commonProps} />;
      case AttributeType.LOCATION:
        return <LocationEditor {...commonProps} />;
      case AttributeType.FILE:
        return <FileEditor {...commonProps} />;
      case AttributeType.RELATION:
        return <RelationEditor {...commonProps} />;
      case AttributeType.ENUM:
        // ENUM 类型使用 MULTI_SELECT 编辑器
        return <MultiSelectEditor {...commonProps} />;
      default:
        return <TextEditor {...commonProps} />;
    }
  };

  const isCompact = className?.includes('compact');

  return (
    <div className={`attribute-editor ${className}`}>
      {/* 属性标签 - 紧凑模式下隐藏，因为父组件已经显示 */}
      {!isCompact && (
        <div className="flex items-center justify-between mb-2">
          <label 
            className={`block text-sm font-medium ${
              validationError ? 'text-red-600 dark:text-red-400' : 'theme-text-secondary'
            }`}
          >
            {attribute.name}
            {attribute.validation?.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          
          {/* 属性类型指示器 */}
          <span className="text-xs theme-text-tertiary theme-bg-secondary px-2 py-1 rounded">
            {attribute.type}
          </span>
        </div>
      )}

      {/* 属性描述 - 紧凑模式下隐藏，因为父组件已经显示 */}
      {!isCompact && attribute.description && (
        <p className="text-sm theme-text-tertiary mb-2">
          {attribute.description}
        </p>
      )}

      {/* 紧凑模式下显示类型指示器 */}
      {isCompact && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs theme-text-tertiary">
            {attribute.validation?.required && (
              <span className="text-red-500 mr-1">*</span>
            )}
            类型: {attribute.type}
          </span>
        </div>
      )}

      {/* 编辑器容器 */}
      <div className={`editor-container ${isFocused ? 'focused' : ''}`}>
        {renderEditor()}
      </div>

      {/* 验证错误提示 */}
      {showValidation && validationError && (
        <div className="mt-1 text-xs text-red-500 flex items-center">
          <span className="mr-1 text-red-500 text-xs">⚠</span>
          {validationError}
        </div>
      )}

      {/* 帮助文本 - 紧凑模式下简化显示 */}
      {!validationError && attribute.validation && (
        <div className={`mt-1 text-xs theme-text-tertiary ${isCompact ? 'text-xs' : ''}`}>
          {attribute.validation.required && '必填项'}
          {!isCompact && attribute.validation.minLength && ` • 最少${attribute.validation.minLength}字符`}
          {!isCompact && attribute.validation.maxLength && ` • 最多${attribute.validation.maxLength}字符`}
          {!isCompact && attribute.validation.min !== undefined && ` • 最小值${attribute.validation.min}`}
          {!isCompact && attribute.validation.max !== undefined && ` • 最大值${attribute.validation.max}`}
        </div>
      )}
    </div>
  );
};

export default AttributeEditor; 