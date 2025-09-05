/**
 * 块类型选择菜单组件
 * 提供快速添加不同类型块的菜单
 */

import React, { useEffect, useRef } from 'react';
import { DocumentBlockType } from '../../types';

interface BlockMenuProps {
  /** 菜单位置 */
  position: { x: number; y: number };
  
  /** 选择回调 */
  onSelect?: (type: DocumentBlockType) => void;
  
  /** 关闭回调 */
  onClose?: () => void;
}

interface BlockMenuItem {
  type: DocumentBlockType;
  label: string;
  icon: string;
  description: string;
  shortcut?: string;
}

const BLOCK_MENU_ITEMS: BlockMenuItem[] = [
  {
    type: 'paragraph',
    label: '段落',
    icon: '¶',
    description: '普通文本段落',
    shortcut: 'Enter'
  },
  {
    type: 'heading',
    label: '标题',
    icon: 'H',
    description: '章节标题',
    shortcut: '# + 空格'
  },
  {
    type: 'list',
    label: '列表',
    icon: '•',
    description: '项目符号或编号列表',
    shortcut: '- + 空格'
  },
  {
    type: 'quote',
    label: '引用',
    icon: '"',
    description: '引用块',
    shortcut: '> + 空格'
  },
  {
    type: 'code',
    label: '代码',
    icon: '</>',
    description: '代码块',
    shortcut: '``` + 空格'
  },
  {
    type: 'table',
    label: '表格',
    icon: '⊞',
    description: '数据表格'
  },
  {
    type: 'image',
    label: '图片',
    icon: '🖼',
    description: '插入图片'
  },
  {
    type: 'embed',
    label: '嵌入',
    icon: '🔗',
    description: '嵌入外部内容'
  },
  {
    type: 'divider',
    label: '分隔线',
    icon: '—',
    description: '水平分隔线',
    shortcut: '--- + 空格'
  },
  {
    type: 'metadata',
    label: '元数据',
    icon: '⚙',
    description: 'YAML格式的元数据块'
  }
];

export const BlockMenu: React.FC<BlockMenuProps> = ({
  position,
  onSelect,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // 处理选择
  const handleSelect = (type: DocumentBlockType) => {
    onSelect?.(type);
    onClose?.();
  };

  return (
    <div
      ref={menuRef}
      className="block-menu"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000
      }}
    >
      <div className="block-menu-header">
        <span className="menu-title">选择块类型</span>
        <button
          className="menu-close"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      <div className="block-menu-content">
        {BLOCK_MENU_ITEMS.map((item) => (
          <div
            key={item.type}
            className="block-menu-item"
            onClick={() => handleSelect(item.type)}
          >
            <div className="item-icon">
              {item.icon}
            </div>
            <div className="item-content">
              <div className="item-label">
                {item.label}
                {item.shortcut && (
                  <span className="item-shortcut">
                    {item.shortcut}
                  </span>
                )}
              </div>
              <div className="item-description">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="block-menu-footer">
        <span className="menu-tip">
          按 Esc 关闭菜单
        </span>
      </div>
    </div>
  );
}; 