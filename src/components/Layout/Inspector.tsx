import React, { useState, useEffect } from 'react';
import { useUIStore, useSelectionStore, useProjectStore } from '../../store';
import { INSPECTOR_PANELS } from '../../constants/views';
import { InspectorPanel, TimelineEvent, WorldObject, Attribute, AttributeType, AttributeValue } from '../../types';
import { AttributeEditor } from '../UI/AttributeEditor/AttributeEditor';
import { getTemplatesForObjectType, SYSTEM_TEMPLATES } from '../../constants/attributeTemplates';

// 格式化显示值 - 保留用于基础字段
const formatDisplayValue = (value: any, type: 'text' | 'number' | 'textarea' = 'text') => {
  if (value === null || value === undefined) return '';
  if (type === 'number') return String(value);
  return String(value);
};

// 基础可编辑字段组件 - 用于非属性的基础字段
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
    <div className="mb-4">
      <label className="block text-xs font-medium theme-label mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={formatDisplayValue(value, type)}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 text-sm border rounded resize-none transition-all duration-200 ${
            error 
              ? 'theme-input-error focus:ring-red-500 focus:border-red-500' 
              : 'theme-input focus:ring-blue-500'
          }`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={formatDisplayValue(value, type)}
          onChange={(e) => onChange(type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
          className={`w-full px-3 py-2 text-sm border rounded transition-all duration-200 ${
            error 
              ? 'theme-input-error focus:ring-red-500 focus:border-red-500' 
              : 'theme-input focus:ring-blue-500'
          }`}
          placeholder={placeholder}
        />
      )}
      {error && (
        <p className="text-xs theme-error-text mt-1">{error}</p>
      )}
    </div>
  );
};

// 属性列表组件 - 复用的自定义属性区域
interface AttributeListProps {
  attributes: Attribute[];
  availableTemplates: any[];
  onAddAttribute: () => void;
  onRemoveAttribute: (attributeId: string) => void;
  onAttributeChange: (attributeId: string, value: any) => void;
  onApplyTemplate: (templateId: string) => void;
}

const AttributeList: React.FC<AttributeListProps> = ({
  attributes,
  availableTemplates,
  onAddAttribute,
  onRemoveAttribute,
  onAttributeChange,
  onApplyTemplate,
}) => {
  console.log('AttributeList - availableTemplates:', availableTemplates); // 调试信息
  
  return (
    <div className="theme-bg-secondary p-4 rounded-lg border theme-border-secondary">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-xs font-medium theme-label">自定义属性</h5>
        <div className="flex items-center space-x-2">
          {/* 模板选择器 - 始终显示，即使没有模板 */}
          <div className="relative">
            <select
              onChange={(e) => e.target.value && onApplyTemplate(e.target.value)}
              value=""
              className="text-xs border theme-select rounded px-2 py-1 pr-6"
              title={availableTemplates.length > 0 ? `找到 ${availableTemplates.length} 个可用模板` : '暂无可用模板'}
            >
              <option value="">📋 应用模板{availableTemplates.length > 0 ? `(${availableTemplates.length})` : '(0)'}...</option>
              {availableTemplates.map(template => (
                <option 
                  key={template.id} 
                  value={template.id}
                  title={template.description}
                >
                  {template.name} ({template.attributes?.length || 0} 个属性)
                </option>
              ))}
              {availableTemplates.length === 0 && (
                <option value="" disabled>暂无可用模板</option>
              )}
            </select>
          </div>
          <button
            onClick={onAddAttribute}
            className="text-xs px-3 py-1 theme-btn-primary rounded transition-colors duration-200 shadow-sm"
            title="添加新属性"
          >
            ➕ 添加属性
          </button>
        </div>
      </div>

      {attributes && attributes.length > 0 ? (
        <div className="space-y-3">
          {attributes.map((attr: Attribute) => (
            <div key={attr.id} className="border theme-border-secondary rounded p-3 theme-bg-primary">
              <div className="flex items-start justify-between mb-2">
                <h6 className="text-sm font-medium theme-text-secondary truncate">
                  {attr.name}
                </h6>
                <button
                  onClick={() => onRemoveAttribute(attr.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm font-bold ml-2 px-1 py-1 rounded transition-colors duration-200"
                  title="删除属性"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs theme-text-tertiary mt-1">
                类型: {attr.type} | 值: {String(attr.value || '未设置')}
              </p>
              <div className="mt-2">
                <AttributeEditor
                  attribute={attr}
                  value={attr.value}
                  onChange={(newValue) => onAttributeChange(attr.id, newValue)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm theme-text-tertiary theme-bg-primary p-3 rounded border theme-border-secondary text-center">
          暂无自定义属性。点击"➕ 添加属性"开始添加。
        </div>
      )}
    </div>
  );
};

// 空状态组件
interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => (
  <div className="text-sm theme-text-tertiary theme-bg-primary p-3 rounded border theme-border-secondary text-center">
    <div className="text-2xl mb-2">{icon}</div>
    <div className="mb-1">{title}</div>
    {description && <div className="text-xs mt-1">{description}</div>}
  </div>
);

// 主Inspector组件
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
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);

  // 内置的实用模板
  const getBuiltInTemplates = (itemType: 'event' | 'object') => {
    if (itemType === 'event') {
      return [
        {
          id: 'event-historical',
          name: '历史事件',
          description: '用于记录历史事件的详细信息',
          icon: '📚',
          attributes: [
            { name: '重要程度', type: 'select', options: { choices: ['低', '中', '高', '极高'] } },
            { name: '影响范围', type: 'select', options: { choices: ['局部', '地区', '国家', '全球'] } },
            { name: '参与人数', type: 'number' },
            { name: '历史意义', type: 'textarea' },
            { name: '相关人物', type: 'text' },
            { name: '资料来源', type: 'text' }
          ]
        },
        {
          id: 'event-personal',
          name: '个人事件',
          description: '记录个人生活中的重要事件',
          icon: '👤',
          attributes: [
            { name: '心情', type: 'select', options: { choices: ['😊 开心', '😐 一般', '😢 难过', '😠 愤怒', '😰 紧张'] } },
            { name: '重要程度', type: 'select', options: { choices: ['低', '中', '高', '极高'] } },
            { name: '相关人员', type: 'text' },
            { name: '感想反思', type: 'textarea' },
            { name: '学到的经验', type: 'textarea' }
          ]
        },
        {
          id: 'event-project',
          name: '项目事件',
          description: '记录项目过程中的关键事件',
          icon: '📋',
          attributes: [
            { name: '项目阶段', type: 'select', options: { choices: ['启动', '规划', '执行', '监控', '收尾'] } },
            { name: '优先级', type: 'select', options: { choices: ['低', '中', '高', '紧急'] } },
            { name: '负责人', type: 'text' },
            { name: '预算影响', type: 'number' },
            { name: '风险等级', type: 'select', options: { choices: ['低', '中', '高'] } },
            { name: '解决方案', type: 'textarea' }
          ]
        }
      ];
    } else {
      return [
        {
          id: 'object-person',
          name: '人物对象',
          description: '记录重要人物的详细信息',
          icon: '👤',
          attributes: [
            { name: '职业', type: 'text' },
            { name: '出生年份', type: 'number' },
            { name: '国籍', type: 'text' },
            { name: '主要成就', type: 'textarea' },
            { name: '关系网络', type: 'text' },
            { name: '重要程度', type: 'select', options: { choices: ['低', '中', '高', '极高'] } }
          ]
        },
        {
          id: 'object-place',
          name: '地点对象',
          description: '记录重要地点的详细信息',
          icon: '📍',
          attributes: [
            { name: '地理坐标', type: 'text' },
            { name: '建立时间', type: 'number' },
            { name: '面积', type: 'number' },
            { name: '人口', type: 'number' },
            { name: '特色描述', type: 'textarea' },
            { name: '访问状态', type: 'select', options: { choices: ['未访问', '计划访问', '已访问'] } }
          ]
        },
        {
          id: 'object-organization',
          name: '组织机构',
          description: '记录组织机构的详细信息',
          icon: '🏢',
          attributes: [
            { name: '成立时间', type: 'number' },
            { name: '规模', type: 'select', options: { choices: ['小型', '中型', '大型', '超大型'] } },
            { name: '主要业务', type: 'text' },
            { name: '总部位置', type: 'text' },
            { name: '员工数量', type: 'number' },
            { name: '年收入', type: 'number' },
            { name: '组织文化', type: 'textarea' }
          ]
        }
      ];
    }
  };

  // 当选择改变时同步表单数据
  useEffect(() => {
    if (singleItem) {
      if (singleItem.type === 'event') {
        const event = getEvent(singleItem.id);
        if (event) {
          setFormData({ ...event });
          // 获取事件相关模板
          try {
            const systemTemplates = getTemplatesForObjectType('event' as any);
            const builtInTemplates = getBuiltInTemplates('event');
            const allTemplates = [...(systemTemplates || []), ...builtInTemplates];
            console.log('Event templates loaded:', allTemplates);
            setAvailableTemplates(allTemplates);
          } catch (error) {
            console.warn('Failed to load system templates, using built-in:', error);
            setAvailableTemplates(getBuiltInTemplates('event'));
          }
        }
      } else if (singleItem.type === 'object') {
        const object = getObject(singleItem.id);
        if (object) {
          setFormData({ ...object });
          // 获取对象相关模板
          try {
            const objectType = (object as any).category || (object as any).type || 'object';
            console.log('Object type for template:', objectType);
            
            let systemTemplates = getTemplatesForObjectType(objectType as any);
            if (!systemTemplates || systemTemplates.length === 0) {
              systemTemplates = getTemplatesForObjectType('object' as any);
            }
            
            const builtInTemplates = getBuiltInTemplates('object');
            const allTemplates = [...(systemTemplates || []), ...builtInTemplates];
            console.log('Object templates loaded:', allTemplates);
            setAvailableTemplates(allTemplates);
          } catch (error) {
            console.warn('Failed to load system templates, using built-in:', error);
            setAvailableTemplates(getBuiltInTemplates('object'));
          }
        }
      }
    } else {
      setFormData(null);
      setAvailableTemplates([]);
    }
    setErrors({});
  }, [singleItem, getEvent, getObject]);

  // 通用字段更改处理
  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    handleAutoSave({ ...formData, [field]: value });
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 属性操作处理器
  const handleAddAttribute = () => {
    const now = new Date().toISOString();
    const newAttribute: Attribute = {
      id: `attr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '新属性',
      type: AttributeType.TEXT,
      value: '',
      description: '',
      sortOrder: (formData.attributes?.length || 0) + 1,
      createdAt: now,
      updatedAt: now
    };
    const newAttributes = [...(formData.attributes || []), newAttribute];
    setFormData((prev: any) => ({ ...prev, attributes: newAttributes }));
    handleAutoSave({ ...formData, attributes: newAttributes });
  };

  const handleRemoveAttribute = (attributeId: string) => {
    const newAttributes = formData.attributes?.filter((attr: Attribute) => attr.id !== attributeId) || [];
    setFormData((prev: any) => ({ ...prev, attributes: newAttributes }));
    handleAutoSave({ ...formData, attributes: newAttributes });
  };

  const handleAttributeChange = (attributeId: string, newValue: AttributeValue) => {
    const newAttributes = formData.attributes?.map((attr: Attribute) => 
      attr.id === attributeId ? { ...attr, value: newValue } : attr
    ) || [];
    setFormData((prev: any) => ({ ...prev, attributes: newAttributes }));
    handleAutoSave({ ...formData, attributes: newAttributes });
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId);
    if (template && template.attributes) {
      const templateAttributes = template.attributes.map((attr: any) => ({
          ...attr,
        id: `attr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        value: attr.defaultValue || ''
      }));
      const newAttributes = [...(formData.attributes || []), ...templateAttributes];
      setFormData((prev: any) => ({ ...prev, attributes: newAttributes }));
      handleAutoSave({ ...formData, attributes: newAttributes });
    }
  };

  // 自动保存处理器
  const handleAutoSave = (data: any) => {
    if (!singleItem || !data) return;
    
    try {
      if (singleItem.type === 'event') {
        updateEvent(singleItem.id, data);
      } else if (singleItem.type === 'object') {
        updateObject(singleItem.id, data);
      }
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  // 获取按类型分组的选中项
  const getGroupedSelectedItems = () => {
    const events = getSelectedItemsByType('event');
    const objects = getSelectedItemsByType('object');
    return {
      ...(events.length > 0 && { event: events }),
      ...(objects.length > 0 && { object: objects })
    };
  };

  // 渲染面板内容
  const renderPanelContent = () => {
    if (!singleItem || !formData) {
      return <div className="p-4 text-sm theme-text-tertiary">无可用数据</div>;
    }

    switch (activeInspectorPanel) {
      case INSPECTOR_PANELS.DATES:
        return renderDatesPanel();
      case INSPECTOR_PANELS.PROPERTIES:
        return renderPropertiesPanel();
      case INSPECTOR_PANELS.RELATIONSHIPS:
        return renderRelationshipsPanel();
      case INSPECTOR_PANELS.DEPENDENCIES:
        return renderDependenciesPanel();
      case INSPECTOR_PANELS.ATTACHMENTS:
        return renderAttachmentsPanel();
      default:
        return renderPropertiesPanel();
    }
  };

  // 渲染日期面板
  const renderDatesPanel = () => (
    <div className="space-y-4">
      {singleItem?.type === 'event' ? (
            <div>
          <h4 className="text-sm font-medium theme-text-secondary mb-3">📅 事件时间</h4>
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
            onChange={(value) => handleFieldChange('endTime', value)}
            error={errors.endTime}
          />
          {formData.endTime && formData.startTime && (
            <div className="mb-4">
              <label className="block text-xs font-medium theme-label mb-1">持续时间</label>
              <div className="text-sm theme-text-secondary theme-bg-primary p-2 rounded border">
                {formData.endTime - formData.startTime} 个时间单位
                </div>
              </div>
            )}
          </div>
      ) : (
              <div>
          <h4 className="text-sm font-medium theme-text-secondary mb-3">📅 对象时间</h4>
          <EditableField
            label="创建时间"
            value={formData.createdAt}
            fieldKey="createdAt"
            type="number"
            onChange={(value) => handleFieldChange('createdAt', value)}
            error={errors.createdAt}
          />
              </div>
            )}
      <EmptyState
        icon="💡"
        title="时间单位基于项目设置，默认为年份"
      />
        </div>
      );

  // 渲染属性面板
  const renderPropertiesPanel = () => (
    <div className="space-y-4">
      {/* 基础信息 */}
      <div className="theme-bg-secondary p-4 rounded-lg border theme-border-secondary">
        <h5 className="text-xs font-medium theme-label mb-3">基础信息</h5>
        {singleItem?.type === 'event' ? (
          <>
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
              onChange={(value) => handleFieldChange('description', value)}
              error={errors.description}
            />
            <EditableField
              label="类型"
              value={formData.category}
              fieldKey="category"
              onChange={(value) => handleFieldChange('category', value)}
              error={errors.category}
            />
            <EditableField
              label="地点"
              value={formData.location}
              fieldKey="location"
              onChange={(value) => handleFieldChange('location', value)}
              error={errors.location}
            />
            <EditableField
              label="标签"
              value={formData.tags}
              fieldKey="tags"
                  placeholder="标签1, 标签2, ..."
              onChange={(value) => handleFieldChange('tags', value)}
              error={errors.tags}
            />
          </>
            ) : (
          <>
            <EditableField
              label="名称"
              value={formData.name}
              fieldKey="name"
              onChange={(value) => handleFieldChange('name', value)}
              error={errors.name}
            />
            <EditableField
              label="类型"
              value={formData.type}
              fieldKey="type"
              onChange={(value) => handleFieldChange('type', value)}
              error={errors.type}
            />
            <EditableField
              label="描述"
              value={formData.description}
              fieldKey="description"
              type="textarea"
              onChange={(value) => handleFieldChange('description', value)}
              error={errors.description}
            />
          </>
              )}
            </div>
            
            {/* 自定义属性 */}
      <AttributeList
        attributes={formData.attributes || []}
        availableTemplates={availableTemplates}
        onAddAttribute={handleAddAttribute}
        onRemoveAttribute={handleRemoveAttribute}
        onAttributeChange={handleAttributeChange}
        onApplyTemplate={handleApplyTemplate}
      />
        </div>
      );

  // 渲染关系面板
  const renderRelationshipsPanel = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium theme-text-secondary mb-3">🔗 关系</h4>
      <EmptyState
        icon="🔗"
        title="关系面板正在开发中..."
        description="将支持事件和对象间的关系管理"
      />
    </div>
  );

  // 渲染依赖面板
  const renderDependenciesPanel = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium theme-text-secondary mb-3">⚡ 依赖关系</h4>
      <EmptyState
        icon="⚡"
        title="依赖关系功能正在开发中..."
        description="将支持事件和对象间的依赖关系管理"
      />
    </div>
  );

  // 渲染附件面板
  const renderAttachmentsPanel = () => (
    <div className="space-y-4">
      <h4 className="text-sm font-medium theme-text-secondary mb-3">📎 附件</h4>
      <div className="border-2 border-dashed theme-border-secondary rounded-lg p-6 text-center">
        <div className="theme-text-tertiary mb-2 text-2xl">📎</div>
        <div className="text-sm theme-text-tertiary mb-2">暂无文件附件</div>
        <div className="text-xs theme-text-tertiary">
          拖拽文件到此处或点击上传按钮添加附件
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col theme-bg-secondary overflow-hidden">
      {/* 标题栏 */}
      <div className="h-10 theme-bg-primary theme-border-secondary border-b flex items-center px-3 flex-shrink-0">
        <h3 className="text-sm font-medium theme-text-primary">检查器</h3>
        {hasAnySelection && (
          <span className="ml-2 text-xs theme-text-tertiary">
            ({selectionCount} 项已选)
          </span>
        )}
      </div>

      {/* 选项卡 */}
      {hasAnySelection && (
        <div className="theme-bg-secondary theme-border-secondary border-b flex-shrink-0">
          <nav className="flex overflow-x-auto px-2 py-1" aria-label="Tabs">
            {Object.entries(INSPECTOR_PANELS).map(([key, panel]) => {
              // 定义面板的中文标签和图标
              const panelInfo = {
                [INSPECTOR_PANELS.DATES]: { label: '时间', icon: '📅' },
                [INSPECTOR_PANELS.PROPERTIES]: { label: '属性', icon: '📋' },
                [INSPECTOR_PANELS.RELATIONSHIPS]: { label: '关系', icon: '🔗' },
                [INSPECTOR_PANELS.DEPENDENCIES]: { label: '依赖', icon: '⚡' },
                [INSPECTOR_PANELS.ATTACHMENTS]: { label: '附件', icon: '📎' },
              }[panel] || { label: panel, icon: '📄' };

              return (
                <button
                  key={key}
                  onClick={() => setActiveInspectorPanel(panel as InspectorPanel)}
                  className={`flex items-center space-x-1 px-3 py-2 font-medium text-xs transition-all duration-200 whitespace-nowrap theme-tab-button ${
                    activeInspectorPanel === panel ? 'active' : ''
                  }`}
                  title={`${panelInfo.icon} ${panelInfo.label}`}
                >
                  <span className="text-sm">{panelInfo.icon}</span>
                  <span>{panelInfo.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {!hasAnySelection ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="theme-text-tertiary mb-3 text-4xl">👁️</div>
            <div className="text-sm font-medium theme-text-secondary mb-2">未选择任何项目</div>
            <div className="text-xs theme-text-tertiary">
              在时间轴视图中选择事件或对象来查看详细信息
            </div>
          </div>
        ) : selectionCount > 1 ? (
          <div className="p-4 space-y-4">
            <h4 className="text-sm font-medium theme-text-secondary mb-3">📦 多项选择</h4>
            <div className="space-y-2">
              {Object.entries(getGroupedSelectedItems()).map(([type, items]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium theme-text-primary">
                    {type === 'event' ? '事件' : '对象'}
                  </span>
                  <span className="text-sm theme-text-secondary">{items.length} 项</span>
                </div>
              ))}
            </div>
            <div className="text-xs theme-text-tertiary">
              <p>• 选择单个项目可查看详细信息</p>
              <p>• 使用 Ctrl+点击 或 Shift+点击 进行多选</p>
              <p>• 按 Delete 键删除选中项目</p>
            </div>
            {Object.entries(getGroupedSelectedItems()).map(([type, items]) => (
              <div key={type} className="text-xs theme-text-tertiary">
                <strong>{type === 'event' ? '事件' : '对象'}:</strong> {items.map((item: any) => item.name || item.title).join(', ')}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 space-y-6 pb-8">
            {renderPanelContent()}
          </div>
      )}
      </div>
    </div>
  );
}; 