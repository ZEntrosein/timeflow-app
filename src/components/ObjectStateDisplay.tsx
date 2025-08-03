import React, { memo, useState, useEffect, useCallback } from 'react';
import { WorldObject, Event, ObjectState, AttributeType } from '../types';
import { defaultTemporalEngine } from '../services';
import { defaultStorageService } from '../services';
import './ObjectStateDisplay.css';

interface ObjectStateDisplayProps {
  objects: WorldObject[];
  events: Event[];
  currentTime: number;
  onObjectSelect?: (objectId: string) => void;
  selectedObjectId?: string;
  showAnimations?: boolean;
}

interface AttributeDisplayProps {
  attribute: {
    id: string;
    name: string;
    type: AttributeType;
    enumValues?: string[];
  };
  value: string | number | null;
  previousValue?: string | number | null;
  showAnimation?: boolean;
}

// 属性值显示组件
const AttributeDisplay: React.FC<AttributeDisplayProps> = memo(({
  attribute,
  value,
  previousValue,
  showAnimation = true
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const hasChanged = previousValue !== undefined && previousValue !== value;

  useEffect(() => {
    if (hasChanged && showAnimation) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [hasChanged, showAnimation]);

  const formatValue = (val: string | number | null): string => {
    if (val === null || val === undefined) return '--';
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return String(val);
  };

  const getValueColor = (type: AttributeType, val: string | number | null): string => {
    if (val === null || val === undefined) return '#6c757d';
    
    switch (type) {
      case AttributeType.NUMBER:
        return '#007bff';
      case AttributeType.ENUM:
        // 不同枚举值使用不同颜色
        if (val === 'healthy') return '#28a745';
        if (val === 'injured') return '#ffc107';
        if (val === 'dead') return '#dc3545';
        return '#6f42c1';
      case AttributeType.TEXT:
        return '#17a2b8';
      default:
        return '#495057';
    }
  };

  return (
    <div className={`attribute-display ${isAnimating ? 'animating' : ''}`}>
      <div className="attribute-info">
        <span className="attribute-name">{attribute.name}</span>
        <span className="attribute-type">({attribute.type})</span>
      </div>
      <div 
        className="attribute-value"
        style={{ color: getValueColor(attribute.type, value) }}
      >
        {formatValue(value)}
      </div>
      {hasChanged && showAnimation && (
        <div className="value-change-indicator">
          <span className="previous-value">{formatValue(previousValue)}</span>
          <span className="arrow">→</span>
          <span className="new-value">{formatValue(value)}</span>
        </div>
      )}
    </div>
  );
});

AttributeDisplay.displayName = 'AttributeDisplay';

// 单个对象状态显示组件
const ObjectCard: React.FC<{
  object: WorldObject;
  state: ObjectState;
  previousState?: ObjectState;
  isSelected?: boolean;
  onClick?: () => void;
  showAnimations?: boolean;
}> = memo(({
  object,
  state,
  previousState,
  isSelected = false,
  onClick,
  showAnimations = true
}) => {
  return (
    <div 
      className={`object-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="object-header">
        <h3 className="object-name">{object.name}</h3>
        <span className="object-id">#{object.id}</span>
      </div>
      
      {object.description && (
        <p className="object-description">{object.description}</p>
      )}
      
      <div className="attributes-grid">
        {object.attributes.map(attribute => (
          <AttributeDisplay
            key={attribute.id}
            attribute={attribute}
            value={state.attributeValues[attribute.id]}
            previousValue={previousState?.attributeValues[attribute.id]}
            showAnimation={showAnimations}
          />
        ))}
      </div>
      
      <div className="object-footer">
        <span className="timestamp">
          更新时间: {new Date(state.timestamp).toLocaleString('zh-CN')}
        </span>
      </div>
    </div>
  );
});

ObjectCard.displayName = 'ObjectCard';

// 主组件
export const ObjectStateDisplay: React.FC<ObjectStateDisplayProps> = ({
  objects,
  events,
  currentTime,
  onObjectSelect,
  selectedObjectId,
  showAnimations = true
}) => {
  const [objectStates, setObjectStates] = useState<Map<string, ObjectState>>(new Map());
  const [previousStates, setPreviousStates] = useState<Map<string, ObjectState>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 新建对象表单状态
  const [showNewObjectForm, setShowNewObjectForm] = useState(false);
  const [newObjectData, setNewObjectData] = useState({
    name: '',
    category: '',
    description: ''
  });
  // 添加属性表单状态
  const [showAddAttrId, setShowAddAttrId] = useState<string | null>(null);
  const [newAttrData, setNewAttrData] = useState({
    name: '',
    type: AttributeType.TEXT,
    enumValues: '',
    description: ''
  });

  // 计算所有对象在当前时间的状态
  const calculateCurrentStates = useCallback(async () => {
    if (objects.length === 0) return;

    try {
      setLoading(true);
      setError('');

      // 保存之前的状态用于动画
      setPreviousStates(new Map(objectStates));

      // 批量计算所有对象的状态
      const objectIds = objects.map(obj => obj.id);
      const newStates = defaultTemporalEngine.calculateMultipleStatesAtTime(
        objectIds,
        currentTime,
        events,
        objects
      );

      setObjectStates(newStates);
    } catch (err) {
      setError(`状态计算失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  }, [objects, events, currentTime, objectStates]);

  // 当时间变化时重新计算状态
  useEffect(() => {
    calculateCurrentStates();
  }, [currentTime, objects, events]);

  // 处理对象选择
  const handleObjectClick = useCallback((objectId: string) => {
    onObjectSelect?.(objectId);
  }, [onObjectSelect]);

  // 获取活跃对象（在当前时间存在的对象）
  const getActiveObjects = useCallback(() => {
    return objects.filter(obj => {
      return defaultTemporalEngine.objectExistsAtTime(obj.id, currentTime, events, obj);
    });
  }, [objects, currentTime, events]);

  // 计算统计信息
  const getStatistics = useCallback(() => {
    const activeObjects = getActiveObjects();
    const totalObjects = objects.length;
    const activeCount = activeObjects.length;
    
    // 计算总的属性变化次数
    const totalChanges = objects.reduce((total, obj) => {
      return total + obj.attributes.reduce((attrTotal, attr) => {
        return attrTotal + defaultTemporalEngine.getAttributeChangeCount(
          obj.id,
          attr.id,
          0,
          currentTime,
          events
        );
      }, 0);
    }, 0);

    return {
      totalObjects,
      activeCount,
      totalChanges
    };
  }, [objects, currentTime, events, getActiveObjects]);

  const statistics = getStatistics();
  const activeObjects = getActiveObjects();

  // 新建对象处理
  const handleCreateObject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjectData.name.trim()) return;
    const id = `object-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const obj: WorldObject = {
      id,
      name: newObjectData.name.trim(),
      attributes: [],
      category: newObjectData.category.trim() || '未分类',
      description: newObjectData.description.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await defaultStorageService.saveObject(obj);
    setShowNewObjectForm(false);
    setNewObjectData({ name: '', category: '', description: '' });
    // 刷新对象列表
    if (typeof window !== 'undefined') window.location.reload();
  };
  // 添加属性处理
  const handleAddAttribute = async (object: WorldObject, e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttrData.name.trim()) return;
    const attrId = `attr-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const attr = {
      id: attrId,
      name: newAttrData.name.trim(),
      type: newAttrData.type,
      value: null,
      enumValues: newAttrData.type === AttributeType.ENUM ? newAttrData.enumValues.split(',').map(v=>v.trim()).filter(Boolean) : undefined,
      description: newAttrData.description.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedObj = { ...object, attributes: [...object.attributes, attr], updatedAt: new Date().toISOString() };
    await defaultStorageService.saveObject(updatedObj);
    setShowAddAttrId(null);
    setNewAttrData({ name: '', type: AttributeType.TEXT, enumValues: '', description: '' });
    if (typeof window !== 'undefined') window.location.reload();
  };

  if (loading && objectStates.size === 0) {
    return (
      <div className="state-display loading">
        <div className="loading-spinner">计算对象状态中...</div>
      </div>
    );
  }

  return (
    <div className="object-state-display">
      <div className="state-header">
        <h2>对象状态</h2>
        <div className="state-statistics">
          <span className="stat-item">
            活跃对象: {statistics.activeCount}/{statistics.totalObjects}
          </span>
          <span className="stat-item">
            总变化数: {statistics.totalChanges}
          </span>
        </div>
        <button onClick={()=>setShowNewObjectForm(v=>!v)} style={{marginLeft:'1em'}}>
          {showNewObjectForm ? '取消新建' : '新建对象'}
        </button>
      </div>
      {showNewObjectForm && (
        <form className="new-object-form" onSubmit={handleCreateObject} style={{margin:'1em 0',padding:'1em',border:'1px solid #ccc',borderRadius:6}}>
          <div>
            <label>名称：</label>
            <input value={newObjectData.name} onChange={e=>setNewObjectData(d=>({...d,name:e.target.value}))} required />
          </div>
          <div>
            <label>类型/分类：</label>
            <input value={newObjectData.category} onChange={e=>setNewObjectData(d=>({...d,category:e.target.value}))} placeholder="如 角色/城市/神器..." />
          </div>
          <div>
            <label>描述：</label>
            <input value={newObjectData.description} onChange={e=>setNewObjectData(d=>({...d,description:e.target.value}))} />
          </div>
          <button type="submit">创建</button>
        </form>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {activeObjects.length === 0 ? (
        <div className="no-objects">
          <p>当前时间点没有活跃的对象</p>
        </div>
      ) : (
        <div className="objects-grid">
          {activeObjects.map(object => {
            const state = objectStates.get(object.id);
            const previousState = previousStates.get(object.id);
            
            if (!state) return null;

            return (
              <div key={object.id} style={{position:'relative'}}>
                <ObjectCard
                  object={object}
                  state={state}
                  previousState={previousState}
                  isSelected={selectedObjectId === object.id}
                  onClick={() => handleObjectClick(object.id)}
                  showAnimations={showAnimations}
                />
                <button style={{marginTop:8}} onClick={()=>setShowAddAttrId(showAddAttrId===object.id?null:object.id)}>
                  {showAddAttrId===object.id?'取消添加':'添加属性'}
                </button>
                {showAddAttrId===object.id && (
                  <form className="add-attr-form" onSubmit={e=>handleAddAttribute(object,e)} style={{margin:'0.5em 0',padding:'0.5em',border:'1px solid #eee',borderRadius:4}}>
                    <div>
                      <label>属性名：</label>
                      <input value={newAttrData.name} onChange={e=>setNewAttrData(d=>({...d,name:e.target.value}))} required />
                    </div>
                    <div>
                      <label>类型：</label>
                      <select value={newAttrData.type} onChange={e=>setNewAttrData(d=>({...d,type:e.target.value as AttributeType}))}>
                        <option value={AttributeType.TEXT}>文本</option>
                        <option value={AttributeType.NUMBER}>数字</option>
                        <option value={AttributeType.ENUM}>枚举</option>
                      </select>
                    </div>
                    {newAttrData.type===AttributeType.ENUM && (
                      <div>
                        <label>枚举值（逗号分隔）：</label>
                        <input value={newAttrData.enumValues} onChange={e=>setNewAttrData(d=>({...d,enumValues:e.target.value}))} placeholder="如 健康,受伤,死亡" />
                      </div>
                    )}
                    <div>
                      <label>描述：</label>
                      <input value={newAttrData.description} onChange={e=>setNewAttrData(d=>({...d,description:e.target.value}))} />
                    </div>
                    <button type="submit">添加</button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}

      {loading && objectStates.size > 0 && (
        <div className="update-indicator">
          <span>更新中...</span>
        </div>
      )}
    </div>
  );
};

export default ObjectStateDisplay;