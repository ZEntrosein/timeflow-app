import React, { useState } from 'react';
import { useProjectStore } from '../../store';
import { TimelineEvent, AttributeType } from '../../types';

interface AddEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEventDialog: React.FC<AddEventDialogProps> = ({ isOpen, onClose }) => {
  const { addEvent, getObjects } = useProjectStore();
  const objects = getObjects();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: 0,
    endTime: 0,
    category: 'task',
    participants: [] as string[],
    location: '',
    tags: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '标题不能为空';
    }

    if (formData.startTime < 0) {
      newErrors.startTime = '开始时间不能为负数';
    }

    if (formData.endTime > 0 && formData.endTime <= formData.startTime) {
      newErrors.endTime = '结束时间必须大于开始时间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const eventData: Omit<TimelineEvent, 'id' | 'createdAt'> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      startTime: formData.startTime,
      endTime: formData.endTime > formData.startTime ? formData.endTime : undefined,
      category: formData.category,
      participants: formData.participants,
      location: formData.location.trim() || undefined,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      attributes: [
        {
          id: `${Date.now()}-priority`,
          name: 'priority',
          value: '中等',
          type: AttributeType.TEXT,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      updatedAt: new Date().toISOString(),
      state: { visible: true, locked: false }
    };

    addEvent(eventData);
    onClose();
    
    // 重置表单
    setFormData({
      title: '',
      description: '',
      startTime: 0,
      endTime: 0,
      category: 'task',
      participants: [],
      location: '',
      tags: '',
    });
    setErrors({});
  };

  const handleParticipantToggle = (objectId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(objectId)
        ? prev.participants.filter(id => id !== objectId)
        : [...prev.participants, objectId]
    }));
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
          maxWidth: '600px',
          maxHeight: '90%',
          overflow: 'auto'
        }}
      >
        {/* 标题栏 */}
        <div 
          style={{
            backgroundColor: '#f9fafb',
            borderBottom: '2px solid #e5e7eb',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            添加新事件
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#6b7280'
            }}
          >
            ×
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                事件标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.title ? '2px solid #f87171' : '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: errors.title ? '#fef2f2' : 'white',
                  color: '#1f2937',
                  outline: 'none'
                }}
                placeholder="输入事件标题"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = errors.title ? '#f87171' : '#d1d5db'}
              />
              {errors.title && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                开始时间 *
              </label>
              <input
                type="number"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: Number(e.target.value) }))}
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
                placeholder="0"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = errors.startTime ? '#f87171' : '#d1d5db'}
              />
              {errors.startTime && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                  {errors.startTime}
                </p>
              )}
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                结束时间（可选）
              </label>
              <input
                type="number"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: Number(e.target.value) }))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.endTime ? '2px solid #f87171' : '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: errors.endTime ? '#fef2f2' : 'white',
                  color: '#1f2937',
                  outline: 'none'
                }}
                placeholder="留空表示瞬时事件"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = errors.endTime ? '#f87171' : '#d1d5db'}
              />
              {errors.endTime && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                  {errors.endTime}
                </p>
              )}
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                事件类型
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
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="task">任务</option>
                <option value="meeting">会议</option>
                <option value="milestone">里程碑</option>
                <option value="design">设计</option>
                <option value="development">开发</option>
                <option value="testing">测试</option>
                <option value="review">评审</option>
                <option value="deployment">部署</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                地点（可选）
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
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
                placeholder="输入地点"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>

          {/* 描述 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              事件描述
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
              placeholder="详细描述事件内容"
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* 参与者 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              参与对象
            </label>
            <div style={{
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              padding: '16px',
              maxHeight: '128px',
              overflowY: 'auto',
              backgroundColor: '#f9fafb'
            }}>
              {objects.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>暂无可选对象</p>
              ) : (
                <div>
                  {objects.map((obj) => (
                    <label 
                      key={obj.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '8px', 
                        borderRadius: '4px',
                        marginBottom: '4px',
                        cursor: 'pointer',
                        backgroundColor: 'white'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <input
                        type="checkbox"
                        checked={formData.participants.includes(obj.id)}
                        onChange={() => handleParticipantToggle(obj.id)}
                        style={{ marginRight: '12px', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {obj.name}
                      </span>
                      <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                        ({obj.category})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 标签 */}
          <div style={{ marginBottom: '24px' }}>
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
              placeholder="例如：重要, 紧急, 设计"
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
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
              onClick={onClose}
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
                backgroundColor: '#3b82f6',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              添加事件
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};