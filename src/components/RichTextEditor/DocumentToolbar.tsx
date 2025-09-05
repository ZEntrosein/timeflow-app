/**
 * 文档工具栏组件
 * 提供文档格式化和操作功能
 */

import React from 'react';
import { RichTextDocument, DocumentBlockType } from '../../types';

type ToolbarAction = 
  | 'toggleMetadata'
  | 'addBlock'
  | 'save'
  | 'export'
  | 'print';

interface DocumentToolbarProps {
  /** 文档数据 */
  document: RichTextDocument;
  
  /** 操作回调 */
  onAction?: (action: ToolbarAction, data?: any) => void;
}

export const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
  document,
  onAction
}) => {
  
  // 处理添加块操作
  const handleAddBlock = (type: DocumentBlockType) => {
    onAction?.('addBlock', { type });
  };

  // 处理保存
  const handleSave = () => {
    onAction?.('save');
  };

  // 处理导出
  const handleExport = () => {
    onAction?.('export');
  };

  return (
    <div className="document-toolbar">
      {/* 左侧：文档操作 */}
      <div className="toolbar-group left">
        <button
          className="toolbar-btn"
          onClick={() => onAction?.('toggleMetadata')}
          title="切换元数据显示"
        >
          ⚙️ 属性
        </button>
        
        <button
          className="toolbar-btn"
          onClick={handleSave}
          title="保存文档"
        >
          💾 保存
        </button>
        
        <button
          className="toolbar-btn"
          onClick={handleExport}
          title="导出文档"
        >
          📤 导出
        </button>
      </div>

      {/* 中间：块类型快捷添加 */}
      <div className="toolbar-group center">
        <span className="toolbar-label">添加块:</span>
        
        <button
          className="toolbar-btn block-btn"
          onClick={() => handleAddBlock('heading')}
          title="添加标题"
        >
          H
        </button>
        
        <button
          className="toolbar-btn block-btn"
          onClick={() => handleAddBlock('paragraph')}
          title="添加段落"
        >
          ¶
        </button>
        
        <button
          className="toolbar-btn block-btn"
          onClick={() => handleAddBlock('list')}
          title="添加列表"
        >
          •
        </button>
        
        <button
          className="toolbar-btn block-btn"
          onClick={() => handleAddBlock('quote')}
          title="添加引用"
        >
          "
        </button>
        
        <button
          className="toolbar-btn block-btn"
          onClick={() => handleAddBlock('code')}
          title="添加代码块"
        >
          &lt;/&gt;
        </button>
        
        <button
          className="toolbar-btn block-btn"
          onClick={() => handleAddBlock('divider')}
          title="添加分隔线"
        >
          —
        </button>
      </div>

      {/* 右侧：文档信息 */}
      <div className="toolbar-group right">
        <span className="doc-info">
          {document.content.length} 块
        </span>
        <span className="doc-info">
          {document.plainText.length} 字符
        </span>
        <span className="doc-info">
          v{document.version}
        </span>
      </div>
    </div>
  );
}; 