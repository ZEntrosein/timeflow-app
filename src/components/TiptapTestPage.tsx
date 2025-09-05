/**
 * TiptapTestPage - 测试Tiptap编辑器集成的页面
 */

import React, { useState } from 'react';
import TiptapEditorAdapter from './RichTextEditor/TiptapEditorAdapter';
import { useDocumentStore } from '../store/documentStore';
import { RichTextDocument, AttributeType } from '../types';

export const TiptapTestPage: React.FC = () => {
  const { createDocument, updateDocument, getDocument } = useDocumentStore();
  const [testDocId, setTestDocId] = useState<string | null>(null);

  // 创建测试文档
  const createTestDocument = () => {
    const docId = createDocument('character', '测试角色文档');
    setTestDocId(docId);
  };

  // 获取测试文档
  const testDocument = testDocId ? getDocument(testDocId) : null;

  // 处理文档更新
  const handleDocumentUpdate = (doc: RichTextDocument) => {
    updateDocument(doc.id, doc);
  };

  // 自动保存处理
  const handleAutoSave = (doc: RichTextDocument) => {
    updateDocument(doc.id, doc);
    console.log('文档已自动保存:', doc.title);
  };

  return (
    <div className="min-h-full bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tiptap 编辑器测试页面</h1>

        {/* 测试控制面板 */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">测试控制</h2>
          
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={createTestDocument}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              创建测试文档
            </button>
            
            {testDocId && (
              <div className="text-sm text-gray-600 flex items-center">
                当前文档ID: {testDocId}
              </div>
            )}
          </div>

          {testDocument && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">文档信息</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>标题:</strong> {testDocument.title}
                </div>
                <div>
                  <strong>分类:</strong> {testDocument.category}
                </div>
                <div>
                  <strong>属性数量:</strong> {testDocument.metadata.attributes.length}
                </div>
                <div>
                  <strong>标签:</strong> {testDocument.metadata.tags.join(', ')}
                </div>
                <div>
                  <strong>内容块数量:</strong> {testDocument.content.length}
                </div>
                <div>
                  <strong>字符数:</strong> {testDocument.plainText.length}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 编辑器测试区域 */}
        {testDocument ? (
          <div className="bg-white rounded-lg shadow overflow-hidden max-h-[600px]">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Tiptap 编辑器</h2>
              <p className="text-sm text-gray-600 mt-1">
                测试富文本编辑功能和属性系统集成
              </p>
            </div>
            
            <TiptapEditorAdapter
              document={testDocument}
              onChange={handleDocumentUpdate}
              onAutoSave={handleAutoSave}
              config={{
                showMetadata: true,
                showToolbar: true,
                enableAutoSave: true,
                placeholder: '开始编写测试内容...\n\n可以尝试：\n- 使用工具栏格式化文本\n- 点击"+ 属性"按钮插入属性块\n- 测试自动保存功能'
              }}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center shadow">
            <div className="text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-4" style={{width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', maxWidth: '48px', maxHeight: '48px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">还没有测试文档</p>
              <p className="text-sm mt-2">点击"创建测试文档"按钮开始测试</p>
            </div>
          </div>
        )}

        {/* 帮助信息 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">测试功能说明</h3>
          <div className="space-y-2 text-blue-800">
            <p>• <strong>基础编辑:</strong> 测试文本格式化、标题、列表等功能</p>
            <p>• <strong>属性系统:</strong> 点击"+ 属性"按钮插入属性块，测试属性编辑功能</p>
            <p>• <strong>数据兼容:</strong> 验证DocumentBlock格式转换是否正常</p>
            <p>• <strong>自动保存:</strong> 编辑内容后观察控制台自动保存日志</p>
            <p>• <strong>实时更新:</strong> 观察文档信息面板的实时数据更新</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiptapTestPage; 