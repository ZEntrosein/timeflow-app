import React, { useState, useEffect } from 'react';
import { AttributeType, Attribute } from '../../types/attributes';

interface AddAttributeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (attribute: Omit<Attribute, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const AddAttributeDialog: React.FC<AddAttributeDialogProps> = ({ 
  isOpen, 
  onClose, 
  onAdd 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: AttributeType.TEXT,
    description: '',
    value: '',
    required: false,
    showInTable: true,
    searchable: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 重置表单和管理body滚动
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        type: AttributeType.TEXT,
        description: '',
        value: '',
        required: false,
        showInTable: true,
        searchable: true,
      });
      setErrors({});
      
      // 禁用背景滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复背景滚动
      document.body.style.overflow = 'unset';
    }
    
    // 清理函数
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '属性名称不能为空';
    }

    if (formData.name.trim().length > 50) {
      newErrors.name = '属性名称不能超过50个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const attributeData: Omit<Attribute, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name.trim(),
      type: formData.type,
      value: getDefaultValueForType(formData.type),
      description: formData.description.trim() || undefined,
      validation: {
        required: formData.required,
      },
      showInTable: formData.showInTable,
      searchable: formData.searchable,
      sortOrder: 0, // 将在添加时设置正确的值
    };

    onAdd(attributeData);
    onClose();
  };

  const getDefaultValueForType = (type: AttributeType): any => {
    switch (type) {
      case AttributeType.TEXT:
      case AttributeType.URL:
      case AttributeType.EMAIL:
      case AttributeType.PHONE:
      case AttributeType.COLOR:
        return '';
      case AttributeType.NUMBER:
      case AttributeType.CURRENCY:
      case AttributeType.RATING:
      case AttributeType.PROGRESS:
      case AttributeType.DURATION:
        return 0;
      case AttributeType.BOOLEAN:
        return false;
      case AttributeType.DATE:
        return null;
      case AttributeType.LIST:
      case AttributeType.MULTI_SELECT:
        return [];
      case AttributeType.RELATION:
        return null;
      case AttributeType.FILE:
        return '';
      case AttributeType.LOCATION:
        return null;
      default:
        return '';
    }
  };

  const attributeTypeOptions = [
    { value: AttributeType.TEXT, label: '文本' },
    { value: AttributeType.NUMBER, label: '数字' },
    { value: AttributeType.DATE, label: '日期' },
    { value: AttributeType.BOOLEAN, label: '布尔值' },
    { value: AttributeType.LIST, label: '列表' },
    { value: AttributeType.MULTI_SELECT, label: '多选' },
    { value: AttributeType.RELATION, label: '关系' },
    { value: AttributeType.URL, label: 'URL链接' },
    { value: AttributeType.EMAIL, label: '邮箱' },
    { value: AttributeType.PHONE, label: '电话' },
    { value: AttributeType.COLOR, label: '颜色' },
    { value: AttributeType.RATING, label: '评分' },
    { value: AttributeType.PROGRESS, label: '进度' },
    { value: AttributeType.CURRENCY, label: '货币' },
    { value: AttributeType.DURATION, label: '时长' },
    { value: AttributeType.LOCATION, label: '位置' },
    { value: AttributeType.FILE, label: '文件' },
  ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleBackdropClick}
      className="theme-modal-backdrop animate-in fade-in-0 duration-200"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="theme-modal-dialog bg-white dark:bg-gray-800 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          borderRadius: '12px',
          width: '90%',
          maxWidth: '480px',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
                  <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">添加新属性</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 属性名称 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                属性名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  ${errors.name ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="输入属性名称..."
                autoFocus
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* 属性类型 */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                属性类型
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AttributeType }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {attributeTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 属性描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                描述
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                rows={3}
                placeholder="输入属性描述（可选）..."
              />
            </div>

            {/* 配置选项 */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="required"
                  checked={formData.required}
                  onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded
                    bg-white dark:bg-gray-700"
                />
                <label htmlFor="required" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  必填属性
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showInTable"
                  checked={formData.showInTable}
                  onChange={(e) => setFormData(prev => ({ ...prev, showInTable: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded
                    bg-white dark:bg-gray-700"
                />
                <label htmlFor="showInTable" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  在表格中显示
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="searchable"
                  checked={formData.searchable}
                  onChange={(e) => setFormData(prev => ({ ...prev, searchable: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded
                    bg-white dark:bg-gray-700"
                />
                <label htmlFor="searchable" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  可搜索
                </label>
              </div>
            </div>

            {/* 按钮 */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                  bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md 
                  hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 border border-transparent rounded-md 
                  hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                添加属性
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 