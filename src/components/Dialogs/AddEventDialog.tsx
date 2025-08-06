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
          maxWidth: '600px',
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
            添加新事件
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="theme-form-label" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                事件标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`theme-form-input ${errors.title ? 'error' : ''}`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="输入事件标题"
              />
              {errors.title && (
                <p className="theme-form-error" style={{ fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="theme-form-label" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                开始时间 *
              </label>
              <input
                type="number"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: Number(e.target.value) }))}
                className={`theme-form-input ${errors.startTime ? 'error' : ''}`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="0"
              />
              {errors.startTime && (
                <p className="theme-form-error" style={{ fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                  {errors.startTime}
                </p>
              )}
            </div>

            <div>
              <label className="theme-form-label" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                结束时间（可选）
              </label>
              <input
                type="number"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: Number(e.target.value) }))}
                className={`theme-form-input ${errors.endTime ? 'error' : ''}`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="留空表示瞬时事件"
              />
              {errors.endTime && (
                <p className="theme-form-error" style={{ fontSize: '12px', marginTop: '4px', fontWeight: '500' }}>
                  {errors.endTime}
                </p>
              )}
            </div>

            <div>
              <label className="theme-form-label" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                事件类型
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
              <label className="theme-form-label" style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '8px' 
              }}>
                地点（可选）
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="theme-form-input"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                placeholder="输入地点"
              />
            </div>
          </div>

          {/* 描述 */}
          <div style={{ marginBottom: '20px' }}>
            <label className="theme-form-label" style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '8px' 
            }}>
              事件描述
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
              placeholder="详细描述事件内容"
            />
          </div>

          {/* 参与者 */}
          <div style={{ marginBottom: '20px' }}>
            <label className="theme-form-label" style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '8px' 
            }}>
              参与对象
            </label>
            <div className="theme-participants-container" style={{
              borderRadius: '8px',
              padding: '16px',
              maxHeight: '128px',
              overflowY: 'auto'
            }}>
              {objects.length === 0 ? (
                <p className="theme-form-label" style={{ fontSize: '14px', margin: 0 }}>暂无可选对象</p>
              ) : (
                <div>
                  {objects.map((obj) => (
                    <label 
                      key={obj.id} 
                      className="theme-participant-item"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '8px', 
                        borderRadius: '4px',
                        marginBottom: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.participants.includes(obj.id)}
                        onChange={() => handleParticipantToggle(obj.id)}
                        style={{ marginRight: '12px', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {obj.name}
                      </span>
                      <span className="theme-participant-category" style={{ fontSize: '12px', marginLeft: '8px' }}>
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
              placeholder="例如：重要, 紧急, 设计"
            />
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
              className="theme-btn-submit-event"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              添加事件
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};