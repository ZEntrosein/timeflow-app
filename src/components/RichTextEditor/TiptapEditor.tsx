/**
 * TiptapEditor - 基于Tiptap的富文本编辑器
 * 保持与现有RichTextEditor接口兼容
 */

import React, { useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { RichTextDocument, DocumentBlock, DocumentBlockType } from '../../types';
import { AttributeExtension } from './extensions/AttributeExtension';

// 保持与原有接口的兼容性
interface TiptapEditorProps {
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

interface TiptapEditorRef {
  focus: () => void;
  blur: () => void;
  getContent: () => string;
  setContent: (content: string) => void;
}

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(({
  document,
  readonly = false,
  onChange,
  onAutoSave,
  autoSaveInterval = 3000,
  config = {}
}, ref) => {
  
  // Tiptap编辑器配置
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 配置各个扩展
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: {
          languageClassPrefix: 'language-',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline',
        },
      }),
      AttributeExtension.configure({
        HTMLAttributes: {
          class: 'attribute-block',
        },
      }),
    ],
    editable: !readonly,
    content: documentBlocksToTiptapContent(document.content),
    onUpdate: ({ editor }) => {
      if (onChange) {
        const updatedDocument = {
          ...document,
          content: tiptapContentToDocumentBlocks(editor.getJSON()),
          plainText: editor.getText(),
          updatedAt: new Date().toISOString(),
        };
        onChange(updatedDocument);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] p-4 h-full',
        'data-placeholder': config.placeholder || '开始编写内容...',
      },
    },
  });

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    focus: () => editor?.commands.focus(),
    blur: () => editor?.commands.blur(),
    getContent: () => editor?.getHTML() || '',
    setContent: (content: string) => editor?.commands.setContent(content),
  }));

  // 自动保存逻辑
  useEffect(() => {
    if (!onAutoSave || !config.enableAutoSave || readonly) return;

    const timer = setInterval(() => {
      if (editor && editor.getText().length > 0) {
        const currentDocument = {
          ...document,
          content: tiptapContentToDocumentBlocks(editor.getJSON()),
          plainText: editor.getText(),
          updatedAt: new Date().toISOString(),
        };
        onAutoSave(currentDocument);
      }
    }, autoSaveInterval);

    return () => clearInterval(timer);
  }, [editor, onAutoSave, autoSaveInterval, config.enableAutoSave, readonly, document]);

  // 当document props改变时更新编辑器内容
  useEffect(() => {
    if (editor && document.content) {
      const newContent = documentBlocksToTiptapContent(document.content);
      const currentContent = editor.getJSON();
      
             // 只有内容真正不同时才更新，避免不必要的重新渲染
       if (JSON.stringify(newContent) !== JSON.stringify(currentContent)) {
         editor.commands.setContent(newContent);
       }
    }
  }, [editor, document.content]);

  // 编辑器销毁时清理
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">编辑器加载中...</div>
      </div>
    );
  }

  return (
    <div className="tiptap-editor-container h-full flex flex-col">
      {/* 元数据编辑器 */}
      {config.showMetadata && (
        <div className="metadata-section border-b border-gray-200 p-4 mb-4">
          <div className="text-sm text-gray-600 mb-2">文档元数据</div>
          <pre className="text-xs bg-gray-50 p-2 rounded">
            {JSON.stringify(document.metadata, null, 2)}
          </pre>
        </div>
      )}

      {/* 工具栏 */}
      {config.showToolbar && !readonly && (
        <div className="toolbar flex items-center gap-2 p-3 border-b border-gray-200 flex-wrap">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            disabled={!editor.can().chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
          >
            <s>S</s>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
          >
            H1
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
          >
            H2
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
          >
            H3
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
          >
            • 列表
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
          >
            1. 列表
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
          >
            引用
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
          >
            代码
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-300" />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
          >
            撤销
          </ToolbarButton>

                     <ToolbarButton
             onClick={() => editor.chain().focus().redo().run()}
             disabled={!editor.can().chain().focus().redo().run()}
           >
             重做
           </ToolbarButton>

           <div className="w-px h-6 bg-gray-300" />

           <ToolbarButton
             onClick={() => {
               if (editor) {
                 editor.chain().focus().insertAttributeBlock(document.metadata.attributes || []).run();
               }
             }}
           >
             + 属性
           </ToolbarButton>
         </div>
       )}

                   {/* 编辑器主体 */}
      <div className="editor-content-container relative flex-1 overflow-y-auto">
         <EditorContent editor={editor} />

         {/* TODO: 后续添加BubbleMenu和FloatingMenu */}
       </div>

      {/* 状态栏 */}
      <div className="status-bar flex items-center justify-between p-2 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>字符数: {editor.getText().length}</span>
          <span>版本: {document.version}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>已保存</span>
        </div>
      </div>
    </div>
  );
});

TiptapEditor.displayName = 'TiptapEditor';

// 工具栏按钮组件
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-2 py-1 rounded text-sm font-medium transition-colors
        ${isActive 
          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
          : 'text-gray-700 hover:bg-gray-100 border border-transparent'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer'
        }
      `}
    >
      {children}
    </button>
  );
};

// 数据格式转换函数
function documentBlocksToTiptapContent(blocks: DocumentBlock[]): any {
  return {
    type: 'doc',
    content: blocks.map(blockToTiptapNode)
  };
}

function blockToTiptapNode(block: DocumentBlock): any {
  const baseNode = {
    type: getTiptapTypeFromBlockType(block.type),
    content: block.type === 'heading' ? [{ type: 'text', text: block.content }] : undefined,
  };

  switch (block.type) {
    case 'heading':
      return {
        ...baseNode,
        attrs: {
          level: block.properties?.level || 1,
        },
        content: [{ type: 'text', text: block.content }],
      };
    
    case 'paragraph':
      return {
        ...baseNode,
        content: block.content ? parseTextContent(block.content) : [{ type: 'text', text: '' }],
      };
    
    case 'list':
      return {
        type: block.properties?.type === 'ordered' ? 'orderedList' : 'bulletList',
        content: parseListItems(block.content),
      };
    
    case 'quote':
      return {
        type: 'blockquote',
        content: [{
          type: 'paragraph',
          content: parseTextContent(block.content),
        }],
      };
    
    case 'code':
      return {
        type: 'codeBlock',
        attrs: {
          language: block.properties?.language || null,
        },
        content: [{ type: 'text', text: block.content }],
      };
    
    default:
      return {
        type: 'paragraph',
        content: [{ type: 'text', text: block.content || '' }],
      };
  }
}

function getTiptapTypeFromBlockType(blockType: DocumentBlockType): string {
  const typeMap: Record<DocumentBlockType, string> = {
    'paragraph': 'paragraph',
    'heading': 'heading',
    'list': 'bulletList',
    'quote': 'blockquote',
    'code': 'codeBlock',
    'table': 'table',
    'image': 'image',
    'embed': 'paragraph',
    'divider': 'horizontalRule',
    'metadata': 'paragraph',
  };
  
  return typeMap[blockType] || 'paragraph';
}

function parseTextContent(content: string): any[] {
  // 简单的文本解析，可以后续扩展支持markdown
  return [{ type: 'text', text: content }];
}

function parseListItems(content: string): any[] {
  const items = content.split('\n').filter(line => line.trim());
  return items.map(item => ({
    type: 'listItem',
    content: [{
      type: 'paragraph',
      content: [{ type: 'text', text: item.replace(/^[-*+]\s*/, '') }],
    }],
  }));
}

function tiptapContentToDocumentBlocks(content: any): DocumentBlock[] {
  if (!content || !content.content) return [];
  
  return content.content.map((node: any, index: number) => 
    tiptapNodeToDocumentBlock(node, index)
  );
}

function tiptapNodeToDocumentBlock(node: any, index: number): DocumentBlock {
  const now = new Date().toISOString();
  const baseBlock: DocumentBlock = {
    id: `block-${Date.now()}-${index}`,
    type: 'paragraph',
    content: '',
    properties: {},
    createdAt: now,
    updatedAt: now,
  };

  switch (node.type) {
    case 'heading':
      return {
        ...baseBlock,
        type: 'heading',
        content: extractTextFromNode(node),
        properties: { level: node.attrs?.level || 1 },
      };
    
    case 'paragraph':
      return {
        ...baseBlock,
        type: 'paragraph',
        content: extractTextFromNode(node),
      };
    
    case 'bulletList':
    case 'orderedList':
      return {
        ...baseBlock,
        type: 'list',
        content: extractListContent(node),
        properties: { type: node.type === 'orderedList' ? 'ordered' : 'unordered' },
      };
    
    case 'blockquote':
      return {
        ...baseBlock,
        type: 'quote',
        content: extractTextFromNode(node),
      };
    
    case 'codeBlock':
      return {
        ...baseBlock,
        type: 'code',
        content: extractTextFromNode(node),
        properties: { language: node.attrs?.language || '' },
      };
    
    default:
      return {
        ...baseBlock,
        content: extractTextFromNode(node),
      };
  }
}

function extractTextFromNode(node: any): string {
  if (!node.content) return '';
  
  return node.content
    .map((child: any) => {
      if (child.type === 'text') return child.text || '';
      return extractTextFromNode(child);
    })
    .join('');
}

function extractListContent(node: any): string {
  if (!node.content) return '';
  
  return node.content
    .map((listItem: any) => {
      const text = extractTextFromNode(listItem);
      return `- ${text}`;
    })
    .join('\n');
}

export default TiptapEditor; 