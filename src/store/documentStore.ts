/**
 * 文档存储管理器
 * 扩展现有的projectStore以支持富文本文档系统
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  RichTextDocument, 
  DocumentTemplate, 
  DocumentQueryOptions,
  DocumentIndex,
  DocumentLink,
  DocumentVersion 
} from '../types';
import { 
  DOCUMENT_TEMPLATES, 
  createDocumentFromTemplate 
} from '../constants/documentTemplates';

export interface DocumentStore {
  // 文档数据
  documents: RichTextDocument[];
  templates: DocumentTemplate[];
  documentLinks: DocumentLink[];
  documentVersions: DocumentVersion[];
  searchIndex: DocumentIndex[];
  
  // 状态
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  
  // 文档管理
  createDocument: (templateId?: string, title?: string) => string;
  updateDocument: (documentId: string, updates: Partial<RichTextDocument>) => void;
  deleteDocument: (documentId: string) => void;
  getDocument: (documentId: string) => RichTextDocument | undefined;
  getDocuments: (options?: DocumentQueryOptions) => RichTextDocument[];
  
  // 文档操作
  duplicateDocument: (documentId: string) => string;
  moveDocument: (documentId: string, newCategory: string) => void;
  
  // 搜索和过滤
  searchDocuments: (query: string) => RichTextDocument[];
  getDocumentsByCategory: (category: string) => RichTextDocument[];
  getDocumentsByTag: (tag: string) => RichTextDocument[];
  
  // 链接管理
  addDocumentLink: (sourceId: string, targetId: string, type?: string) => void;
  removeDocumentLink: (sourceId: string, targetId: string) => void;
  getLinkedDocuments: (documentId: string) => RichTextDocument[];
  getBacklinks: (documentId: string) => RichTextDocument[];
  
  // 版本管理
  createVersion: (documentId: string, description?: string) => string;
  restoreVersion: (documentId: string, versionId: string) => void;
  getVersions: (documentId: string) => DocumentVersion[];
  
  // 模板管理
  getTemplates: () => DocumentTemplate[];
  getTemplatesByCategory: (category: string) => DocumentTemplate[];
  createCustomTemplate: (template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt'>) => string;
  
  // 搜索索引
  rebuildSearchIndex: () => void;
  updateSearchIndex: (documentId: string) => void;
  
  // 导入导出
  exportDocuments: (documentIds?: string[]) => string;
  importDocuments: (data: string) => void;
  
  // 工具函数
  generateId: () => string;
  markUnsaved: () => void;
  markSaved: () => void;
}

export const useDocumentStore = create<DocumentStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        documents: [],
        templates: Object.values(DOCUMENT_TEMPLATES),
        documentLinks: [],
        documentVersions: [],
        searchIndex: [],
        isLoading: false,
        hasUnsavedChanges: false,

        // 文档管理
        createDocument: (templateId = 'blank', title = '新文档') => {
          const id = get().generateId();
          const documentData = createDocumentFromTemplate(templateId, title);
          
          const document: RichTextDocument = {
            id,
            ...documentData,
            plainText: documentData.plainText || '',
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as RichTextDocument;

          set((state) => ({
            documents: [...state.documents, document],
            hasUnsavedChanges: true
          }));

          // 更新搜索索引
          get().updateSearchIndex(id);
          
          return id;
        },

        updateDocument: (documentId, updates) => {
          set((state) => ({
            documents: state.documents.map(doc =>
              doc.id === documentId
                ? {
                    ...doc,
                    ...updates,
                    updatedAt: new Date().toISOString(),
                    version: doc.version + 1
                  }
                : doc
            ),
            hasUnsavedChanges: true
          }));

          // 更新搜索索引
          get().updateSearchIndex(documentId);
        },

        deleteDocument: (documentId) => {
          set((state) => ({
            documents: state.documents.filter(doc => doc.id !== documentId),
            documentLinks: state.documentLinks.filter(link => 
              link.sourceId !== documentId && link.targetId !== documentId
            ),
            documentVersions: state.documentVersions.filter(version => 
              version.documentId !== documentId
            ),
            searchIndex: state.searchIndex.filter(index => 
              index.documentId !== documentId
            ),
            hasUnsavedChanges: true
          }));
        },

        getDocument: (documentId) => {
          return get().documents.find(doc => doc.id === documentId);
        },

        getDocuments: (options = {}) => {
          let documents = get().documents;

          // 分类过滤
          if (options.categories?.length) {
            documents = documents.filter(doc => 
              options.categories!.includes(doc.category)
            );
          }

          // 标签过滤
          if (options.tags?.length) {
            documents = documents.filter(doc =>
              options.tags!.some(tag => doc.metadata.tags.includes(tag))
            );
          }

          // 属性过滤
          if (options.attributeFilters?.length) {
            documents = documents.filter(doc => {
              return options.attributeFilters!.every(filter => {
                const attr = doc.metadata.attributes.find(a => a.name === filter.name);
                if (!attr) return false;

                switch (filter.operator) {
                  case 'equals':
                    return attr.value === filter.value;
                  case 'contains':
                    return String(attr.value).includes(String(filter.value));
                  case 'gt':
                    return Number(attr.value) > Number(filter.value);
                  case 'lt':
                    return Number(attr.value) < Number(filter.value);
                  case 'gte':
                    return Number(attr.value) >= Number(filter.value);
                  case 'lte':
                    return Number(attr.value) <= Number(filter.value);
                  default:
                    return false;
                }
              });
            });
          }

          // 搜索过滤
          if (options.search) {
            const searchLower = options.search.toLowerCase();
            documents = documents.filter(doc =>
              doc.title.toLowerCase().includes(searchLower) ||
              doc.plainText.toLowerCase().includes(searchLower) ||
              doc.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
          }

          // 排序
          if (options.sortBy) {
            documents.sort((a, b) => {
              let aVal: any, bVal: any;
              
              switch (options.sortBy) {
                case 'title':
                  aVal = a.title;
                  bVal = b.title;
                  break;
                case 'createdAt':
                  aVal = new Date(a.createdAt);
                  bVal = new Date(b.createdAt);
                  break;
                case 'updatedAt':
                  aVal = new Date(a.updatedAt);
                  bVal = new Date(b.updatedAt);
                  break;
                case 'lastAccessedAt':
                  aVal = new Date(a.lastAccessedAt || a.updatedAt);
                  bVal = new Date(b.lastAccessedAt || b.updatedAt);
                  break;
                default:
                  return 0;
              }

              if (options.sortOrder === 'desc') {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
              } else {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
              }
            });
          }

          // 分页
          if (options.limit) {
            const start = options.offset || 0;
            documents = documents.slice(start, start + options.limit);
          }

          return documents;
        },

        // 文档操作
        duplicateDocument: (documentId) => {
          const original = get().getDocument(documentId);
          if (!original) return '';

          const id = get().generateId();
          const duplicate: RichTextDocument = {
            ...original,
            id,
            title: `${original.title} (副本)`,
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastAccessedAt: undefined,
          };

          set((state) => ({
            documents: [...state.documents, duplicate],
            hasUnsavedChanges: true
          }));

          return id;
        },

        moveDocument: (documentId, newCategory) => {
          get().updateDocument(documentId, { category: newCategory });
        },

        // 搜索功能
        searchDocuments: (query) => {
          const searchLower = query.toLowerCase();
          return get().documents.filter(doc =>
            doc.title.toLowerCase().includes(searchLower) ||
            doc.plainText.toLowerCase().includes(searchLower) ||
            doc.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
            doc.metadata.attributes.some(attr => 
              attr.name.toLowerCase().includes(searchLower) ||
              String(attr.value).toLowerCase().includes(searchLower)
            )
          );
        },

        getDocumentsByCategory: (category) => {
          return get().documents.filter(doc => doc.category === category);
        },

        getDocumentsByTag: (tag) => {
          return get().documents.filter(doc => 
            doc.metadata.tags.includes(tag)
          );
        },

        // 链接管理
        addDocumentLink: (sourceId, targetId, type = 'reference') => {
          const link: DocumentLink = {
            sourceId,
            targetId,
            type: type as any,
            createdAt: new Date().toISOString()
          };

          set((state) => ({
            documentLinks: [...state.documentLinks, link],
            hasUnsavedChanges: true
          }));

          // 更新文档的链接元数据
          const sourceDoc = get().getDocument(sourceId);
          const targetDoc = get().getDocument(targetId);

          if (sourceDoc) {
            const updatedLinks = { ...sourceDoc.metadata.links };
            if (!updatedLinks.internal.includes(targetId)) {
              updatedLinks.internal.push(targetId);
            }
            get().updateDocument(sourceId, {
              metadata: { ...sourceDoc.metadata, links: updatedLinks }
            });
          }

          if (targetDoc) {
            const updatedLinks = { ...targetDoc.metadata.links };
            if (!updatedLinks.backlinks.includes(sourceId)) {
              updatedLinks.backlinks.push(sourceId);
            }
            get().updateDocument(targetId, {
              metadata: { ...targetDoc.metadata, links: updatedLinks }
            });
          }
        },

        removeDocumentLink: (sourceId, targetId) => {
          set((state) => ({
            documentLinks: state.documentLinks.filter(link =>
              !(link.sourceId === sourceId && link.targetId === targetId)
            ),
            hasUnsavedChanges: true
          }));

          // 更新文档的链接元数据
          const sourceDoc = get().getDocument(sourceId);
          const targetDoc = get().getDocument(targetId);

          if (sourceDoc) {
            const updatedLinks = { ...sourceDoc.metadata.links };
            updatedLinks.internal = updatedLinks.internal.filter(id => id !== targetId);
            get().updateDocument(sourceId, {
              metadata: { ...sourceDoc.metadata, links: updatedLinks }
            });
          }

          if (targetDoc) {
            const updatedLinks = { ...targetDoc.metadata.links };
            updatedLinks.backlinks = updatedLinks.backlinks.filter(id => id !== sourceId);
            get().updateDocument(targetId, {
              metadata: { ...targetDoc.metadata, links: updatedLinks }
            });
          }
        },

        getLinkedDocuments: (documentId) => {
          const doc = get().getDocument(documentId);
          if (!doc) return [];

          const linkedIds = doc.metadata.links.internal;
          return get().documents.filter(d => linkedIds.includes(d.id));
        },

        getBacklinks: (documentId) => {
          const doc = get().getDocument(documentId);
          if (!doc) return [];

          const backlinkIds = doc.metadata.links.backlinks;
          return get().documents.filter(d => backlinkIds.includes(d.id));
        },

        // 版本管理
        createVersion: (documentId, description) => {
          const document = get().getDocument(documentId);
          if (!document) return '';

          const versionId = get().generateId();
          const version: DocumentVersion = {
            id: versionId,
            documentId,
            version: document.version,
            snapshot: { ...document },
            changeDescription: description,
            createdAt: new Date().toISOString()
          };

          set((state) => ({
            documentVersions: [...state.documentVersions, version],
            hasUnsavedChanges: true
          }));

          return versionId;
        },

        restoreVersion: (documentId, versionId) => {
          const version = get().documentVersions.find(v => v.id === versionId);
          if (!version) return;

          const restoredDocument = {
            ...version.snapshot,
            version: version.snapshot.version + 1,
            updatedAt: new Date().toISOString()
          };

          get().updateDocument(documentId, restoredDocument);
        },

        getVersions: (documentId) => {
          return get().documentVersions.filter(v => v.documentId === documentId);
        },

        // 模板管理
        getTemplates: () => {
          return get().templates;
        },

        getTemplatesByCategory: (category) => {
          return get().templates.filter(t => t.category === category);
        },

        createCustomTemplate: (templateData) => {
          const id = get().generateId();
          const template: DocumentTemplate = {
            ...templateData,
            id,
            isSystem: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          set((state) => ({
            templates: [...state.templates, template],
            hasUnsavedChanges: true
          }));

          return id;
        },

        // 搜索索引
        rebuildSearchIndex: () => {
          const documents = get().documents;
          const newIndex: DocumentIndex[] = documents.map(doc => ({
            documentId: doc.id,
            content: doc.plainText,
            keywords: doc.title.split(/\s+/).concat(doc.metadata.tags),
            attributeValues: doc.metadata.attributes.reduce((acc, attr) => {
              acc[attr.name] = String(attr.value || '');
              return acc;
            }, {} as Record<string, string>),
            links: doc.metadata.links.internal.concat(doc.metadata.links.external),
            updatedAt: new Date().toISOString()
          }));

          set({ searchIndex: newIndex });
        },

        updateSearchIndex: (documentId) => {
          const document = get().getDocument(documentId);
          if (!document) return;

          const indexEntry: DocumentIndex = {
            documentId,
            content: document.plainText,
            keywords: document.title.split(/\s+/).concat(document.metadata.tags),
            attributeValues: document.metadata.attributes.reduce((acc, attr) => {
              acc[attr.name] = String(attr.value || '');
              return acc;
            }, {} as Record<string, string>),
            links: document.metadata.links.internal.concat(document.metadata.links.external),
            updatedAt: new Date().toISOString()
          };

          set((state) => ({
            searchIndex: [
              ...state.searchIndex.filter(index => index.documentId !== documentId),
              indexEntry
            ]
          }));
        },

        // 导入导出
        exportDocuments: (documentIds) => {
          const documents = documentIds 
            ? get().documents.filter(doc => documentIds.includes(doc.id))
            : get().documents;

          const exportData = {
            documents,
            links: get().documentLinks.filter(link => 
              documents.some(doc => doc.id === link.sourceId) &&
              documents.some(doc => doc.id === link.targetId)
            ),
            exportedAt: new Date().toISOString(),
            version: '1.0'
          };

          return JSON.stringify(exportData, null, 2);
        },

        importDocuments: (data) => {
          try {
            const importData = JSON.parse(data);
            const { documents, links } = importData;

            if (documents && Array.isArray(documents)) {
              set((state) => ({
                documents: [...state.documents, ...documents],
                documentLinks: [...state.documentLinks, ...(links || [])],
                hasUnsavedChanges: true
              }));

              // 重建搜索索引
              get().rebuildSearchIndex();
            }
          } catch (error) {
            console.error('Failed to import documents:', error);
          }
        },

        // 工具函数
        generateId: () => {
          return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        },

        markUnsaved: () => {
          set({ hasUnsavedChanges: true });
        },

        markSaved: () => {
          set({ hasUnsavedChanges: false });
        },
      }),
      {
        name: 'timeflow-document-store',
        version: 1,
      }
    ),
    { name: 'DocumentStore' }
  )
); 