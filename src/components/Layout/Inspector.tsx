import React, { useState, useEffect } from 'react';
import { useUIStore, useSelectionStore, useProjectStore } from '../../store';
import { INSPECTOR_PANELS } from '../../constants/views';
import { InspectorPanel, TimelineEvent, WorldObject, Attribute, AttributeType } from '../../types';

// 格式化显示值
const formatDisplayValue = (value: any, type: 'text' | 'number' | 'textarea' = 'text') => {
  if (value === null || value === undefined) return '';
  if (type === 'number') return String(value);
  return String(value);
};

// 可编辑字段组件
interface EditableFieldProps {
  label: string;
  value: string | number | undefined;
  fieldKey: string;
  type?: 'text' | 'number' | 'textarea';
  placeholder?: string;
  onChange: (value: any) => void;
  error?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  fieldKey,
  type = 'text',
  placeholder,
  onChange,
  error,
}) => {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={formatDisplayValue(value, type)}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 text-sm border rounded focus:ring-blue-500 focus:border-blue-500 resize-none ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
          }`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={formatDisplayValue(value, type)}
          onChange={(e) => onChange(type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
          className={`w-full px-3 py-2 text-sm border rounded focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
          }`}
          placeholder={placeholder}
        />
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export const Inspector: React.FC = () => {
  const { activeInspectorPanel, setActiveInspectorPanel } = useUIStore();
  const { getSelectedItems, getSelectedItemsByType, getSelectionCount, hasSelection } = useSelectionStore();
  const { getEvent, getObject, updateEvent, updateObject } = useProjectStore();

  // 获取选择状态
  const hasAnySelection = hasSelection();
  const selectionCount = getSelectionCount();
  const selectedItems = getSelectedItems();
  const singleItem = selectionCount === 1 ? selectedItems[0] : null;

  // 表单状态
  const [formData, setFormData] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 当选择改变时更新表单数据
  useEffect(() => {
    if (!singleItem) {
      setFormData(null);
      setErrors({});
      return;
    }

    const { type, id } = singleItem;
    let data;
    if (type === 'event') {
      data = getEvent(id);
      if (data) {
        setFormData({
          title: data.title,
          description: data.description || '',
          startTime: data.startTime,
          endTime: data.endTime || data.startTime,
          category: data.category || '',
          location: data.location || '',
          tags: data.tags ? data.tags.join(', ') : '',
        });
      }
    } else {
      data = getObject(id);
      if (data) {
        setFormData({
          name: data.name,
          description: data.description || '',
          category: data.category || '',
          tags: data.tags ? data.tags.join(', ') : '',
          attributes: data.attributes || [],
        });
      }
    }
  }, [singleItem, getEvent, getObject]);

  // 验证表单
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (singleItem?.type === 'event') {
      if (!formData.title?.trim()) {
        newErrors.title = '事件标题不能为空';
      }
      if (formData.startTime < 0) {
        newErrors.startTime = '开始时间不能为负数';
      }
      if (formData.endTime < formData.startTime) {
        newErrors.endTime = '结束时间不能早于开始时间';
      }
    } else {
      if (!formData.name?.trim()) {
        newErrors.name = '对象名称不能为空';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理字段更新
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: Record<string, any>) => ({
      ...prev,
      [field]: value,
    }));

    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // 自动保存
    handleAutoSave({
      ...formData,
      [field]: value,
    });
  };

  // 自动保存
  const handleAutoSave = (data: any) => {
    if (!singleItem || !data) return;

    const { type, id } = singleItem;

    // 处理标签
    const tagsArray = data.tags
      ? data.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
      : undefined;

    try {
      if (type === 'event') {
        const updatedEvent = {
          title: data.title?.trim(),
          description: data.description?.trim() || undefined,
          startTime: data.startTime,
          endTime: data.endTime !== data.startTime ? data.endTime : undefined,
          category: data.category || undefined,
          location: data.location?.trim() || undefined,
          tags: tagsArray,
          updatedAt: new Date().toISOString(),
        };
        updateEvent(id, updatedEvent);
      } else {
        const updatedObject = {
          name: data.name?.trim(),
          description: data.description?.trim() || undefined,
          category: data.category || undefined,
          tags: tagsArray,
          attributes: data.attributes,
          updatedAt: new Date().toISOString(),
        };
        updateObject(id, updatedObject);
      }
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 渲染日期面板
  const renderDatesPanel = () => {
    if (!singleItem || !formData) return <div className="p-4 text-sm text-gray-500">无可用数据</div>;

    if (singleItem.type === 'event') {
      return (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">📅 事件时间</h4>
          <div className="space-y-3">
            <EditableField
              label="开始时间"
              value={formData.startTime}
              fieldKey="startTime"
              type="number"
              onChange={(value) => handleFieldChange('startTime', value)}
              error={errors.startTime}
            />
            <EditableField
              label="结束时间"
              value={formData.endTime}
              fieldKey="endTime"
              type="number"
              placeholder="可选"
              onChange={(value) => handleFieldChange('endTime', value)}
              error={errors.endTime}
            />
            {formData.endTime && formData.endTime !== formData.startTime && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">持续时间</label>
                <div className="px-3 py-2 text-sm bg-blue-50 rounded border border-blue-200">
                  {formData.endTime - formData.startTime} 个时间单位
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      const startTimeAttr = formData.attributes?.find((attr: Attribute) => attr.name === 'startTime');
      return (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">📅 对象时间</h4>
          <div className="space-y-3">
            {startTimeAttr && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">出现时间</label>
                <div className="px-3 py-2 text-sm bg-gray-100 rounded border">
                  时间点: {startTimeAttr.value}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  // 渲染属性面板
  const renderPropertiesPanel = () => {
    if (!singleItem || !formData) return <div className="p-4 text-sm text-gray-500">无可用数据</div>;

    if (singleItem.type === 'event') {
      return (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">📋 事件属性</h4>
          <div className="space-y-3">
            <EditableField
              label="标题"
              value={formData.title}
              fieldKey="title"
              onChange={(value) => handleFieldChange('title', value)}
              error={errors.title}
            />
            <EditableField
              label="描述"
              value={formData.description}
              fieldKey="description"
              type="textarea"
              placeholder="事件描述..."
              onChange={(value) => handleFieldChange('description', value)}
            />
            <EditableField
              label="类型"
              value={formData.category}
              fieldKey="category"
              placeholder="事件类型..."
              onChange={(value) => handleFieldChange('category', value)}
            />
            <EditableField
              label="地点"
              value={formData.location}
              fieldKey="location"
              placeholder="事件地点..."
              onChange={(value) => handleFieldChange('location', value)}
            />
            <EditableField
              label="标签"
              value={formData.tags}
              fieldKey="tags"
              placeholder="标签1, 标签2, ..."
              onChange={(value) => handleFieldChange('tags', value)}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">📋 对象属性</h4>
          <div className="space-y-3">
            <EditableField
              label="名称"
              value={formData.name}
              fieldKey="name"
              onChange={(value) => handleFieldChange('name', value)}
              error={errors.name}
            />
            <EditableField
              label="描述"
              value={formData.description}
              fieldKey="description"
              type="textarea"
              placeholder="对象描述..."
              onChange={(value) => handleFieldChange('description', value)}
            />
            <EditableField
              label="类型"
              value={formData.category}
              fieldKey="category"
              onChange={(value) => handleFieldChange('category', value)}
            />
            <EditableField
              label="标签"
              value={formData.tags}
              fieldKey="tags"
              placeholder="标签1, 标签2, ..."
              onChange={(value) => handleFieldChange('tags', value)}
            />
            
            {/* 自定义属性 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-600">自定义属性</label>
                <button
                  onClick={() => {
                    const newAttr: Attribute = {
                      id: `attr-${Date.now()}`,
                      name: '新属性',
                      value: '',
                      type: AttributeType.TEXT,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    };
                    handleFieldChange('attributes', [...(formData.attributes || []), newAttr]);
                  }}
                  className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded bg-green-50 hover:bg-green-100"
                >
                  + 添加
                </button>
              </div>
              
              {formData.attributes && formData.attributes.length > 0 ? (
                <div className="space-y-2">
                  {formData.attributes.map((attr: Attribute) => (
                    <div key={attr.id} className="bg-white p-3 rounded border">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={attr.name}
                            onChange={(e) => {
                              const updatedAttributes = formData.attributes.map((a: Attribute) =>
                                a.id === attr.id ? { ...a, name: e.target.value } : a
                              );
                              handleFieldChange('attributes', updatedAttributes);
                            }}
                            className="flex-1 text-xs font-medium border border-gray-300 rounded px-2 py-1"
                            placeholder="属性名称"
                          />
                          <select
                            value={attr.type}
                            onChange={(e) => {
                              const updatedAttributes = formData.attributes.map((a: Attribute) =>
                                a.id === attr.id ? { ...a, type: e.target.value as AttributeType } : a
                              );
                              handleFieldChange('attributes', updatedAttributes);
                            }}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value={AttributeType.TEXT}>文本</option>
                            <option value={AttributeType.NUMBER}>数字</option>
                            <option value={AttributeType.ENUM}>枚举</option>
                          </select>
                          <button
                            onClick={() => {
                              const updatedAttributes = formData.attributes.filter((a: Attribute) => a.id !== attr.id);
                              handleFieldChange('attributes', updatedAttributes);
                            }}
                            className="text-xs text-red-600 hover:text-red-800 px-1"
                            title="删除属性"
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          value={String(attr.value)}
                          onChange={(e) => {
                            const updatedAttributes = formData.attributes.map((a: Attribute) =>
                              a.id === attr.id ? { ...a, value: e.target.value } : a
                            );
                            handleFieldChange('attributes', updatedAttributes);
                          }}
                          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                          placeholder="属性值"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border">
                  点击"+ 添加"按钮添加自定义属性
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  // 渲染关系面板
  const renderRelationshipsPanel = () => (
    <div className="p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">🔗 关系</h4>
      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border">
        关系功能正在开发中...
      </div>
    </div>
  );

  // 渲染依赖面板
  const renderDependenciesPanel = () => (
    <div className="p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">⚡ 依赖关系</h4>
      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border">
        依赖关系功能正在开发中...
      </div>
    </div>
  );

  // 渲染附件面板
  const renderAttachmentsPanel = () => (
    <div className="p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">📎 附件</h4>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2 text-2xl">📎</div>
        <div className="text-sm text-gray-500">拖拽文件到此处添加附件</div>
        <div className="text-xs text-gray-400 mt-1">
          支持图片、文档等格式
        </div>
      </div>
    </div>
  );

  // 渲染无选择状态
  const renderNoSelection = () => (
    <div className="flex-1 flex items-center justify-center text-center p-6">
      <div>
        <div className="text-gray-400 mb-3 text-4xl">👁️</div>
        <div className="text-sm font-medium text-gray-600 mb-2">未选择任何项目</div>
        <div className="text-xs text-gray-500">
          在时间轴上选择事件或从侧边栏选择对象<br/>
          来查看和编辑详细信息
        </div>
      </div>
    </div>
  );

  // 渲染多选状态
  const renderMultiSelection = () => (
    <div className="p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">📦 多项选择</h4>
      <div className="space-y-3">
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="text-sm font-medium text-blue-800">
            已选择 {selectionCount} 个项目
          </div>
          <div className="text-xs text-blue-600 mt-1">
            选择单个项目以查看和编辑详细信息
          </div>
        </div>
        
        {getSelectedItemsByType('event').length > 0 && (
          <div className="text-xs text-gray-600">
            事件: {getSelectedItemsByType('event').length} 个
          </div>
        )}
        
        {['person', 'place', 'project', 'object', 'custom'].map(type => {
          const count = getSelectedItemsByType(type as any).length;
          if (count > 0) {
            return (
              <div key={type} className="text-xs text-gray-600">
                {type}: {count} 个
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );

  // 面板列表
  const panels = [
    { id: INSPECTOR_PANELS.DATES, label: '时间', icon: '📅' },
    { id: INSPECTOR_PANELS.PROPERTIES, label: '属性', icon: '📋' },
    { id: INSPECTOR_PANELS.RELATIONSHIPS, label: '关系', icon: '🔗' },
    { id: INSPECTOR_PANELS.DEPENDENCIES, label: '依赖', icon: '⚡' },
    { id: INSPECTOR_PANELS.ATTACHMENTS, label: '附件', icon: '📎' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 检查器标题 */}
      <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-3">
        <h3 className="text-sm font-medium text-gray-700">检查器</h3>
        {hasAnySelection && (
          <span className="ml-2 text-xs text-gray-500">
            ({selectionCount} 项已选)
          </span>
        )}
      </div>

      {!hasAnySelection ? (
        renderNoSelection()
      ) : selectionCount > 1 ? (
        renderMultiSelection()
      ) : (
        <>
          {/* 面板切换标签 */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {panels.map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => setActiveInspectorPanel(panel.id)}
                  className={`flex-shrink-0 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    activeInspectorPanel === panel.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-1">{panel.icon}</span>
                  {panel.label}
                </button>
              ))}
            </div>
          </div>

          {/* 面板内容 */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {activeInspectorPanel === INSPECTOR_PANELS.DATES && renderDatesPanel()}
            {activeInspectorPanel === INSPECTOR_PANELS.PROPERTIES && renderPropertiesPanel()}
            {activeInspectorPanel === INSPECTOR_PANELS.DEPENDENCIES && renderDependenciesPanel()}
            {activeInspectorPanel === INSPECTOR_PANELS.RELATIONSHIPS && renderRelationshipsPanel()}
            {activeInspectorPanel === INSPECTOR_PANELS.ATTACHMENTS && renderAttachmentsPanel()}
          </div>
        </>
      )}
    </div>
  );
}; 