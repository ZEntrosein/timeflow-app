/**
 * TiptapEditorAdapter - Tiptap编辑器适配器
 * 保持与现有RichTextEditor接口完全兼容，支持渐进式迁移
 */

import React, { useState, useEffect, useRef } from 'react';
import { RichTextDocument } from '../../types';
import TiptapEditor from './TiptapEditor';

// 保持与原有RichTextEditor接口完全一致
interface TiptapEditorAdapterProps {
  document: RichTextDocument;
  readonly?: boolean;
  onChange?: (document: RichTextDocument) => void;
  onAutoSave?: (document: RichTextDocument) => void;
  autoSaveInterval?: number;
  config?: {
    showMetadata?: boolean;
    showToolbar?: boolean;
    enableAutoSave?: boolean;
    placeholder?: string;
  };
}

export const TiptapEditorAdapter: React.FC<TiptapEditorAdapterProps> = (props) => {
  const [isEnabled, setIsEnabled] = useState(true); // 可以通过这个开关控制是否使用Tiptap
  
  // 如果禁用Tiptap，可以回退到原有编辑器（开发阶段的安全网）
  if (!isEnabled) {
    return (
      <div className="p-4 border border-yellow-300 bg-yellow-50 rounded">
        <p className="text-yellow-800 mb-2">Tiptap编辑器已禁用，使用简化版本</p>
        <textarea
          value={props.document.plainText || ''}
          onChange={(e) => {
            if (props.onChange) {
              props.onChange({
                ...props.document,
                plainText: e.target.value,
                updatedAt: new Date().toISOString(),
              });
            }
          }}
          className="w-full h-64 p-3 border border-gray-300 rounded"
          placeholder={props.config?.placeholder || '开始编写内容...'}
          readOnly={props.readonly}
        />
        <button
          onClick={() => setIsEnabled(true)}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          启用Tiptap编辑器
        </button>
      </div>
    );
  }

  return <TiptapEditor {...props} />;
};

export default TiptapEditorAdapter; 