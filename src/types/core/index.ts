/**
 * 核心基础类型定义
 * 包含项目中最基础的类型和枚举
 */

// 基础ID类型
export type ID = string;
export type Timestamp = number;
export type ISODateString = string;

// 对象类型枚举
export enum ObjectType {
  PERSON = 'person',
  PLACE = 'place',
  PROJECT = 'project',
  EVENT = 'event',
  ORGANIZATION = 'organization',
  CONCEPT = 'concept',
  ARTIFACT = 'artifact',
  CUSTOM = 'custom'
}

// 显示状态
export interface DisplayState {
  visible: boolean;
  locked: boolean;
  highlighted?: boolean;
  opacity?: number;
  color?: string;
}

// 基础实体接口
export interface BaseEntity {
  id: ID;
  name: string;
  description?: string;
  tags?: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

// 基础查询选项
export interface BaseQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

// 基础事件接口（用于系统事件，不是时间轴事件）
export interface SystemEvent {
  type: string;
  timestamp: Timestamp;
  data?: Record<string, any>;
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Timestamp;
}

// 版本信息
export interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  build?: string;
  releaseDate?: ISODateString;
}

// 元数据接口
export interface Metadata {
  version: VersionInfo;
  author?: string;
  lastModified: ISODateString;
  tags?: string[];
  notes?: string;
} 