/**
 * 富文本文档系统类型定义
 * 将TimeFlow对象升级为带有元数据的富文本文档
 */

import { Attribute, AttributeType, DisplayState } from './index';

/**
 * 文档内容块类型
 */
export type DocumentBlockType = 
  | 'paragraph'     // 段落
  | 'heading'       // 标题 (h1-h6)
  | 'list'          // 列表
  | 'quote'         // 引用
  | 'code'          // 代码块
  | 'table'         // 表格
  | 'image'         // 图片
  | 'embed'         // 嵌入内容
  | 'divider'       // 分隔线
  | 'metadata';     // 元数据块

/**
 * 文档内容块
 */
export interface DocumentBlock {
  /** 块唯一标识 */
  id: string;
  
  /** 块类型 */
  type: DocumentBlockType;
  
  /** 块内容 */
  content: string;
  
  /** 块属性 */
  properties?: Record<string, any>;
  
  /** 子块（用于嵌套结构） */
  children?: DocumentBlock[];
  
  /** 创建时间 */
  createdAt: string;
  
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 文档元数据
 */
export interface DocumentMetadata {
  /** 属性列表（兼容现有系统） */
  attributes: Attribute[];
  
  /** 标签 */
  tags: string[];
  
  /** 别名 */
  aliases: string[];
  
  /** 模板ID */
  templateId?: string;
  
  /** 自定义元数据字段 */
  custom: Record<string, any>;
  
  /** 链接关系 */
  links: {
    /** 内部链接 */
    internal: string[];
    /** 外部链接 */
    external: string[];
    /** 双向链接 */
    backlinks: string[];
  };
}

/**
 * 富文本文档
 */
export interface RichTextDocument {
  /** 文档唯一标识 */
  id: string;
  
  /** 文档标题 */
  title: string;
  
  /** 文档摘要/描述 */
  summary?: string;
  
  /** 文档分类 */
  category: string;
  
  /** 元数据 */
  metadata: DocumentMetadata;
  
  /** 文档内容块 */
  content: DocumentBlock[];
  
  /** 纯文本内容（用于搜索索引） */
  plainText: string;
  
  /** 文档状态 */
  state?: DisplayState;
  
  /** 版本信息 */
  version: number;
  
  /** 创建时间 */
  createdAt: string;
  
  /** 最后更新时间 */
  updatedAt: string;
  
  /** 最后访问时间 */
  lastAccessedAt?: string;
}

/**
 * 文档模板
 */
export interface DocumentTemplate {
  /** 模板唯一标识 */
  id: string;
  
  /** 模板名称 */
  name: string;
  
  /** 模板描述 */
  description: string;
  
  /** 模板分类 */
  category: string;
  
  /** 模板图标 */
  icon?: string;
  
  /** 预定义属性 */
  attributes: Array<{
    name: string;
    type: AttributeType;
    required?: boolean;
    defaultValue?: any;
    options?: any;
  }>;
  
  /** 默认内容块 */
  defaultContent: DocumentBlock[];
  
  /** 模板标签 */
  tags: string[];
  
  /** 是否为系统模板 */
  isSystem: boolean;
  
  /** 创建时间 */
  createdAt: string;
  
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 文档搜索索引
 */
export interface DocumentIndex {
  /** 文档ID */
  documentId: string;
  
  /** 索引内容 */
  content: string;
  
  /** 关键词 */
  keywords: string[];
  
  /** 属性值索引 */
  attributeValues: Record<string, string>;
  
  /** 链接索引 */
  links: string[];
  
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 文档查询选项
 */
export interface DocumentQueryOptions {
  /** 搜索关键词 */
  search?: string;
  
  /** 分类过滤 */
  categories?: string[];
  
  /** 标签过滤 */
  tags?: string[];
  
  /** 属性过滤 */
  attributeFilters?: Array<{
    name: string;
    operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
    value: any;
  }>;
  
  /** 排序方式 */
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'lastAccessedAt';
  
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
  
  /** 分页 */
  limit?: number;
  offset?: number;
}

/**
 * 文档链接
 */
export interface DocumentLink {
  /** 源文档ID */
  sourceId: string;
  
  /** 目标文档ID */
  targetId: string;
  
  /** 链接类型 */
  type: 'reference' | 'embed' | 'relation' | 'custom';
  
  /** 链接标签 */
  label?: string;
  
  /** 链接上下文 */
  context?: string;
  
  /** 创建时间 */
  createdAt: string;
}

/**
 * 文档版本历史
 */
export interface DocumentVersion {
  /** 版本ID */
  id: string;
  
  /** 文档ID */
  documentId: string;
  
  /** 版本号 */
  version: number;
  
  /** 版本内容快照 */
  snapshot: RichTextDocument;
  
  /** 变更描述 */
  changeDescription?: string;
  
  /** 创建者 */
  author?: string;
  
  /** 创建时间 */
  createdAt: string;
}

/**
 * 导出类型（保持向后兼容）
 */
export type WorldDocument = RichTextDocument; 