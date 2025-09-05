/**
 * 文档视图组件
 * 集成富文本编辑器和文档管理功能
 */

import React, { useState, useEffect } from 'react';
import { useDocumentStore } from '../../store/documentStore';
import { useProjectStore } from '../../store';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';
import TiptapEditorAdapter from '../RichTextEditor/TiptapEditorAdapter';
import { RichTextDocument, DocumentTemplate } from '../../types';
import { MigrationWizard } from '../MigrationWizard';
import { needsMigration } from '../../utils/dataMigration';

export const DocumentsView: React.FC = () => {
  const {
    documents,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    getTemplates,
    searchDocuments,
    getDocumentsByCategory,
  } = useDocumentStore();

  const { getObjects } = useProjectStore();

  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showMigrationWizard, setShowMigrationWizard] = useState(false);
  const [useTiptap, setUseTiptap] = useState(false); // 控制是否使用Tiptap编辑器

  // 检查是否需要数据迁移
  useEffect(() => {
    const objects = getObjects();
    if (needsMigration(objects, documents)) {
      setShowMigrationWizard(true);
    }
  }, [documents, getObjects]);

  const currentDocument = currentDocumentId ? getDocument(currentDocumentId) : null;
  const templates = getTemplates();

  // 获取过滤后的文档列表
  const getFilteredDocuments = () => {
    let filteredDocs = documents;

    if (selectedCategory !== 'all') {
      filteredDocs = getDocumentsByCategory(selectedCategory);
    }

    if (searchTerm) {
      filteredDocs = searchDocuments(searchTerm);
    }

    return filteredDocs;
  };

  // 处理文档创建
  const handleCreateDocument = (templateId?: string, title?: string) => {
    const newDocId = createDocument(templateId, title);
    setCurrentDocumentId(newDocId);
    setShowTemplateSelector(false);
  };

  // 处理文档更新
  const handleDocumentUpdate = (document: RichTextDocument) => {
    updateDocument(document.id, document);
  };

  // 自动保存
  const handleAutoSave = (document: RichTextDocument) => {
    updateDocument(document.id, document);
    console.log('文档已自动保存:', document.title);
  };

  // 获取文档分类列表
  const getCategories = () => {
    const categories = new Set(documents.map(doc => doc.category));
    return Array.from(categories);
  };

  // 如果没有文档且没有选中任何文档，显示欢迎界面
  if (documents.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">欢迎使用文档系统</h2>
            <p className="text-gray-600 mb-6">
              开始创建您的第一个文档，管理角色、地点、事件等内容
            </p>
            <button
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => setShowTemplateSelector(true)}
            >
              创建新文档
            </button>
          </div>
        </div>

        {/* 模板选择器 */}
        {showTemplateSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">选择文档模板</h3>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 text-left"
                    onClick={() => handleCreateDocument(template.id.replace('-template', ''), `新${template.name}`)}
                  >
                    <div className="text-lg mb-1">{template.icon}</div>
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.description}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  onClick={() => setShowTemplateSelector(false)}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* 文档列表侧边栏 */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        {/* 搜索和过滤 */}
        <div className="p-4 border-b">
          <div className="mb-3">
            <input
              type="text"
              placeholder="搜索文档..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有分类</option>
              {getCategories().map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => setShowTemplateSelector(true)}
            >
              +
            </button>
          </div>
        </div>

        {/* 文档列表 */}
        <div className="flex-1 overflow-y-auto">
          {getFilteredDocuments().map((doc) => (
            <div
              key={doc.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${
                currentDocumentId === doc.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => setCurrentDocumentId(doc.id)}
            >
              <div className="font-medium truncate">{doc.title}</div>
              <div className="text-sm text-gray-500 mt-1">
                {doc.category} • {doc.metadata.tags.join(', ')}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(doc.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 文档编辑器 */}
      <div className="flex-1 flex flex-col">
        {currentDocument ? (
          <div className="flex-1 flex flex-col">
            {/* 编辑器切换控制 */}
            <div className="border-b border-gray-200 p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-gray-900">{currentDocument.title}</h2>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={useTiptap}
                      onChange={(e) => setUseTiptap(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    使用Tiptap编辑器 (Beta)
                  </label>
                  {useTiptap && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      新版编辑器
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 编辑器内容 */}
            <div className="flex-1">
              {useTiptap ? (
                <TiptapEditorAdapter
                  document={currentDocument}
                  onChange={handleDocumentUpdate}
                  onAutoSave={handleAutoSave}
                  config={{
                    showMetadata: true,
                    showToolbar: true,
                    enableAutoSave: true,
                    placeholder: '开始编写您的内容...'
                  }}
                />
              ) : (
                <RichTextEditor
                  document={currentDocument}
                  onChange={handleDocumentUpdate}
                  onAutoSave={handleAutoSave}
                  config={{
                    showMetadata: true,
                    showToolbar: true,
                    enableAutoSave: true,
                    placeholder: '开始编写您的内容...'
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>选择一个文档开始编辑</p>
              <p className="text-sm mt-2">或者创建一个新文档</p>
            </div>
          </div>
        )}
      </div>

      {/* 模板选择器 */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">选择文档模板</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                  onClick={() => handleCreateDocument(template.id.replace('-template', ''), `新${template.name}`)}
                >
                  <div className="text-2xl mb-2">{template.icon}</div>
                  <div className="font-medium mb-1">{template.name}</div>
                  <div className="text-sm text-gray-500">{template.description}</div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                onClick={() => setShowTemplateSelector(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 数据迁移向导 */}
      {showMigrationWizard && (
        <MigrationWizard onClose={() => setShowMigrationWizard(false)} />
      )}
    </div>
  );
}; 