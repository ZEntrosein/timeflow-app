import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../store';
import { WorldObject } from '../../types';

interface EditObjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  objectId?: string;
}

export const EditObjectDialog: React.FC<EditObjectDialogProps> = ({ isOpen, onClose, objectId }) => {
  const { getObject, updateObject } = useProjectStore();
  
  // 获取要编辑的对象
  const objectToEdit = objectId ? getObject(objectId) : null;

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'object',
    tags: '',
    startTime: '',
  });

  // 错误状态
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 当对象数据变化时更新表单
  useEffect(() => {
    if (objectToEdit) {
      const startTimeAttr = objectToEdit.attributes.find(attr => attr.name === 'startTime');
      setFormData({
        name: objectToEdit.name,
        description: objectToEdit.description || '',
        category: objectToEdit.category,
        tags: objectToEdit.tags ? objectToEdit.tags.join(', ') : '',
        startTime: startTimeAttr?.value ? String(startTimeAttr.value) : '',
      });
    }
  }, [objectToEdit]);

  // 重置表单
  const resetForm = () => {
    if (objectToEdit) {
      const startTimeAttr = objectToEdit.attributes.find(attr => attr.name === 'startTime');
      setFormData({
        name: objectToEdit.name,
        description: objectToEdit.description || '',
        category: objectToEdit.category,
        tags: objectToEdit.tags ? objectToEdit.tags.join(', ') : '',
        startTime: startTimeAttr?.value ? String(startTimeAttr.value) : '',
      });
    }
    setErrors({});
  };

  // 验证表单
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '对象名称不能为空';
    }

    if (formData.startTime && isNaN(Number(formData.startTime))) {
      newErrors.startTime = '出现时间必须是数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !objectId) {
      return;
    }

    // 处理标签
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // 准备属性更新
    const updatedAttributes = objectToEdit ? [...objectToEdit.attributes] : [];
    
    // 更新或添加startTime属性
    if (formData.startTime) {
      const startTimeIndex = updatedAttributes.findIndex(attr => attr.name === 'startTime');
      const startTimeValue = Number(formData.startTime);
      
      if (startTimeIndex >= 0) {
        updatedAttributes[startTimeIndex] = {
          ...updatedAttributes[startTimeIndex],
          value: startTimeValue,
          updatedAt: new Date().toISOString()
        };
      } else {
        updatedAttributes.push({
          id: `attr-startTime-${Date.now()}`,
          name: 'startTime',
          value: startTimeValue,
          type: 'NUMBER' as any,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    // 更新对象
    const updatedObject: Partial<WorldObject> = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category as any,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      attributes: updatedAttributes,
      updatedAt: new Date().toISOString(),
    };

    updateObject(objectId, updatedObject);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 处理取消
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !objectToEdit) return null;

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '2px solid #e5e7eb',
          width: '90%',
          maxWidth: '480px',
          maxHeight: '90%',
          overflow: 'auto'
        }}
      >
        {/* 标题栏 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '2px solid #f3f4f6',
          backgroundColor: '#f0fdf4',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📝</span>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              margin: 0, 
              color: '#1f2937' 
            }}>
              编辑对象
            </h2>
          </div>
          <button
            onClick={handleCancel}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            ✕
          </button>
        </div>

        {/* 表单内容 */}
        <form 
          onSubmit={handleSubmit} 
          style={{
            backgroundColor: 'white',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            padding: '20px'
          }}
        >
          {/* 基本信息 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                对象名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.name ? '2px solid #f87171' : '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: errors.name ? '#fef2f2' : 'white',
                  color: '#1f2937',
                  outline: 'none'
                }}
                placeholder="输入对象名称"
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = errors.name ? '#f87171' : '#d1d5db'}
              />
              {errors.name && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                  {errors.name}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                对象类型
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#1f2937',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="object">对象</option>
                <option value="person">人物</option>
                <option value="place">地点</option>
                <option value="project">项目</option>
                <option value="organization">组织</option>
                <option value="concept">概念</option>
                <option value="resource">资源</option>
                <option value="tool">工具</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                出现时间（可选）
              </label>
              <input
                type="number"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.startTime ? '2px solid #f87171' : '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: errors.startTime ? '#fef2f2' : 'white',
                  color: '#1f2937',
                  outline: 'none'
                }}
                placeholder="对象首次出现的时间点"
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = errors.startTime ? '#f87171' : '#d1d5db'}
              />
              {errors.startTime && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                  {errors.startTime}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                对象描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#1f2937',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder="详细描述对象的特征和作用"
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                标签（用逗号分隔）
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  color: '#1f2937',
                  outline: 'none'
                }}
                placeholder="例如：重要, 核心, 临时"
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>

          {/* 按钮 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px', 
            paddingTop: '20px', 
            borderTop: '2px solid #f3f4f6' 
          }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: '#f3f4f6',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            >
              取消
            </button>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                backgroundColor: '#10b981',
                border: '2px solid #10b981',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              保存更改
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 