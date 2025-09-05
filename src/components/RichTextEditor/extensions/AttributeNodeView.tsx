/**
 * AttributeNodeView - 属性块的React节点视图
 * 在Tiptap编辑器中渲染可编辑的属性块
 */

import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Attribute, AttributeType } from '../../../types';

interface AttributeNodeViewProps {
  node: {
    attrs: {
      id: string;
      attributes: Attribute[];
    };
  };
  updateAttributes: (attrs: any) => void;
  deleteNode: () => void;
  selected: boolean;
}

export const AttributeNodeView: React.FC<AttributeNodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingAttribute, setEditingAttribute] = useState<string | null>(null);
  
  const attributes = node.attrs.attributes || [];

  const handleAttributeChange = (attrId: string, updates: Partial<Attribute>) => {
    const newAttributes = attributes.map(attr => 
      attr.id === attrId ? { ...attr, ...updates } : attr
    );
    updateAttributes({ attributes: newAttributes });
  };

  const handleAddAttribute = () => {
    const newAttr: Attribute = {
      id: `attr-${Date.now()}`,
      name: '新属性',
      type: AttributeType.TEXT,
      value: '',
      validation: { required: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const newAttributes = [...attributes, newAttr];
    updateAttributes({ attributes: newAttributes });
    setEditingAttribute(newAttr.id);
  };

  const handleDeleteAttribute = (attrId: string) => {
    const newAttributes = attributes.filter(attr => attr.id !== attrId);
    updateAttributes({ attributes: newAttributes });
  };

  return (
    <NodeViewWrapper className={`attribute-node ${selected ? 'selected' : ''}`}>
      <div className="border border-gray-300 rounded-lg bg-white shadow-sm mb-4">
        {/* 头部 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="font-medium text-gray-700">属性 ({attributes.length})</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleAddAttribute}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              title="添加属性"
            >
              + 属性
            </button>
            <button
              onClick={deleteNode}
              className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded"
              title="删除属性块"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* 属性列表 */}
        {isExpanded && (
          <div className="p-3 space-y-3">
            {attributes.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <p>暂无属性</p>
                <button
                  onClick={handleAddAttribute}
                  className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
                >
                  点击添加第一个属性
                </button>
              </div>
            ) : (
              attributes.map((attr) => (
                <div
                  key={attr.id}
                  className="flex items-start gap-3 p-2 border border-gray-200 rounded bg-gray-50"
                >
                  <div className="flex-1 min-w-0">
                    {editingAttribute === attr.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={attr.name}
                          onChange={(e) => handleAttributeChange(attr.id, { name: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="属性名称"
                          autoFocus
                          onBlur={() => setEditingAttribute(null)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              setEditingAttribute(null);
                            }
                          }}
                        />
                        <select
                          value={attr.type}
                          onChange={(e) => handleAttributeChange(attr.id, { 
                            type: e.target.value as AttributeType 
                          })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value={AttributeType.TEXT}>文本</option>
                          <option value={AttributeType.NUMBER}>数字</option>
                          <option value={AttributeType.DATE}>日期</option>
                          <option value={AttributeType.BOOLEAN}>是/否</option>
                          <option value={AttributeType.LIST}>列表</option>
                        </select>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer"
                        onClick={() => setEditingAttribute(attr.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900">{attr.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-200 px-1 rounded">
                            {getAttributeTypeLabel(attr.type)}
                          </span>
                          {attr.validation?.required && (
                            <span className="text-xs text-red-500">*</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatAttributeValue(attr)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDeleteAttribute(attr.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    title="删除属性"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

// 辅助函数
function getAttributeTypeLabel(type: AttributeType): string {
  const labels: Record<AttributeType, string> = {
    [AttributeType.TEXT]: '文本',
    [AttributeType.NUMBER]: '数字',
    [AttributeType.DATE]: '日期',
    [AttributeType.BOOLEAN]: '布尔',
    [AttributeType.LIST]: '列表',
    [AttributeType.MULTI_SELECT]: '多选',
    [AttributeType.RELATION]: '关系',
    [AttributeType.URL]: '链接',
    [AttributeType.FILE]: '文件',
    [AttributeType.EMAIL]: '邮箱',
    [AttributeType.PHONE]: '电话',
    [AttributeType.COLOR]: '颜色',
    [AttributeType.RATING]: '评分',
    [AttributeType.PROGRESS]: '进度',
    [AttributeType.CURRENCY]: '货币',
    [AttributeType.DURATION]: '时长',
    [AttributeType.LOCATION]: '位置',
    [AttributeType.ENUM]: '枚举',
  };
  
  return labels[type] || type;
}

function formatAttributeValue(attr: Attribute): string {
  if (!attr.value) return '(未设置)';
  
  switch (attr.type) {
    case AttributeType.BOOLEAN:
      return attr.value ? '是' : '否';
    case AttributeType.LIST:
      return Array.isArray(attr.value) ? attr.value.join(', ') : String(attr.value);
    case AttributeType.DATE:
      return attr.value instanceof Date ? attr.value.toLocaleDateString() : new Date(String(attr.value)).toLocaleDateString();
    default:
      return String(attr.value);
  }
}

export default AttributeNodeView; 