/**
 * 属性系统类型定义
 * 包含属性、验证、模板等相关类型
 */

import { ID, ISODateString, ObjectType } from '../core';

/**
 * 属性类型枚举
 * 支持多种数据类型，参考 Obsidian 的属性系统
 */
export enum AttributeType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  LIST = 'list',
  MULTI_SELECT = 'multi-select',
  RELATION = 'relation',
  URL = 'url',
  FILE = 'file',
  EMAIL = 'email',
  PHONE = 'phone',
  COLOR = 'color',
  RATING = 'rating',
  PROGRESS = 'progress',
  CURRENCY = 'currency',
  DURATION = 'duration',
  LOCATION = 'location',
  ENUM = 'enum' // 保持向后兼容
}

/**
 * 属性值类型
 */
export type AttributeValue = 
  | string 
  | number 
  | boolean 
  | Date 
  | string[] 
  | number[] 
  | null 
  | undefined;

/**
 * 属性验证规则
 */
export interface AttributeValidation {
  /** 是否必填 */
  required?: boolean;
  /** 最小值（数字/日期） */
  min?: number;
  /** 最大值（数字/日期） */
  max?: number;
  /** 最小长度（文本/列表） */
  minLength?: number;
  /** 最大长度（文本/列表） */
  maxLength?: number;
  /** 正则表达式验证（文本） */
  pattern?: string;
  /** 自定义验证函数名称 */
  customValidator?: string;
  /** 验证错误消息 */
  errorMessage?: string;
}

/**
 * 属性选项配置
 */
export interface AttributeOptions {
  // 通用选项
  /** 占位符文本 */
  placeholder?: string;
  /** 帮助文本 */
  helpText?: string;
  /** 是否只读 */
  readonly?: boolean;

  // 选择类型选项
  /** 选择项列表 */
  choices?: string[];
  /** 是否允许自定义选项 */
  allowCustom?: boolean;
  /** 是否支持多选 */
  multiple?: boolean;

  // 数字类型选项
  /** 数字步进值 */
  step?: number;
  /** 数字精度 */
  precision?: number;
  /** 货币符号 */
  currency?: string;

  // 文本类型选项
  /** 是否为多行文本 */
  multiline?: boolean;
  /** 文本行数 */
  rows?: number;

  // 日期类型选项
  /** 日期格式 */
  dateFormat?: 'date' | 'datetime' | 'time';
  /** 时区 */
  timezone?: string;

  // 文件类型选项
  /** 允许的文件类型 */
  fileTypes?: string[];
  /** 最大文件大小（字节） */
  maxFileSize?: number;

  // 关系类型选项
  /** 关联的对象类型 */
  relationObjectTypes?: ObjectType[];
  /** 是否允许多个关联 */
  allowMultipleRelations?: boolean;

  // 位置类型选项
  /** 默认地图中心 */
  defaultCenter?: [number, number];
  /** 默认缩放级别 */
  defaultZoom?: number;

  // 评分类型选项
  /** 最大评分值 */
  maxRating?: number;
  /** 评分图标 */
  ratingIcon?: string;

  // 进度类型选项
  /** 进度条颜色 */
  progressColor?: string;
  /** 是否显示百分比 */
  showPercentage?: boolean;
}

/**
 * 属性过滤操作符
 */
export type AttributeFilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_empty'
  | 'is_not_empty'
  | 'is_true'
  | 'is_false';

/**
 * 属性过滤器
 */
export interface AttributeFilter {
  /** 属性名称 */
  attributeName: string;
  /** 操作符 */
  operator: AttributeFilterOperator;
  /** 过滤值 */
  value?: AttributeValue;
  /** 范围值（用于between操作符） */
  rangeValue?: [AttributeValue, AttributeValue];
  /** 列表值（用于in/not_in操作符） */
  listValue?: AttributeValue[];
}

/**
 * 属性排序配置
 */
export interface AttributeSort {
  /** 属性名称 */
  attribute: string;
  /** 排序顺序 */
  order: 'asc' | 'desc';
}

/**
 * 属性搜索配置
 */
export interface AttributeSearchConfig {
  /** 搜索关键词 */
  query?: string;
  /** 搜索的属性字段 */
  searchAttributes?: string[];
  /** 过滤器列表 */
  filters: AttributeFilter[];
  /** 排序配置 */
  sort: AttributeSort[];
  /** 分页限制 */
  limit?: number;
  /** 分页偏移 */
  offset?: number;
}

/**
 * 属性统计信息
 */
export interface AttributeStats {
  /** 属性名称 */
  attributeName: string;
  /** 属性类型 */
  type: AttributeType;
  /** 总数 */
  total: number;
  /** 非空值数量 */
  nonEmptyCount: number;
  /** 唯一值数量 */
  uniqueCount: number;
  /** 最小值（数字/日期类型） */
  min?: number | Date;
  /** 最大值（数字/日期类型） */
  max?: number | Date;
  /** 平均值（数字类型） */
  average?: number;
  /** 最常见的值 */
  mostCommon?: AttributeValue;
  /** 值分布（用于图表显示） */
  distribution?: Record<string, number>;
}

/**
 * 属性主接口
 */
export interface Attribute {
  /** 属性唯一标识符 */
  id: ID;
  
  /** 属性名称 */
  name: string;
  
  /** 属性类型 */
  type: AttributeType;
  
  /** 属性值 */
  value: AttributeValue;
  
  /** 属性选项配置 */
  options?: AttributeOptions;
  
  /** 属性验证规则 */
  validation?: AttributeValidation;
  
  /** 属性描述 */
  description?: string;
  
  /** 是否在表格视图中显示 */
  showInTable?: boolean;
  
  /** 是否可搜索 */
  searchable?: boolean;
  
  /** 排序权重 */
  sortOrder?: number;
  
  /** 属性分组 */
  group?: string;
  
  /** 创建时间 */
  createdAt: ISODateString;
  
  /** 最后更新时间 */
  updatedAt: ISODateString;

  // 保持向后兼容
  /** @deprecated 使用 options.choices 替代 */
  enumValues?: string[];
}

/**
 * 属性模板接口
 * 用于快速创建具有预定义属性的对象
 */
export interface AttributeTemplate {
  /** 模板唯一标识符 */
  id: ID;
  
  /** 模板名称 */
  name: string;
  
  /** 模板描述 */
  description?: string;
  
  /** 模板图标 */
  icon?: string;
  
  /** 预定义属性列表 */
  attributes: Omit<Attribute, 'id' | 'value' | 'createdAt' | 'updatedAt'>[];
  
  /** 适用对象类型 */
  appliesTo: ObjectType[] | 'all';
  
  /** 是否为系统模板 */
  isSystem?: boolean;
  
  /** 创建时间 */
  createdAt: ISODateString;
  
  /** 最后更新时间 */
  updatedAt: ISODateString;
}

/**
 * 属性视图配置
 */
export interface AttributeViewConfig {
  /** 视图ID */
  id: ID;
  
  /** 视图名称 */
  name: string;
  
  /** 视图类型 */
  type: 'table' | 'kanban' | 'gallery' | 'chart' | 'timeline';
  
  /** 显示的属性列表 */
  visibleAttributes: string[];
  
  /** 分组依据的属性 */
  groupBy?: string;
  
  /** 排序配置 */
  sortBy?: AttributeSort[];
  
  /** 过滤器配置 */
  filters: AttributeFilter[];
  
  /** 视图特定配置 */
  viewConfig: Record<string, any>;
  
  /** 创建时间 */
  createdAt: ISODateString;
  
  /** 最后更新时间 */
  updatedAt: ISODateString;
} 