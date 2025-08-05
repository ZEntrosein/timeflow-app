import React, { useState, useMemo } from 'react';
import { WorldObject, TimelineEvent, Attribute, AttributeFilter, AttributeValue } from '../../../types';
import { AttributeEditor } from '../../UI/AttributeEditor/AttributeEditor';

interface AttributeTableViewProps {
  /** 数据源 */
  data: (WorldObject | TimelineEvent)[];
  /** 显示的属性列表 */
  visibleAttributes: string[];
  /** 过滤器 */
  filters?: AttributeFilter[];
  /** 排序配置 */
  sortBy?: {
    attribute: string;
    order: 'asc' | 'desc';
  };
  /** 分组依据 */
  groupBy?: string;
  /** 是否可编辑 */
  editable?: boolean;
  /** 数据变更回调 */
  onDataChange?: (updatedData: (WorldObject | TimelineEvent)[]) => void;
  /** 选择变更回调 */
  onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * 属性表格视图组件
 * 以表格形式展示对象和事件的属性数据
 */
export const AttributeTableView: React.FC<AttributeTableViewProps> = ({
  data,
  visibleAttributes,
  filters = [],
  sortBy,
  groupBy,
  editable = false,
  onDataChange,
  onSelectionChange
}) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ rowId: string; attributeId: string } | null>(null);

  // 获取所有属性定义
  const allAttributes = useMemo(() => {
    const attributeMap = new Map<string, Attribute>();
    
    data.forEach(item => {
      if ('attributes' in item && item.attributes) {
        item.attributes.forEach(attr => {
          attributeMap.set(attr.id, attr);
        });
      }
    });
    
    return Array.from(attributeMap.values());
  }, [data]);

  // 过滤后的属性列表
  const displayAttributes = useMemo(() => {
    return allAttributes.filter(attr => 
      visibleAttributes.length === 0 || visibleAttributes.includes(attr.id)
    );
  }, [allAttributes, visibleAttributes]);

  // 应用过滤器
  const filteredData = useMemo(() => {
    if (filters.length === 0) return data;
    
    return data.filter(item => {
      return filters.every(filter => {
        if (!filter.enabled) return true;
        
        const attribute = allAttributes.find(attr => attr.id === filter.attribute);
        if (!attribute) return true;
        
        const value = getAttributeValue(item, filter.attribute);
        return applyFilter(value, filter);
      });
    });
  }, [data, filters, allAttributes]);

  // 排序数据
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = getAttributeValue(a, sortBy.attribute);
      const bValue = getAttributeValue(b, sortBy.attribute);
      
      const comparison = compareValues(aValue, bValue);
      return sortBy.order === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sortBy]);

  // 获取属性值
  const getAttributeValue = (item: WorldObject | TimelineEvent, attributeId: string): AttributeValue => {
    if ('attributes' in item && item.attributes) {
      const attr = item.attributes.find(a => a.id === attributeId);
      return attr?.value || null;
    }
    return null;
  };

  // 应用过滤器逻辑
  const applyFilter = (value: AttributeValue, filter: AttributeFilter): boolean => {
    const { operator, value: filterValue } = filter;
    
    switch (operator) {
      case 'equals':
        return value === filterValue;
      case 'not_equals':
        return value !== filterValue;
      case 'contains':
        return typeof value === 'string' && typeof filterValue === 'string' 
          ? value.includes(filterValue) 
          : false;
      case 'not_contains':
        return typeof value === 'string' && typeof filterValue === 'string' 
          ? !value.includes(filterValue) 
          : true;
      case 'greater_than':
        return typeof value === 'number' && typeof filterValue === 'number' 
          ? value > filterValue 
          : false;
      case 'less_than':
        return typeof value === 'number' && typeof filterValue === 'number' 
          ? value < filterValue 
          : false;
      case 'is_empty':
        return value === null || value === undefined || value === '';
      case 'is_not_empty':
        return value !== null && value !== undefined && value !== '';
      default:
        return true;
    }
  };

  // 比较值
  const compareValues = (a: AttributeValue, b: AttributeValue): number => {
    if (a === null || a === undefined) return b === null || b === undefined ? 0 : -1;
    if (b === null || b === undefined) return 1;
    
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }
    
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }
    
    return String(a).localeCompare(String(b));
  };

  // 更新属性值
  const updateAttributeValue = (itemId: string, attributeId: string, newValue: AttributeValue) => {
    if (!onDataChange) return;
    
    const updatedData = data.map(item => {
      if (item.id === itemId && 'attributes' in item && item.attributes) {
        const updatedAttributes = item.attributes.map(attr => 
          attr.id === attributeId 
            ? { ...attr, value: newValue, updatedAt: new Date().toISOString() }
            : attr
        );
        return { ...item, attributes: updatedAttributes };
      }
      return item;
    });
    
    onDataChange(updatedData);
  };

  // 处理行选择
  const handleRowSelection = (itemId: string, selected: boolean) => {
    const newSelection = new Set(selectedRows);
    if (selected) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  };

  // 处理全选
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = new Set(sortedData.map(item => item.id));
      setSelectedRows(allIds);
      onSelectionChange?.(Array.from(allIds));
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  return (
    <div className="attribute-table-view">
      {/* 表格容器 */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          {/* 表头 */}
          <thead className="bg-gray-50">
            <tr>
              {/* 选择列 */}
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              
              {/* 名称列 */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                名称
              </th>
              
              {/* 属性列 */}
              {displayAttributes.map(attribute => (
                <th
                  key={attribute.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center space-x-1">
                    <span>{attribute.name}</span>
                    <span className="text-xs text-gray-400">({attribute.type})</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          {/* 表体 */}
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 ${selectedRows.has(item.id) ? 'bg-blue-50' : ''}`}
              >
                {/* 选择列 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(item.id)}
                    onChange={(e) => handleRowSelection(item.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                
                {/* 名称列 */}
                                 <td className="px-6 py-4 whitespace-nowrap">
                   <div className="text-sm font-medium text-gray-900">
                     {'name' in item ? (item as WorldObject).name : 'title' in item ? (item as TimelineEvent).title : (item as any).id}
                   </div>
                   <div className="text-sm text-gray-500">
                     {'category' in item ? item.category : ''}
                   </div>
                 </td>
                
                {/* 属性列 */}
                {displayAttributes.map(attribute => {
                  const value = getAttributeValue(item, attribute.id);
                  const isEditing = editingCell?.rowId === item.id && editingCell?.attributeId === attribute.id;
                  
                  return (
                    <td
                      key={attribute.id}
                      className="px-6 py-4 whitespace-nowrap"
                      onClick={() => {
                        if (editable && !isEditing) {
                          setEditingCell({ rowId: item.id, attributeId: attribute.id });
                        }
                      }}
                    >
                      {isEditing && editable ? (
                        <div className="w-48">
                          <AttributeEditor
                            attribute={attribute}
                            value={value}
                            onChange={(newValue) => {
                              updateAttributeValue(item.id, attribute.id, newValue);
                              setEditingCell(null);
                            }}
                            showValidation={false}
                          />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
                          {formatDisplayValue(value, attribute)}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 底部统计 */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div>
          显示 {sortedData.length} 项，共 {data.length} 项
          {selectedRows.size > 0 && ` • 已选择 ${selectedRows.size} 项`}
        </div>
        {filters.length > 0 && (
          <div>
            应用了 {filters.filter(f => f.enabled).length} 个过滤器
          </div>
        )}
      </div>
    </div>
  );
};

// 格式化显示值
const formatDisplayValue = (value: AttributeValue, attribute: Attribute): string => {
  if (value === null || value === undefined) return '-';
  
  switch (attribute.type) {
    case 'boolean':
      return value ? '是' : '否';
    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      return String(value);
    case 'list':
    case 'multi-select':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return String(value);
    case 'currency':
      const currency = attribute.options?.currency || '¥';
      return `${currency}${value}`;
    case 'progress':
      return `${value}%`;
    default:
      return String(value);
  }
};

export default AttributeTableView; 