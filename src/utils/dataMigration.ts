/**
 * 数据迁移工具
 * 将现有的WorldObject转换为RichTextDocument
 */

import { WorldObject, RichTextDocument, DocumentBlock, DocumentMetadata } from '../types';

/**
 * 将WorldObject转换为RichTextDocument
 */
export function migrateObjectToDocument(object: WorldObject): RichTextDocument {
  const now = new Date().toISOString();
  
  // 创建文档标题和分类
  const title = object.name || '未命名对象';
  const category = object.category || 'custom';
  
  // 转换属性到元数据
  const metadata: DocumentMetadata = {
    attributes: object.attributes || [],
    tags: object.tags || [],
    aliases: [],
    templateId: getTemplateIdFromCategory(category),
    custom: {},
    links: {
      internal: [],
      external: [],
      backlinks: []
    }
  };

  // 创建文档内容块
  const content = createContentBlocksFromObject(object);
  
  // 生成纯文本内容用于搜索
  const plainText = generatePlainTextFromBlocks(content);

  const document: RichTextDocument = {
    id: `migrated-${object.id}`,
    title,
    summary: object.description || '',
    category,
    metadata,
    content,
    plainText,
    state: object.state,
    version: 1,
    createdAt: object.createdAt || now,
    updatedAt: object.updatedAt || now,
    lastAccessedAt: now
  };

  return document;
}

/**
 * 根据分类确定模板ID
 */
function getTemplateIdFromCategory(category: string): string {
  const categoryTemplateMap: Record<string, string> = {
    'person': 'character-template',
    'place': 'location-template',
    'event': 'event-template',
    'object': 'item-template',
    'project': 'organization-template',
    'custom': 'blank-template'
  };
  
  return categoryTemplateMap[category] || 'blank-template';
}

/**
 * 从WorldObject创建文档内容块
 */
function createContentBlocksFromObject(object: WorldObject): DocumentBlock[] {
  const blocks: DocumentBlock[] = [];
  const now = new Date().toISOString();

  // 添加标题块
  blocks.push({
    id: `block-title-${Date.now()}`,
    type: 'heading',
    content: object.name || '未命名对象',
    properties: { level: 1 },
    createdAt: now,
    updatedAt: now
  });

  // 添加元数据块（如果有属性）
  if (object.attributes && object.attributes.length > 0) {
    const metadataContent = object.attributes
      .map(attr => `${attr.name}: ${attr.value || ''}`)
      .join('\n');
    
    blocks.push({
      id: `block-metadata-${Date.now()}`,
      type: 'metadata',
      content: `---\n${metadataContent}\n---`,
      properties: {},
      createdAt: now,
      updatedAt: now
    });
  }

  // 添加描述段落
  if (object.description) {
    blocks.push({
      id: `block-description-${Date.now()}`,
      type: 'paragraph',
      content: object.description,
      properties: {},
      createdAt: now,
      updatedAt: now
    });
  }

  // 如果有属性，为每个属性创建详细内容
  if (object.attributes && object.attributes.length > 0) {
    blocks.push({
      id: `block-attributes-header-${Date.now()}`,
      type: 'heading',
      content: '详细属性',
      properties: { level: 2 },
      createdAt: now,
      updatedAt: now
    });

    // 按类型分组属性
    const attributesByType = groupAttributesByType(object.attributes);
    
    Object.entries(attributesByType).forEach(([type, attrs]) => {
      if (attrs.length > 0) {
        // 添加属性类型小标题
        blocks.push({
          id: `block-attr-type-${type}-${Date.now()}`,
          type: 'heading',
          content: getAttributeTypeLabel(type),
          properties: { level: 3 },
          createdAt: now,
          updatedAt: now
        });

        // 添加属性列表
        const listContent = attrs
          .map(attr => `- **${attr.name}**: ${formatAttributeValue(attr)}`)
          .join('\n');
        
        blocks.push({
          id: `block-attr-list-${type}-${Date.now()}`,
          type: 'list',
          content: listContent,
          properties: { type: 'unordered' },
          createdAt: now,
          updatedAt: now
        });
      }
    });
  }

  // 添加标签信息
  if (object.tags && object.tags.length > 0) {
    blocks.push({
      id: `block-tags-${Date.now()}`,
      type: 'paragraph',
      content: `**标签**: ${object.tags.join(', ')}`,
      properties: {},
      createdAt: now,
      updatedAt: now
    });
  }

  // 如果没有任何内容块，至少添加一个空段落
  if (blocks.length === 1) {
    blocks.push({
      id: `block-placeholder-${Date.now()}`,
      type: 'paragraph',
      content: '开始编辑此文档...',
      properties: {},
      createdAt: now,
      updatedAt: now
    });
  }

  return blocks;
}

/**
 * 按类型分组属性
 */
function groupAttributesByType(attributes: any[]): Record<string, any[]> {
  return attributes.reduce((groups, attr) => {
    const type = attr.type || 'text';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(attr);
    return groups;
  }, {} as Record<string, any[]>);
}

/**
 * 获取属性类型的显示标签
 */
function getAttributeTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    'text': '文本属性',
    'number': '数值属性',
    'date': '日期属性',
    'boolean': '布尔属性',
    'list': '列表属性',
    'multi-select': '多选属性',
    'relation': '关系属性',
    'url': '链接属性',
    'file': '文件属性',
    'email': '邮箱属性',
    'phone': '电话属性',
    'color': '颜色属性',
    'rating': '评分属性',
    'progress': '进度属性',
    'currency': '货币属性',
    'duration': '时长属性',
    'location': '位置属性',
    'enum': '枚举属性'
  };
  
  return typeLabels[type] || '其他属性';
}

/**
 * 格式化属性值显示
 */
function formatAttributeValue(attr: any): string {
  if (attr.value === null || attr.value === undefined) {
    return '(未设置)';
  }
  
  switch (attr.type) {
    case 'boolean':
      return attr.value ? '是' : '否';
    case 'list':
    case 'multi-select':
      return Array.isArray(attr.value) ? attr.value.join(', ') : String(attr.value);
    case 'date':
      return attr.value ? new Date(attr.value).toLocaleDateString() : '(未设置)';
    case 'url':
      return attr.value ? `[${attr.value}](${attr.value})` : '(未设置)';
    case 'rating':
      return attr.value ? `${attr.value}/5 ⭐` : '(未评分)';
    case 'progress':
      return attr.value ? `${attr.value}%` : '0%';
    default:
      return String(attr.value);
  }
}

/**
 * 从内容块生成纯文本
 */
function generatePlainTextFromBlocks(blocks: DocumentBlock[]): string {
  return blocks
    .map(block => {
      // 移除markdown符号和特殊字符
      return block.content
        .replace(/^#+\s*/gm, '') // 移除标题符号
        .replace(/^\s*[-*+]\s*/gm, '') // 移除列表符号
        .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
        .replace(/\*(.*?)\*/g, '$1') // 移除斜体
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接，保留文本
        .replace(/```[\s\S]*?```/g, '') // 移除代码块
        .replace(/---[\s\S]*?---/g, '') // 移除元数据块
        .trim();
    })
    .filter(text => text.length > 0)
    .join(' ');
}

/**
 * 批量迁移WorldObject到RichTextDocument
 */
export function migrateObjectsToDocuments(objects: WorldObject[]): RichTextDocument[] {
  return objects.map(migrateObjectToDocument);
}

/**
 * 检查是否需要迁移
 */
export function needsMigration(objects: WorldObject[], documents: RichTextDocument[]): boolean {
  // 如果有对象但没有对应的文档，则需要迁移
  return objects.length > 0 && documents.length === 0;
}

/**
 * 获取迁移统计信息
 */
export function getMigrationStats(objects: WorldObject[]): {
  totalObjects: number;
  byCategory: Record<string, number>;
  totalAttributes: number;
  estimatedDocuments: number;
} {
  const byCategory: Record<string, number> = {};
  let totalAttributes = 0;

  objects.forEach(obj => {
    const category = obj.category || 'custom';
    byCategory[category] = (byCategory[category] || 0) + 1;
    totalAttributes += (obj.attributes || []).length;
  });

  return {
    totalObjects: objects.length,
    byCategory,
    totalAttributes,
    estimatedDocuments: objects.length
  };
} 