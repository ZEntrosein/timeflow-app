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
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);

  // 当选择改变时更新表单数据
  useEffect(() => {
    if (!singleItem) {
      setFormData(null);
      setErrors({});
      setAvailableTemplates([]);
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
          attributes: data.attributes || [],
        });
      }
      // 获取事件模板
      const eventTemplate = SYSTEM_TEMPLATES.find(t => t.id === 'event');
      setAvailableTemplates(eventTemplate ? [eventTemplate] : []);
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
      // 获取对象适用的模板
      const templates = getTemplatesForObjectType(type as any);
      setAvailableTemplates(templates);
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

  // 处理属性更新
  const handleAttributeChange = (attributeId: string, newValue: AttributeValue) => {
    const updatedAttributes = formData.attributes.map((attr: Attribute) =>
      attr.id === attributeId 
        ? { ...attr, value: newValue, updatedAt: new Date().toISOString() }
        : attr
    );
    handleFieldChange('attributes', updatedAttributes);
  };

  // 处理属性配置更新（例如多选选项）
  const handleAttributeConfigChange = (attributeId: string, newConfig: Partial<Attribute>) => {
    const updatedAttributes = formData.attributes.map((attr: Attribute) =>
      attr.id === attributeId 
        ? { ...attr, ...newConfig, updatedAt: new Date().toISOString() }
        : attr
    );
    handleFieldChange('attributes', updatedAttributes);
  };

  // 添加新属性
  const handleAddAttribute = (template?: any) => {
    let newAttribute: Attribute;
    
    if (template) {
      // 从模板创建属性
      newAttribute = {
        ...template,
      id: `attr-${Date.now()}`,
        value: template.type === AttributeType.BOOLEAN ? false : 
               template.type === AttributeType.NUMBER ? 0 :
               template.type === AttributeType.LIST ? [] :
               template.type === AttributeType.MULTI_SELECT ? [] : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    } else {
      // 创建默认属性，但让用户选择类型
      const attributeName = prompt('请输入属性名称:');
      if (!attributeName?.trim()) return;
      
      // 简单的类型选择
      const attributeType = prompt(`请选择属性类型:
1 - 文本 (text)
2 - 数字 (number) 
3 - 日期 (date)
4 - 布尔值 (boolean)
5 - 列表 (list)
6 - 多选 (multi-select)
7 - 邮箱 (email)
8 - 链接 (url)
9 - 电话 (phone)
10 - 颜色 (color)
11 - 评分 (rating)
12 - 进度 (progress)

请输入数字 (1-12):`);
      
      const typeMap: Record<string, AttributeType> = {
        '1': AttributeType.TEXT,
        '2': AttributeType.NUMBER,
        '3': AttributeType.DATE,
        '4': AttributeType.BOOLEAN,
        '5': AttributeType.LIST,
        '6': AttributeType.MULTI_SELECT,
        '7': AttributeType.EMAIL,
        '8': AttributeType.URL,
        '9': AttributeType.PHONE,
        '10': AttributeType.COLOR,
        '11': AttributeType.RATING,
        '12': AttributeType.PROGRESS
      };
      
      const selectedType = typeMap[attributeType || '1'] || AttributeType.TEXT;
      
      newAttribute = {
        id: `attr-${Date.now()}`,
        name: attributeName.trim(),
        type: selectedType,
        value: selectedType === AttributeType.BOOLEAN ? false : 
               selectedType === AttributeType.NUMBER ? 0 :
               selectedType === AttributeType.LIST ? [] :
               selectedType === AttributeType.MULTI_SELECT ? [] : '',
        description: '',
        showInTable: true,
        searchable: true,
        sortOrder: (formData.attributes?.length || 0) + 1,
        group: '自定义',
        createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

    handleFieldChange('attributes', [...(formData.attributes || []), newAttribute]);
  };

  // 删除属性
  const handleRemoveAttribute = (attributeId: string) => {
    const updatedAttributes = formData.attributes.filter((attr: Attribute) => attr.id !== attributeId);
    handleFieldChange('attributes', updatedAttributes);
  };

  // 应用模板
  const handleApplyTemplate = (templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId);
    if (!template) return;

    const templateAttributes = template.attributes.map((attr: any) => ({
      ...attr,
      id: `attr-${Date.now()}-${Math.random()}`,
      value: attr.type === AttributeType.BOOLEAN ? false : 
             attr.type === AttributeType.NUMBER ? 0 :
             attr.type === AttributeType.LIST ? [] :
             attr.type === AttributeType.MULTI_SELECT ? [] : '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    handleFieldChange('attributes', [...(formData.attributes || []), ...templateAttributes]);
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
          attributes: data.attributes,
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
      // 查找日期类型的属性
      const dateAttributes = formData.attributes?.filter((attr: Attribute) => 
        attr.type === AttributeType.DATE
      ) || [];
      
      return (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">📅 对象时间</h4>
          <div className="space-y-3">
            {dateAttributes.length > 0 ? (
              dateAttributes.map((attr: Attribute) => (
                <AttributeEditor
                  key={attr.id}
                  attribute={attr}
                  value={attr.value}
                  onChange={(value) => handleAttributeChange(attr.id, value)}
                  onConfigChange={(config) => handleAttributeConfigChange(attr.id, config)}
                  showValidation={true}
                />
              ))
            ) : (
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border">
                暂无日期属性，可在属性面板中添加
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
          <div className="space-y-4">
            {/* 基础属性 */}
            <div className="bg-white p-4 rounded-lg border">
              <h5 className="text-xs font-medium text-gray-600 mb-3">基础信息</h5>
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

            {/* 自定义属性 */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-medium text-gray-600">自定义属性</h5>
                <div className="flex items-center space-x-2">
                  {availableTemplates.length > 0 && (
                    <div className="relative">
                      <select
                        onChange={(e) => e.target.value && handleApplyTemplate(e.target.value)}
                        value=""
                        className="text-xs border border-gray-300 rounded px-2 py-1 pr-6 bg-white"
                        title={`找到 ${availableTemplates.length} 个可用模板`}
                      >
                        <option value="">📋 应用模板...</option>
                        {availableTemplates.map(template => (
                          <option 
                            key={template.id} 
                            value={template.id}
                            title={template.description}
                          >
                            {template.icon} {template.name} ({template.attributes.length} 属性)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button
                    onClick={() => handleAddAttribute()}
                    className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded bg-green-50 hover:bg-green-100"
                  >
                    + 添加属性
                  </button>
                </div>
              </div>
              
              {formData.attributes && formData.attributes.length > 0 ? (
                               <div className="space-y-4">
                 {formData.attributes.map((attr: Attribute) => (
                   <div key={attr.id} className="bg-gray-50 p-3 rounded border">
                     <div className="flex items-start justify-between mb-2">
                       <div className="flex-1 min-w-0">
                         <h6 className="text-sm font-medium text-gray-700 truncate">
                           {attr.name}
                         </h6>
                         {attr.description && (
                           <p className="text-xs text-gray-500 mt-1">
                             {attr.description}
                           </p>
                         )}
                       </div>
                       <button
                         onClick={() => handleRemoveAttribute(attr.id)}
                         className="ml-2 text-red-500 hover:text-red-700 text-lg leading-none flex-shrink-0"
                         title="删除属性"
                       >
                         ×
                       </button>
                     </div>
                     <div className="mt-2">
                       <AttributeEditor
                         attribute={attr}
                         value={attr.value}
                         onChange={(value) => handleAttributeChange(attr.id, value)}
                         onConfigChange={(config) => handleAttributeConfigChange(attr.id, config)}
                         showValidation={true}
                         className="compact"
                       />
                     </div>
                   </div>
                 ))}
              </div>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <div>暂无自定义属性</div>
                  <div className="text-xs mt-1">点击"+ 添加属性"或"应用模板"开始</div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">📋 对象属性</h4>
          <div className="space-y-4">
            {/* 基础属性 */}
            <div className="bg-white p-4 rounded-lg border">
              <h5 className="text-xs font-medium text-gray-600 mb-3">基础信息</h5>
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
              </div>
            </div>
            
            {/* 自定义属性 */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-medium text-gray-600">自定义属性</h5>
                <div className="flex items-center space-x-2">
                  {availableTemplates.length > 0 && (
                    <div className="relative">
                      <select
                        onChange={(e) => e.target.value && handleApplyTemplate(e.target.value)}
                        value=""
                        className="text-xs border border-gray-300 rounded px-2 py-1 pr-6 bg-white"
                        title={`找到 ${availableTemplates.length} 个可用模板`}
                      >
                        <option value="">📋 应用模板...</option>
                        {availableTemplates.map(template => (
                          <option 
                            key={template.id} 
                            value={template.id}
                            title={template.description}
                          >
                            {template.icon} {template.name} ({template.attributes.length} 属性)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button
                    onClick={() => handleAddAttribute()}
                    className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded bg-green-50 hover:bg-green-100"
                  >
                    + 添加属性
                  </button>
                </div>
              </div>
              
              {formData.attributes && formData.attributes.length > 0 ? (
                               <div className="space-y-4">
                 {formData.attributes
                   .sort((a: Attribute, b: Attribute) => (a.sortOrder || 0) - (b.sortOrder || 0))
                   .map((attr: Attribute) => (
                   <div key={attr.id} className="bg-gray-50 p-3 rounded border">
                     <div className="flex items-start justify-between mb-2">
                       <div className="flex-1 min-w-0">
                         <h6 className="text-sm font-medium text-gray-700 truncate">
                           {attr.name}
                         </h6>
                         {attr.description && (
                           <p className="text-xs text-gray-500 mt-1">
                             {attr.description}
                           </p>
                         )}
                       </div>
                       <button
                         onClick={() => handleRemoveAttribute(attr.id)}
                         className="ml-2 text-red-500 hover:text-red-700 text-lg leading-none flex-shrink-0"
                         title="删除属性"
                       >
                         ×
                       </button>
                     </div>
                     <div className="mt-2">
                       <AttributeEditor
                         attribute={attr}
                         value={attr.value}
                         onChange={(value) => handleAttributeChange(attr.id, value)}
                         onConfigChange={(config) => handleAttributeConfigChange(attr.id, config)}
                         showValidation={true}
                         className="compact"
                       />
                     </div>
                   </div>
                 ))}
              </div>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <div>暂无自定义属性</div>
                  <div className="text-xs mt-1">点击"+ 添加属性"或"应用模板"开始</div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  // 渲染关系面板
  const renderRelationshipsPanel = () => {
    if (!singleItem || !formData) return <div className="p-4 text-sm text-gray-500">无可用数据</div>;

    // 查找关系类型的属性
    const relationAttributes = formData.attributes?.filter((attr: Attribute) => 
      attr.type === AttributeType.RELATION
    ) || [];

    return (
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">🔗 关系</h4>
        <div className="space-y-3">
          {relationAttributes.length > 0 ? (
                          relationAttributes.map((attr: Attribute) => (
                <AttributeEditor
                  key={attr.id}
                  attribute={attr}
                  value={attr.value}
                  onChange={(value) => handleAttributeChange(attr.id, value)}
                  onConfigChange={(config) => handleAttributeConfigChange(attr.id, config)}
                  showValidation={true}
                />
              ))
          ) : (
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border text-center">
              <div className="text-2xl mb-2">🔗</div>
              <div>暂无关系属性</div>
              <div className="text-xs mt-1">在属性面板中添加关系类型的属性</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染依赖面板
  const renderDependenciesPanel = () => (
    <div className="p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">⚡ 依赖关系</h4>
      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border text-center">
        <div className="text-2xl mb-2">⚡</div>
        <div>依赖关系功能正在开发中</div>
        <div className="text-xs mt-1">将支持事件和对象间的依赖关系管理</div>
      </div>
    </div>
  );

  // 渲染附件面板
  const renderAttachmentsPanel = () => {
    if (!singleItem || !formData) return <div className="p-4 text-sm text-gray-500">无可用数据</div>;

    // 查找文件类型的属性
    const fileAttributes = formData.attributes?.filter((attr: Attribute) => 
      attr.type === AttributeType.FILE
    ) || [];

    return (
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">📎 附件</h4>
        <div className="space-y-3">
          {fileAttributes.length > 0 ? (
                          fileAttributes.map((attr: Attribute) => (
                <AttributeEditor
                  key={attr.id}
                  attribute={attr}
                  value={attr.value}
                  onChange={(value) => handleAttributeChange(attr.id, value)}
                  onConfigChange={(config) => handleAttributeConfigChange(attr.id, config)}
                  showValidation={true}
                />
              ))
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 mb-2 text-2xl">📎</div>
              <div className="text-sm text-gray-500 mb-2">暂无文件附件</div>
              <div className="text-xs text-gray-400">
                在属性面板中添加文件类型的属性来管理附件
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* 检查器标题 */}
      <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-3 flex-shrink-0">
        <h3 className="text-sm font-medium text-gray-700">检查器</h3>
        {hasAnySelection && (
          <span className="ml-2 text-xs text-gray-500">
            ({selectionCount} 项已选)
          </span>
        )}
        {singleItem && availableTemplates.length > 0 && (
          <span className="ml-2 text-xs text-green-600">
            • {availableTemplates.length} 个模板可用
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
          <div className="bg-white border-b border-gray-200 flex-shrink-0">
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
          <div 
            className="flex-1 bg-gray-50"
            style={{ 
              overflowY: 'auto',
              maxHeight: 'calc(100vh - 120px)'
            }}
          >
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