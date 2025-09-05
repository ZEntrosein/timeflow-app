/**
 * 富文本编辑器组件
 * 支持块式编辑、元数据管理和Obsidian风格的功能
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  RichTextDocument, 
  DocumentBlock, 
  DocumentMetadata,
  DocumentBlockType 
} from '../../types';
import { BlockEditor } from './BlockEditor';
// import { MetadataEditor } from './MetadataEditor';
import { DocumentToolbar } from './DocumentToolbar';
// import { BlockMenu } from './BlockMenu';
import './RichTextEditor.css';

interface RichTextEditorProps {
  /** 文档数据 */
  document: RichTextDocument;
  
  /** 是否只读模式 */
  readonly?: boolean;
  
  /** 文档更新回调 */
  onChange?: (document: RichTextDocument) => void;
  
  /** 自动保存回调 */
  onAutoSave?: (document: RichTextDocument) => void;
  
  /** 自动保存间隔（毫秒） */
  autoSaveInterval?: number;
  
  /** 编辑器配置 */
  config?: {
    showMetadata?: boolean;
    showToolbar?: boolean;
    enableAutoSave?: boolean;
    placeholder?: string;
  };
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  document,
  readonly = false,
  onChange,
  onAutoSave,
  autoSaveInterval = 3000,
  config = {}
}) => {
  const {
    showMetadata = true,
    showToolbar = true,
    enableAutoSave = true,
    placeholder = '开始编写...'
  } = config;

  const [localDocument, setLocalDocument] = useState<RichTextDocument>(document);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 });
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 同步外部文档变化
  useEffect(() => {
    setLocalDocument(document);
  }, [document]);

  // 自动保存逻辑
  useEffect(() => {
    if (!enableAutoSave || !onAutoSave || readonly) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      onAutoSave(localDocument);
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [localDocument, enableAutoSave, onAutoSave, autoSaveInterval, readonly]);

  // 更新文档
  const updateDocument = useCallback((updates: Partial<RichTextDocument>) => {
    const updatedDocument = {
      ...localDocument,
      ...updates,
      updatedAt: new Date().toISOString(),
      version: localDocument.version + 1
    };
    
    setLocalDocument(updatedDocument);
    onChange?.(updatedDocument);
  }, [localDocument, onChange]);

  // 更新元数据
  const updateMetadata = useCallback((metadata: DocumentMetadata) => {
    updateDocument({ metadata });
  }, [updateDocument]);

  // 更新内容块
  const updateBlocks = useCallback((blocks: DocumentBlock[]) => {
    const plainText = blocks
      .map(block => block.content)
      .join('\n')
      .replace(/[#*`\->\[\]]/g, ''); // 移除markdown符号

    updateDocument({ 
      content: blocks,
      plainText 
    });
  }, [updateDocument]);

  // 添加新块
  const addBlock = useCallback((
    type: DocumentBlockType, 
    afterBlockId?: string, 
    content: string = ''
  ) => {
    const newBlock: DocumentBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      properties: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const blocks = [...localDocument.content];
    
    if (afterBlockId) {
      const afterIndex = blocks.findIndex(block => block.id === afterBlockId);
      if (afterIndex !== -1) {
        blocks.splice(afterIndex + 1, 0, newBlock);
      } else {
        blocks.push(newBlock);
      }
    } else {
      blocks.push(newBlock);
    }

    updateBlocks(blocks);
    setActiveBlockId(newBlock.id);
    setShowBlockMenu(false);
  }, [localDocument.content, updateBlocks]);

  // 更新块内容
  const updateBlock = useCallback((blockId: string, updates: Partial<DocumentBlock>) => {
    const blocks = localDocument.content.map(block => 
      block.id === blockId 
        ? { 
            ...block, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          }
        : block
    );
    updateBlocks(blocks);
  }, [localDocument.content, updateBlocks]);

  // 删除块
  const deleteBlock = useCallback((blockId: string) => {
    const blocks = localDocument.content.filter(block => block.id !== blockId);
    updateBlocks(blocks);
    
    if (activeBlockId === blockId) {
      setActiveBlockId(null);
    }
  }, [localDocument.content, updateBlocks, activeBlockId]);

  // 移动块
  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    const blocks = [...localDocument.content];
    const currentIndex = blocks.findIndex(block => block.id === blockId);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    [blocks[currentIndex], blocks[newIndex]] = [blocks[newIndex], blocks[currentIndex]];
    updateBlocks(blocks);
  }, [localDocument.content, updateBlocks]);

  // 处理键盘快捷键
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (readonly) return;

    // Ctrl/Cmd + S: 手动保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onAutoSave?.(localDocument);
    }

    // Ctrl/Cmd + /: 显示块菜单
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      setShowBlockMenu(true);
      setBlockMenuPosition({ x: 100, y: 100 });
    }

    // Escape: 关闭块菜单
    if (e.key === 'Escape') {
      setShowBlockMenu(false);
      setActiveBlockId(null);
    }
  }, [readonly, onAutoSave, localDocument]);

  // 处理块菜单选择
  const handleBlockMenuSelect = useCallback((type: DocumentBlockType) => {
    addBlock(type, activeBlockId || undefined);
  }, [addBlock, activeBlockId]);

  return (
    <div 
      className="rich-text-editor"
      ref={editorRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 工具栏 */}
      {showToolbar && !readonly && (
        <DocumentToolbar
          document={localDocument}
          onAction={(action: string, data?: any) => {
            switch (action) {
              case 'toggleMetadata':
                setIsMetadataExpanded(!isMetadataExpanded);
                break;
              case 'addBlock':
                addBlock(data?.type, undefined, data?.content);
                break;
              case 'save':
                onAutoSave?.(localDocument);
                break;
            }
          }}
        />
      )}

      {/* 元数据编辑器 */}
      {showMetadata && (
        <div className={`metadata-section ${isMetadataExpanded ? 'expanded' : 'collapsed'}`}>
          <div 
            className="metadata-header"
            onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
          >
            <span className="metadata-title">文档属性</span>
            <span className={`metadata-toggle ${isMetadataExpanded ? 'expanded' : ''}`}>
              ▶
            </span>
          </div>
          
          {isMetadataExpanded && (
            <div className="metadata-editor-placeholder">
              <p>元数据编辑器 (开发中)</p>
              <pre>{JSON.stringify(localDocument.metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* 文档标题 */}
      <div className="document-header">
        {readonly ? (
          <h1 className="document-title readonly">{localDocument.title}</h1>
        ) : (
          <input
            type="text"
            className="document-title editable"
            value={localDocument.title}
            onChange={(e) => updateDocument({ title: e.target.value })}
            placeholder="文档标题..."
          />
        )}
        
        {localDocument.summary && (
          <div className="document-summary">
            {readonly ? (
              <p>{localDocument.summary}</p>
            ) : (
              <textarea
                className="summary-input"
                value={localDocument.summary}
                onChange={(e) => updateDocument({ summary: e.target.value })}
                placeholder="文档摘要..."
                rows={2}
              />
            )}
          </div>
        )}
      </div>

      {/* 内容编辑区域 */}
      <div className="document-content">
        {localDocument.content.length === 0 && !readonly ? (
          <div className="empty-state">
            <p className="empty-message">{placeholder}</p>
            <button 
              className="add-block-btn"
              onClick={() => addBlock('paragraph')}
            >
              添加段落
            </button>
          </div>
        ) : (
          localDocument.content.map((block, index) => (
            <BlockEditor
              key={block.id}
              block={block}
              isActive={activeBlockId === block.id}
              readonly={readonly}
              onUpdate={(updates: any) => updateBlock(block.id, updates)}
              onDelete={() => deleteBlock(block.id)}
              onMove={(direction: 'up' | 'down') => moveBlock(block.id, direction)}
              onFocus={() => setActiveBlockId(block.id)}
              onBlur={() => setActiveBlockId(null)}
              onAddBlockAfter={(type: DocumentBlockType, content?: string) => addBlock(type, block.id, content)}
              canMoveUp={index > 0}
              canMoveDown={index < localDocument.content.length - 1}
            />
          ))
        )}
      </div>

      {/* 块类型选择菜单 */}
      {showBlockMenu && !readonly && (
        <div 
          style={{
            position: 'fixed',
            left: blockMenuPosition.x,
            top: blockMenuPosition.y,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            zIndex: 1000
          }}
        >
          <p>块菜单 (开发中)</p>
          <button onClick={() => setShowBlockMenu(false)}>关闭</button>
        </div>
      )}

      {/* 状态指示器 */}
      <div className="editor-status">
        <span className="status-item">
          版本 {localDocument.version}
        </span>
        <span className="status-item">
          {localDocument.content.length} 个块
        </span>
        <span className="status-item">
          {localDocument.plainText.length} 字符
        </span>
        {enableAutoSave && !readonly && (
          <span className="status-item auto-save">
            自动保存
          </span>
        )}
      </div>
    </div>
  );
}; 