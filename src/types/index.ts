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
  /** 正则表达式验证 */
  pattern?: string;
  /** 自定义验证函数 */
  custom?: (value: AttributeValue) => boolean | string;
}

/**
 * 属性选项配置
 */
export interface AttributeOptions {
  /** 多选/枚举类型的选项列表 */
  choices?: string[];
  /** 是否允许自定义值 */
  allowCustom?: boolean;
  /** 默认选中的选项 */
  defaultSelected?: string[];
  /** 关系类型的目标对象类型 */
  relationTarget?: string;
  /** 数字类型的步长 */
  step?: number;
  /** 日期类型的格式 */
  dateFormat?: string;
  /** 文件类型的允许扩展名 */
  allowedExtensions?: string[];
  /** 评分类型的最大值 */
  maxRating?: number;
  /** 进度类型的单位 */
  progressUnit?: string;
  /** 货币类型的币种 */
  currency?: string;
}

/**
 * 属性接口定义
 * 描述世界对象的各种属性，支持丰富的数据类型和验证
 */
export interface Attribute {
  /** 属性唯一标识符 */
  id: string;
  
  /** 属性名称 */
  name: string;
  
  /** 属性类型 */
  type: AttributeType;
  
  /** 属性当前值 */
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
  createdAt: string;
  
  /** 最后更新时间 */
  updatedAt: string;

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
  id: string;
  
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
  createdAt: string;
  
  /** 最后更新时间 */
  updatedAt: string;
}

/**
 * 属性视图配置
 */
export interface AttributeViewConfig {
  /** 视图ID */
  id: string;
  
  /** 视图名称 */
  name: string;
  
  /** 视图类型 */
  type: 'table' | 'kanban' | 'gallery' | 'chart' | 'timeline';
  
  /** 显示的属性列表 */
  visibleAttributes: string[];
  
  /** 分组依据的属性 */
  groupBy?: string;
  
  /** 排序配置 */
  sortBy?: {
    attribute: string;
    order: 'asc' | 'desc';
  }[];
  
  /** 过滤器配置 */
  filters: AttributeFilter[];
  
  /** 视图特定配置 */
  viewConfig: Record<string, any>;
  
  /** 创建时间 */
  createdAt: string;
  
  /** 最后更新时间 */
  updatedAt: string;
}

/**
 * 属性过滤器
 */
export interface AttributeFilter {
  /** 过滤器ID */
  id: string;
  
  /** 属性名称 */
  attribute: string;
  
  /** 操作符 */
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 
           'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'between' | 
           'in' | 'not_in' | 'is_empty' | 'is_not_empty' | 'is_true' | 'is_false';
  
  /** 过滤值 */
  value: AttributeValue | AttributeValue[];
  
  /** 是否启用 */
  enabled: boolean;
}

/**
 * 属性搜索配置
 */
export interface AttributeSearchConfig {
  /** 搜索查询 */
  query: string;
  
  /** 搜索的属性列表 */
  searchAttributes: string[];
  
  /** 过滤器 */
  filters: AttributeFilter[];
  
  /** 排序配置 */
  sort: {
    attribute: string;
    order: 'asc' | 'desc';
  }[];
  
  /** 分组配置 */
  groupBy?: string;
  
  /** 结果限制 */
  limit?: number;
  
  /** 偏移量 */
  offset?: number;
}

/**
 * 属性统计信息
 */
export interface AttributeStats {
  /** 属性ID */
  attributeId: string;
  
  /** 总数 */
  total: number;
  
  /** 非空值数量 */
  nonEmpty: number;
  
  /** 唯一值数量 */
  unique: number;
  
  /** 最小值（数字/日期） */
  min?: number | Date;
  
  /** 最大值（数字/日期） */
  max?: number | Date;
  
  /** 平均值（数字） */
  average?: number;
  
  /** 值分布 */
  distribution: Record<string, number>;
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
  
  /** 对象标签 */
  tags?: string[];
  
  /** 创建时间 */
  createdAt: string;
  
  /** 最后更新时间 */
  updatedAt: string;
  
  /** 对象状态 */
  state?: DisplayState;
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
 * 时间轴事件接口
 * 用于时间轴视图中显示的事件
 */
export interface TimelineEvent {
  /** 事件唯一标识符 */
  id: string;
  
  /** 事件标题 */
  title: string;
  
  /** 事件描述 */
  description?: string;
  
  /** 事件开始时间 */
  startTime: number;
  
  /** 事件结束时间（可选，用于持续性事件） */
  endTime?: number;
  
  /** 事件类型/分类 */
  category?: string;
  
  /** 参与者列表 */
  participants?: string[];
  
  /** 事件发生地点 */
  location?: string;
  
  /** 事件标签 */
  tags?: string[];
  
  /** 事件属性 */
  attributes?: Attribute[];
  
  /** 创建时间 */
  createdAt: string;
  
  /** 最后更新时间 */
  updatedAt: string;
  
  /** 事件状态 */
  state?: DisplayState;
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
  events: TimelineEvent[];
  
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
 * 对象显示状态
 */
export interface DisplayState {
  /** 是否可见 */
  visible: boolean;
  
  /** 是否锁定 */
  locked: boolean;
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

// ==================== 界面相关类型定义 ====================

// 导入和重新导出类型
import type { ViewType, InspectorPanel, ObjectType, LayoutArea } from '../constants/views';
import type { ToastMessage } from '../components/UI/Toast';
export type { ViewType, InspectorPanel, ObjectType, LayoutArea };

/**
 * 应用界面状态
 */
export interface UIState {
  /** 当前活跃的视图 */
  currentView: ViewType;
  
  /** 检查器面板的显示状态 */
  inspectorVisible: boolean;
  
  /** 当前活跃的检查器面板 */
  activeInspectorPanel: InspectorPanel;
  
  /** 侧边栏显示状态 */
  sidebarVisible: boolean;
  
  /** 当前选中的对象/事件ID列表 */
  selectedItems: string[];
  
  /** 布局配置 */
  layoutConfig: LayoutConfig;
  
  /** 缩放级别 */
  zoomLevel: number;
  
  /** 时间轴视口信息 */
  viewport: ViewportInfo;
  
  /** 当前主题 */
  currentTheme: string;
  
  /** 对话框状态 */
  dialogs: {
    addEvent: boolean;
    addObject: boolean;
    editEvent: boolean;
    editObject: boolean;
    objectList: boolean;
  };
  
  /** 编辑状态 */
  editingEventId?: string;
  editingObjectId?: string;
  
  /** 对象列表状态 */
  selectedObjectType?: string;
  
  /** 上下文菜单状态 */
  contextMenu: {
    isOpen: boolean;
    position: { x: number; y: number };
    targetType?: 'event' | 'object' | 'canvas';
    targetId?: string;
  };
  
  /** Toast通知列表 */
  toasts: ToastMessage[];
}

/**
 * 布局配置
 */
export interface LayoutConfig {
  /** 侧边栏宽度 */
  sidebarWidth: number;
  
  /** 检查器面板宽度 */
  inspectorWidth: number;
  
  /** 工具栏高度 */
  toolbarHeight: number;
  
  /** 上下文导航栏高度 */
  contextBarHeight: number;
  
  /** 各区域的显示状态 */
  visibleAreas: Record<LayoutArea, boolean>;
}

/**
 * 视口信息
 */
export interface ViewportInfo {
  /** 视口开始时间 */
  startTime: number;
  
  /** 视口结束时间 */
  endTime: number;
  
  /** 视口中心时间 */
  centerTime: number;
  
  /** 时间范围 */
  timeRange: number;
}

/**
 * 视图配置
 */
export interface ViewConfig {
  /** 视图类型 */
  type: ViewType;
  
  /** 视图特定的配置 */
  config: Record<string, any>;
  
  /** 过滤器配置 */
  filters: FilterConfig[];
  
  /** 分组配置 */
  grouping?: GroupingConfig;
}

/**
 * 过滤器配置
 */
export interface FilterConfig {
  /** 过滤器ID */
  id: string;
  
  /** 过滤器类型 */
  type: 'object' | 'attribute' | 'time' | 'custom';
  
  /** 过滤器名称 */
  name: string;
  
  /** 过滤条件 */
  conditions: FilterCondition[];
  
  /** 是否启用 */
  enabled: boolean;
}

/**
 * 过滤条件
 */
export interface FilterCondition {
  /** 字段名 */
  field: string;
  
  /** 操作符 */
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  
  /** 值 */
  value: any;
}

/**
 * 分组配置
 */
export interface GroupingConfig {
  /** 分组字段 */
  field: string;
  
  /** 分组类型 */
  type: 'object' | 'attribute' | 'time';
  
  /** 是否展开 */
  expanded: boolean;
  
  /** 子分组 */
  subGrouping?: GroupingConfig;
}

/**
 * 工具栏操作
 */
export interface ToolbarAction {
  /** 操作ID */
  id: string;
  
  /** 操作名称 */
  name: string;
  
  /** 图标 */
  icon: string;
  
  /** 操作类型 */
  type: 'button' | 'toggle' | 'dropdown' | 'separator';
  
  /** 点击处理函数 */
  onClick?: () => void;
  
  /** 是否禁用 */
  disabled?: boolean;
  
  /** 是否选中（toggle类型） */
  checked?: boolean;
  
  /** 下拉选项（dropdown类型） */
  options?: ToolbarDropdownOption[];
}

/**
 * 工具栏下拉选项
 */
export interface ToolbarDropdownOption {
  /** 选项ID */
  id: string;
  
  /** 选项名称 */
  name: string;
  
  /** 选项图标 */
  icon?: string;
  
  /** 点击处理函数 */
  onClick: () => void;
}

/**
 * 上下文菜单项
 */
export interface ContextMenuItem {
  /** 菜单项ID */
  id: string;
  
  /** 菜单项名称 */
  name: string;
  
  /** 菜单项图标 */
  icon?: string;
  
  /** 点击处理函数 */
  onClick: () => void;
  
  /** 是否禁用 */
  disabled?: boolean;
  
  /** 子菜单项 */
  children?: ContextMenuItem[];
}

/**
 * 选择状态
 */
export interface SelectionState {
  /** 选中的项目 */
  items: SelectedItem[];
  
  /** 选择模式 */
  mode: 'single' | 'multiple' | 'range';
  
  /** 最后选中的项目 */
  lastSelected?: string;
}

/**
 * 选中的项目
 */
export interface SelectedItem {
  /** 项目ID */
  id: string;
  
  /** 项目类型 */
  type: ObjectType | 'event';
  
  /** 选中时间 */
  selectedAt: number;
}