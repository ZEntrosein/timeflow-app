/**
 * 属性类型枚举
 * 支持文本、数字、枚举三种基本类型
 */
export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  ENUM = 'enum'
}

/**
 * 属性接口定义
 * 描述世界对象的各种属性
 */
export interface Attribute {
  /** 属性唯一标识符 */
  id: string;
  
  /** 属性名称 */
  name: string;
  
  /** 属性类型 */
  type: AttributeType;
  
  /** 属性当前值 */
  value: string | number | null;
  
  /** 枚举类型的可选值列表 */
  enumValues?: string[];
  
  /** 属性描述 */
  description?: string;
  
  /** 创建时间 */
  createdAt: string;
  
  /** 最后更新时间 */
  updatedAt: string;
}

/**
 * 世界对象接口定义
 * 代表时间轴中的实体，如角色、物品、地点等
 */
export interface WorldObject {
  /** 对象唯一标识符 */
  id: string;
  
  /** 对象名称 */
  name: string;
  
  /** 对象拥有的属性列表 */
  attributes: Attribute[];
  
  /** 对象描述 */
  description?: string;
  
  /** 对象分类/标签 */
  category?: string;
  
  /** 创建时间 */
  createdAt: string;
  
  /** 最后更新时间 */
  updatedAt: string;
}

/**
 * 属性值变更事件接口
 * 记录某个时间点对象属性的变化
 */
export interface Event {
  /** 事件唯一标识符 */
  id: string;
  
  /** 事件发生时间戳 */
  timestamp: number;
  
  /** 相关对象ID */
  objectId: string;
  
  /** 相关属性ID */
  attributeId: string;
  
  /** 属性的新值 */
  newValue: string | number | null;
  
  /** 属性的旧值 */
  oldValue?: string | number | null;
  
  /** 事件描述 */
  description?: string;
  
  /** 创建时间 */
  createdAt: string;
}

/**
 * 时间轴接口定义
 * 管理时间状态和事件序列
 */
export interface Timeline {
  /** 时间轴唯一标识符 */
  id: string;
  
  /** 当前时间点 */
  currentTime: number;
  
  /** 所有事件列表，按时间戳排序 */
  events: Event[];
  
  /** 时间轴名称 */
  name: string;
  
  /** 时间轴描述 */
  description?: string;
  
  /** 时间轴的开始时间 */
  startTime: number;
  
  /** 时间轴的结束时间 */
  endTime: number;
  
  /** 创建时间 */
  createdAt: string;
  
  /** 最后更新时间 */
  updatedAt: string;
}

/**
 * 项目数据结构
 * 包含整个项目的所有数据
 */
export interface ProjectData {
  /** 项目唯一标识符 */
  id: string;
  
  /** 项目名称 */
  name: string;
  
  /** 项目描述 */
  description?: string;
  
  /** 所有世界对象 */
  objects: WorldObject[];
  
  /** 主时间轴 */
  timeline: Timeline;
  
  /** 项目版本 */
  version: string;
  
  /** 创建时间 */
  createdAt: string;
  
  /** 最后更新时间 */
  updatedAt: string;
}

/**
 * 对象在特定时间点的状态快照
 */
export interface ObjectState {
  /** 对象ID */
  objectId: string;
  
  /** 时间点 */
  timestamp: number;
  
  /** 属性值映射 */
  attributeValues: Record<string, string | number | null>;
}

/**
 * 时间轴查询选项
 */
export interface TimelineQueryOptions {
  /** 开始时间 */
  startTime?: number;
  
  /** 结束时间 */
  endTime?: number;
  
  /** 筛选的对象ID列表 */
  objectIds?: string[];
  
  /** 筛选的属性ID列表 */
  attributeIds?: string[];
  
  /** 排序方式 */
  sortBy?: 'timestamp' | 'objectId';
  
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}