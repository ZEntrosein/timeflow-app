import React, { useState } from 'react';
import { useProjectStore } from '../../store';
import { WorldObject, AttributeType } from '../../types';

interface AddObjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddObjectDialog: React.FC<AddObjectDialogProps> = ({ isOpen, onClose }) => {
  const { addObject } = useProjectStore();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'object',
    tags: '',
    startTime: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '名称不能为空';
    }

    if (formData.startTime && isNaN(Number(formData.startTime))) {
      newErrors.startTime = '时间必须是数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const objectData: Omit<WorldObject, 'id' | 'createdAt'> = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      category: formData.category,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      attributes: [
        ...(formData.startTime ? [{
          id: `${Date.now()}-startTime`,
          name: 'startTime',
          value: formData.startTime,
          type: AttributeType.NUMBER,
          description: '对象出现的时间点',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }] : []),
        {
          id: `${Date.now()}-status`,
          name: 'status',
          value: '活跃',
          type: AttributeType.TEXT,
          description: '对象状态',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      updatedAt: new Date().toISOString(),
      state: { visible: true, locked: false }
    };

    addObject(objectData);
    onClose();
    
    // 重置表单
    setFormData({
      name: '',
      description: '',
      category: 'object',
      tags: '',
      startTime: '',
    });
    setErrors({});
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={handleBackdropClick}
      className="theme-modal-backdrop"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="theme-modal-dialog"
        style={{
          borderRadius: '12px',
          width: '90%',
          maxWidth: '480px',
          maxHeight: '90%',
          overflow: 'auto'
        }}
      >
        {/* 标题栏 */}
        <div 
          className="theme-modal-header"
          style={{
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            添加新对象
          </h2>
          <button
            onClick={onClose}
            className="theme-modal-close-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            ×
          </button>
        </div>

        {/* 表单内容 */}
        <form 
          onSubmit={handleSubmit} 
          style={{
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            padding: '20px'
          }}
        >
          {/* 基本信息 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label className="theme-form-label" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                对象名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`theme-form-input ${errors.name ? 'error' : ''}`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="输入对象名称"
              />
              {errors.name && (
                <p className="theme-form-error" style={{ fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                  {errors.name}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="theme-form-label" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                对象类型
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="theme-form-input"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
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
              <label className="theme-form-label" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                出现时间（可选）
              </label>
              <input
                type="number"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className={`theme-form-input ${errors.startTime ? 'error' : ''}`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="对象首次出现的时间点"
              />
              {errors.startTime && (
                <p className="theme-form-error" style={{ fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                  {errors.startTime}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="theme-form-label" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                对象描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="theme-form-input"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                placeholder="详细描述对象的特征和作用"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="theme-form-label" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                标签（用逗号分隔）
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="theme-form-input"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="例如：重要, 核心, 临时"
              />
            </div>
          </div>

          {/* 按钮 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px', 
            paddingTop: '20px', 
            borderTop: '2px solid var(--border-primary)' 
          }}>
            <button
              type="button"
              onClick={onClose}
              className="theme-btn-cancel"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              取消
            </button>
            <button
              type="submit"
              className="theme-btn-submit-object"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              添加对象
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 