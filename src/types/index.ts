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