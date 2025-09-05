/**
 * 元数据编辑器组件
 * 支持Obsidian风格的文档属性编辑
 */

import React, { useState, useCallback } from 'react';
import { DocumentMetadata, Attribute, AttributeType } from '../../types';
// import { AttributeEditor } from '../AttributeEditor/AttributeEditor';

interface MetadataEditorProps {
  /** 元数据对象 */
  metadata: DocumentMetadata;
  
  /** 是否只读模式 */
  readonly?: boolean;
  
  /** 更新回调 */
  onChange?: (metadata: DocumentMetadata) => void;
}

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  metadata,
  readonly = false,
  onChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 更新元数据
  const updateMetadata = useCallback((updates: Partial<DocumentMetadata>) => {
    const updatedMetadata = { ...metadata, ...updates };
    onChange?.(updatedMetadata);
  }, [metadata, onChange]);

  // 更新属性
  const updateAttribute = useCallback((attributeId: string, updates: Partial<Attribute>) => {
    const attributes = metadata.attributes.map(attr =>
      attr.id === attributeId ? { ...attr, ...updates } : attr
    );
    updateMetadata({ attributes });
  }, [metadata.attributes, updateMetadata]);

  // 添加属性
  const addAttribute = useCallback((attribute: Omit<Attribute, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newAttribute: Attribute = {
      ...attribute,
      id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };
    
    const attributes = [...metadata.attributes, newAttribute];
    updateMetadata({ attributes });
  }, [metadata.attributes, updateMetadata]);

  // 删除属性
  const removeAttribute = useCallback((attributeId: string) => {
    const attributes = metadata.attributes.filter(attr => attr.id !== attributeId);
    updateMetadata({ attributes });
  }, [metadata.attributes, updateMetadata]);

  // 更新标签
  const updateTags = useCallback((tags: string[]) => {
    updateMetadata({ tags });
  }, [updateMetadata]);

  // 更新别名
  const updateAliases = useCallback((aliases: string[]) => {
    updateMetadata({ aliases });
  }, [updateMetadata]);

  return (
    <div className="metadata-editor">
      {/* 属性列表 */}
      <div className="metadata-section">
        <h4 className="section-title">属性</h4>
        <div className="attributes-list">
                     {metadata.attributes.map(attribute => (
             <div key={attribute.id} className="attribute-item">
               <div className="attribute-display">
                 <span className="attr-name">{attribute.name}:</span>
                 <span className="attr-value">{String(attribute.value || '')}</span>
                 <span className="attr-type">({attribute.type})</span>
                 {!readonly && (
                   <button
                     className="attr-remove"
                     onClick={() => removeAttribute(attribute.id)}
                   >
                     ×
                   </button>
                 )}
               </div>
             </div>
           ))}
           
           {!readonly && (
             <button 
               className="add-attribute-btn"
               onClick={() => {
                 // 这里可以弹出属性添加对话框
                 addAttribute({
                   name: '新属性',
                   type: 'text' as AttributeType,
                   value: '',
                   options: {},
                   validation: {},
                   description: ''
                 });
               }}
             >
               + 添加属性
             </button>
           )}
        </div>
      </div>

      {/* 标签 */}
      <div className="metadata-section">
        <h4 className="section-title">标签</h4>
        <div className="tags-editor">
          {metadata.tags.map((tag, index) => (
            <span key={index} className="tag-item">
              {tag}
              {!readonly && (
                <button
                  className="tag-remove"
                  onClick={() => {
                    const newTags = metadata.tags.filter((_, i) => i !== index);
                    updateTags(newTags);
                  }}
                >
                  ×
                </button>
              )}
            </span>
          ))}
          
          {!readonly && (
            <input
              type="text"
              className="tag-input"
              placeholder="添加标签..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = e.currentTarget.value.trim();
                  if (value && !metadata.tags.includes(value)) {
                    updateTags([...metadata.tags, value]);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
          )}
        </div>
      </div>

      {/* 别名 */}
      <div className="metadata-section">
        <h4 className="section-title">别名</h4>
        <div className="aliases-editor">
          {metadata.aliases.map((alias, index) => (
            <span key={index} className="alias-item">
              {alias}
              {!readonly && (
                <button
                  className="alias-remove"
                  onClick={() => {
                    const newAliases = metadata.aliases.filter((_, i) => i !== index);
                    updateAliases(newAliases);
                  }}
                >
                  ×
                </button>
              )}
            </span>
          ))}
          
          {!readonly && (
            <input
              type="text"
              className="alias-input"
              placeholder="添加别名..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = e.currentTarget.value.trim();
                  if (value && !metadata.aliases.includes(value)) {
                    updateAliases([...metadata.aliases, value]);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
          )}
        </div>
      </div>

      {/* 高级选项 */}
      <div className="metadata-section">
        <button
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          高级选项 {showAdvanced ? '▼' : '▶'}
        </button>
        
        {showAdvanced && (
          <div className="advanced-options">
            {/* 模板ID */}
            <div className="field">
              <label>模板ID</label>
                             <input
                 type="text"
                 value={metadata.templateId || ''}
                 onChange={(e) => updateMetadata({ templateId: e.target.value })}
                 readOnly={readonly}
                 placeholder="模板标识符..."
               />
            </div>

            {/* 链接信息 */}
            <div className="field">
              <label>内部链接 ({metadata.links.internal.length})</label>
              <div className="links-list">
                {metadata.links.internal.map((link, index) => (
                  <span key={index} className="link-item">
                    {link}
                  </span>
                ))}
              </div>
            </div>

            <div className="field">
              <label>外部链接 ({metadata.links.external.length})</label>
              <div className="links-list">
                {metadata.links.external.map((link, index) => (
                  <span key={index} className="link-item">
                    {link}
                  </span>
                ))}
              </div>
            </div>

            <div className="field">
              <label>反向链接 ({metadata.links.backlinks.length})</label>
              <div className="links-list">
                {metadata.links.backlinks.map((link, index) => (
                  <span key={index} className="link-item">
                    {link}
                  </span>
                ))}
              </div>
            </div>

            {/* 自定义字段 */}
            <div className="field">
              <label>自定义字段</label>
              <div className="custom-fields">
                {Object.entries(metadata.custom).map(([key, value]) => (
                  <div key={key} className="custom-field">
                    <span className="field-key">{key}:</span>
                    <span className="field-value">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 