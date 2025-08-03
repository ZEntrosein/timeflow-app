import React, { useState, useEffect } from 'react';
import { Event, WorldObject, Attribute, AttributeType } from '../types';
import { defaultStorageService } from '../services';
import { validateEvent } from '../utils/validation';
import './EventManager.css';

interface EventManagerProps {
  objects: WorldObject[];
  events: Event[];
  onEventCreated?: (event: Event) => void;
  onEventUpdated?: (event: Event) => void;
  onEventDeleted?: (eventId: string) => void;
}

export const EventManager: React.FC<EventManagerProps> = ({
  objects: initialObjects,
  events: initialEvents,
  onEventCreated,
  onEventUpdated,
  onEventDeleted
}) => {
  const [objects, setObjects] = useState<WorldObject[]>(initialObjects);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedObject, setSelectedObject] = useState<WorldObject | null>(null);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // 表单状态
  const [formData, setFormData] = useState({
    timestamp: new Date().toISOString().slice(0, 16), // datetime-local format
    newValue: '',
    description: ''
  });

  // 当props变化时更新本地状态
  useEffect(() => {
    setObjects(initialObjects);
    setEvents(initialEvents);
  }, [initialObjects, initialEvents]);

  // 处理对象选择
  const handleObjectSelect = (objectId: string) => {
    const obj = objects.find(o => o.id === objectId);
    setSelectedObject(obj || null);
    setSelectedAttribute(null);
    setFormData(prev => ({ ...prev, newValue: '' }));
  };

  // 处理属性选择
  const handleAttributeSelect = (attributeId: string) => {
    const attr = selectedObject?.attributes.find(a => a.id === attributeId);
    setSelectedAttribute(attr || null);
    setFormData(prev => ({ ...prev, newValue: '' }));
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedObject || !selectedAttribute) {
      setError('请选择对象和属性');
      return;
    }

    try {
      // 转换值类型
      let newValue: string | number | null = formData.newValue;
      if (selectedAttribute.type === AttributeType.NUMBER) {
        newValue = parseFloat(formData.newValue);
        if (isNaN(newValue)) {
          setError('数字类型属性需要输入有效数字');
          return;
        }
      } else if (selectedAttribute.type === AttributeType.ENUM) {
        if (!selectedAttribute.enumValues?.includes(formData.newValue)) {
          setError('枚举值不在允许的选项中');
          return;
        }
      }

      // 创建事件
      const event: Event = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(formData.timestamp).getTime(),
        objectId: selectedObject.id,
        attributeId: selectedAttribute.id,
        newValue,
        oldValue: selectedAttribute.value,
        description: formData.description,
        createdAt: new Date().toISOString()
      };

      // 验证事件
      validateEvent(event, objects);

      // 更新本地状态
      setEvents(prev => [...prev, event]);
      
      // 重置表单
      setFormData({
        timestamp: new Date().toISOString().slice(0, 16),
        newValue: '',
        description: ''
      });

      // 触发回调（让App组件处理存储）
      onEventCreated?.(event);
      
      setError('');
    } catch (err) {
      setError(`创建事件失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  // 删除事件
  const handleDeleteEvent = async (eventId: string) => {
    try {
      setEvents(prev => prev.filter(e => e.id !== eventId));
      onEventDeleted?.(eventId);
    } catch (err) {
      setError(`删除事件失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 渲染值输入框
  const renderValueInput = () => {
    if (!selectedAttribute) return null;

    switch (selectedAttribute.type) {
      case AttributeType.TEXT:
        return (
          <input
            type="text"
            value={formData.newValue}
            onChange={(e) => setFormData(prev => ({ ...prev, newValue: e.target.value }))}
            placeholder="输入文本值"
            required
          />
        );
      
      case AttributeType.NUMBER:
        return (
          <input
            type="number"
            value={formData.newValue}
            onChange={(e) => setFormData(prev => ({ ...prev, newValue: e.target.value }))}
            placeholder="输入数字值"
            step="any"
            required
          />
        );
      
      case AttributeType.ENUM:
        return (
          <select
            value={formData.newValue}
            onChange={(e) => setFormData(prev => ({ ...prev, newValue: e.target.value }))}
            required
          >
            <option value="">选择枚举值</option>
            {selectedAttribute.enumValues?.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="event-manager loading">加载中...</div>;
  }

  return (
    <div className="event-manager">
      <h2>事件管理</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="event-form-section">
        <h3>创建新事件</h3>
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label>选择对象:</label>
            <select
              value={selectedObject?.id || ''}
              onChange={(e) => handleObjectSelect(e.target.value)}
              required
            >
              <option value="">请选择对象</option>
              {objects.map(obj => (
                <option key={obj.id} value={obj.id}>{obj.name}</option>
              ))}
            </select>
          </div>

          {selectedObject && (
            <div className="form-group">
              <label>选择属性:</label>
              <select
                value={selectedAttribute?.id || ''}
                onChange={(e) => handleAttributeSelect(e.target.value)}
                required
              >
                <option value="">请选择属性</option>
                {selectedObject.attributes.map(attr => (
                  <option key={attr.id} value={attr.id}>
                    {attr.name} ({attr.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>事件时间:</label>
            <input
              type="datetime-local"
              value={formData.timestamp}
              onChange={(e) => setFormData(prev => ({ ...prev, timestamp: e.target.value }))}
              required
            />
          </div>

          {selectedAttribute && (
            <div className="form-group">
              <label>新值:</label>
              {renderValueInput()}
            </div>
          )}

          <div className="form-group">
            <label>描述 (可选):</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="描述这个事件的内容..."
              rows={3}
            />
          </div>

          <button type="submit" className="submit-btn">
            创建事件
          </button>
        </form>
      </div>

      <div className="events-list-section">
        <h3>事件列表</h3>
        {events.length === 0 ? (
          <p className="no-events">暂无事件</p>
        ) : (
          <div className="events-list">
            {events
              .sort((a, b) => b.timestamp - a.timestamp)
              .map(event => {
                const obj = objects.find(o => o.id === event.objectId);
                const attr = obj?.attributes.find(a => a.id === event.attributeId);
                
                return (
                  <div key={event.id} className="event-item">
                    <div className="event-header">
                      <span className="event-time">{formatTimestamp(event.timestamp)}</span>
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        className="delete-btn"
                      >
                        删除
                      </button>
                    </div>
                    <div className="event-content">
                      <div className="event-target">
                        <strong>{obj?.name}</strong> → {attr?.name}
                      </div>
                      <div className="event-value-change">
                        {event.oldValue !== undefined && (
                          <span className="old-value">{String(event.oldValue)}</span>
                        )}
                        {event.oldValue !== undefined && ' → '}
                        <span className="new-value">{String(event.newValue)}</span>
                      </div>
                      {event.description && (
                        <div className="event-description">{event.description}</div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};