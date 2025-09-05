/**
 * 块编辑器组件
 * 支持不同类型的内容块编辑
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DocumentBlock, DocumentBlockType } from '../../types';

interface BlockEditorProps {
  /** 内容块数据 */
  block: DocumentBlock;
  
  /** 是否激活状态 */
  isActive?: boolean;
  
  /** 是否只读模式 */
  readonly?: boolean;
  
  /** 块更新回调 */
  onUpdate?: (updates: Partial<DocumentBlock>) => void;
  
  /** 删除块回调 */
  onDelete?: () => void;
  
  /** 移动块回调 */
  onMove?: (direction: 'up' | 'down') => void;
  
  /** 获得焦点回调 */
  onFocus?: () => void;
  
  /** 失去焦点回调 */
  onBlur?: () => void;
  
  /** 在此块后添加新块 */
  onAddBlockAfter?: (type: DocumentBlockType, content?: string) => void;
  
  /** 是否可以向上移动 */
  canMoveUp?: boolean;
  
  /** 是否可以向下移动 */
  canMoveDown?: boolean;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  block,
  isActive = false,
  readonly = false,
  onUpdate,
  onDelete,
  onMove,
  onFocus,
  onBlur,
  onAddBlockAfter,
  canMoveUp = true,
  canMoveDown = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(block.content);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // 同步外部内容变化
  useEffect(() => {
    setLocalContent(block.content);
  }, [block.content]);

  // 更新内容
  const updateContent = useCallback((content: string) => {
    setLocalContent(content);
    onUpdate?.({ content });
  }, [onUpdate]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (readonly) return;

    // Enter键处理
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter: 换行
        return;
      } else if (block.type === 'heading' || block.type === 'paragraph') {
        // Enter: 创建新段落
        e.preventDefault();
        onAddBlockAfter?.('paragraph');
      }
    }

    // 删除键处理
    if (e.key === 'Backspace' && localContent === '' && onDelete) {
      e.preventDefault();
      onDelete();
    }

    // 快捷键处理
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (canMoveUp) onMove?.('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (canMoveDown) onMove?.('down');
          break;
        case 'd':
          e.preventDefault();
          onDelete?.();
          break;
      }
    }
  }, [readonly, block.type, localContent, onDelete, onAddBlockAfter, canMoveUp, canMoveDown, onMove]);

  // 渲染不同类型的块
  const renderBlockContent = () => {
    const commonProps = {
      value: localContent,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        updateContent(e.target.value),
      onFocus: () => {
        setIsEditing(true);
        onFocus?.();
      },
      onBlur: () => {
        setIsEditing(false);
        onBlur?.();
      },
      onKeyDown: handleKeyDown,
      ref: inputRef as any,
      readOnly: readonly,
      className: `block-input ${block.type}`,
    };

    switch (block.type) {
      case 'heading':
        const level = block.properties?.level || 1;
        return (
          <input
            {...commonProps}
            type="text"
            placeholder={`标题 ${level}`}
            className={`block-input heading h${level}`}
          />
        );

      case 'paragraph':
        return (
          <textarea
            {...commonProps}
            placeholder="输入段落内容..."
            rows={1}
            style={{ resize: 'none', overflow: 'hidden' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = target.scrollHeight + 'px';
            }}
          />
        );

      case 'list':
        return (
          <textarea
            {...commonProps}
            placeholder="• 列表项\n• 列表项"
            rows={3}
          />
        );

      case 'quote':
        return (
          <textarea
            {...commonProps}
            placeholder="引用内容..."
            rows={2}
            className="block-input quote"
          />
        );

      case 'code':
        return (
          <textarea
            {...commonProps}
            placeholder="代码内容..."
            rows={5}
            className="block-input code"
            style={{ fontFamily: 'monospace' }}
          />
        );

      case 'divider':
        return (
          <div className="block-divider">
            <hr />
          </div>
        );

      case 'metadata':
        return (
          <textarea
            {...commonProps}
            placeholder="---\n属性名: 属性值\n---"
            rows={5}
            className="block-input metadata"
            style={{ fontFamily: 'monospace' }}
          />
        );

      default:
        return (
          <textarea
            {...commonProps}
            placeholder="内容..."
            rows={2}
          />
        );
    }
  };

  // 获取块类型图标
  const getBlockIcon = (type: DocumentBlockType) => {
    const icons = {
      paragraph: '¶',
      heading: 'H',
      list: '•',
      quote: '"',
      code: '</>', 
      table: '⊞',
      image: '🖼',
      embed: '🔗',
      divider: '—',
      metadata: '⚙',
    };
    return icons[type] || '□';
  };

  return (
    <div className={`block-editor ${isActive ? 'active' : ''} ${isEditing ? 'editing' : ''}`}>
      {/* 块控制栏 */}
      {(isActive || isEditing) && !readonly && (
        <div className="block-controls">
          <div className="block-handle">
            <span className="block-icon" title={`${block.type} 块`}>
              {getBlockIcon(block.type)}
            </span>
          </div>
          
          <div className="block-actions">
            {canMoveUp && (
              <button
                className="block-action"
                onClick={() => onMove?.('up')}
                title="向上移动"
              >
                ↑
              </button>
            )}
            
            {canMoveDown && (
              <button
                className="block-action"
                onClick={() => onMove?.('down')}
                title="向下移动"
              >
                ↓
              </button>
            )}
            
            <button
              className="block-action"
              onClick={() => onAddBlockAfter?.('paragraph')}
              title="添加段落"
            >
              +
            </button>
            
            <button
              className="block-action delete"
              onClick={onDelete}
              title="删除块"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* 块内容 */}
      <div className="block-content">
        {renderBlockContent()}
      </div>

      {/* 块信息 */}
      {isActive && (
        <div className="block-info">
          <span className="block-type">{block.type}</span>
          <span className="block-length">{localContent.length} 字符</span>
        </div>
      )}
    </div>
  );
}; 