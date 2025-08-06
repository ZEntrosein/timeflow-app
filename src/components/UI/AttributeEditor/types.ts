/**
 * 属性编辑器通用类型定义
 * 为18种属性编辑器提供统一的接口和基础类型
 */

import { AttributeType, AttributeValue, AttributeOptions, AttributeValidation } from '../../../types/attributes';

/**
 * 编辑器基础接口
 * 所有属性编辑器都应该实现这个接口
 */
export interface BaseEditorProps<T = AttributeValue> {
  /** 属性值 */
  value: T;
  /** 值变更回调 */
  onChange: (value: T) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 占位符文本 */
  placeholder?: string;
  /** CSS类名 */
  className?: string;
  /** 属性选项配置 */
  options?: AttributeOptions;
  /** 验证规则 */
  validation?: AttributeValidation;
  /** 错误信息 */
  error?: string;
  /** 是否显示错误状态 */
  hasError?: boolean;
  /** 焦点回调 */
  onFocus?: () => void;
  /** 失焦回调 */
  onBlur?: () => void;
}

/**
 * 文本编辑器特定属性
 */
export interface TextEditorProps extends BaseEditorProps<string> {
  /** 是否多行 */
  multiline?: boolean;
  /** 行数 */
  rows?: number;
  /** 最大长度 */
  maxLength?: number;
}

/**
 * 数字编辑器特定属性
 */
export interface NumberEditorProps extends BaseEditorProps<number | null> {
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步进值 */
  step?: number;
  /** 小数位数 */
  precision?: number;
}

/**
 * 日期编辑器特定属性
 */
export interface DateEditorProps extends BaseEditorProps<Date | string | null> {
  /** 日期格式 */
  format?: 'date' | 'datetime' | 'time';
  /** 最小日期 */
  minDate?: Date;
  /** 最大日期 */
  maxDate?: Date;
  /** 时区 */
  timezone?: string;
}

/**
 * 布尔值编辑器特定属性
 */
export interface BooleanEditorProps extends BaseEditorProps<boolean> {
  /** 标签文本 */
  label?: string;
  /** 开启状态文本 */
  onText?: string;
  /** 关闭状态文本 */
  offText?: string;
}

/**
 * 列表编辑器特定属性
 */
export interface ListEditorProps extends BaseEditorProps<string[]> {
  /** 最大项目数 */
  maxItems?: number;
  /** 是否允许重复项 */
  allowDuplicates?: boolean;
  /** 项目分隔符 */
  separator?: string;
}

/**
 * 多选编辑器特定属性
 */
export interface MultiSelectEditorProps extends BaseEditorProps<string[]> {
  /** 选项列表 */
  choices: string[];
  /** 是否允许自定义选项 */
  allowCustom?: boolean;
  /** 最大选择数 */
  maxSelections?: number;
  /** 是否可搜索 */
  searchable?: boolean;
}

/**
 * 关系编辑器特定属性
 */
export interface RelationEditorProps extends BaseEditorProps<string | string[]> {
  /** 可关联的对象列表 */
  availableObjects: Array<{ id: string; name: string; type: string }>;
  /** 是否允许多个关联 */
  multiple?: boolean;
  /** 过滤对象类型 */
  filterObjectTypes?: string[];
}

/**
 * 评分编辑器特定属性
 */
export interface RatingEditorProps extends BaseEditorProps<number> {
  /** 最大评分 */
  maxRating?: number;
  /** 评分图标 */
  icon?: string;
  /** 是否允许半星 */
  allowHalf?: boolean;
  /** 是否可清空 */
  clearable?: boolean;
}

/**
 * 进度编辑器特定属性
 */
export interface ProgressEditorProps extends BaseEditorProps<number> {
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 进度条颜色 */
  color?: string;
  /** 是否显示百分比 */
  showPercentage?: boolean;
  /** 是否显示标签 */
  showLabel?: boolean;
}

/**
 * 颜色编辑器特定属性
 */
export interface ColorEditorProps extends BaseEditorProps<string> {
  /** 颜色格式 */
  format?: 'hex' | 'rgb' | 'hsl';
  /** 预设颜色 */
  presetColors?: string[];
  /** 是否支持透明度 */
  allowAlpha?: boolean;
}

/**
 * 货币编辑器特定属性
 */
export interface CurrencyEditorProps extends BaseEditorProps<number | null> {
  /** 货币符号 */
  currency?: string;
  /** 小数位数 */
  precision?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
}

/**
 * 时长编辑器特定属性
 */
export interface DurationEditorProps extends BaseEditorProps<number> {
  /** 显示单位 */
  units?: ('days' | 'hours' | 'minutes' | 'seconds')[];
  /** 最大时长 */
  maxDuration?: number;
  /** 格式化显示 */
  format?: 'compact' | 'full';
}

/**
 * URL编辑器特定属性
 */
export interface URLEditorProps extends BaseEditorProps<string> {
  /** 是否验证URL格式 */
  validateUrl?: boolean;
  /** 是否显示预览 */
  showPreview?: boolean;
  /** 允许的协议 */
  allowedProtocols?: string[];
}

/**
 * 邮箱编辑器特定属性
 */
export interface EmailEditorProps extends BaseEditorProps<string> {
  /** 是否验证邮箱格式 */
  validateEmail?: boolean;
  /** 是否显示发送邮件链接 */
  showMailtoLink?: boolean;
}

/**
 * 电话编辑器特定属性
 */
export interface PhoneEditorProps extends BaseEditorProps<string> {
  /** 国家代码 */
  countryCode?: string;
  /** 电话格式 */
  format?: string;
  /** 是否显示拨号链接 */
  showCallLink?: boolean;
}

/**
 * 文件编辑器特定属性
 */
export interface FileEditorProps extends BaseEditorProps<string | string[]> {
  /** 允许的文件类型 */
  accept?: string;
  /** 是否允许多文件 */
  multiple?: boolean;
  /** 最大文件大小 */
  maxSize?: number;
  /** 上传处理函数 */
  onUpload?: (files: FileList) => Promise<string[]>;
}

/**
 * 位置类型定义
 */
export type LocationValue = { lat: number; lng: number; address?: string } | null;

/**
 * 位置编辑器特定属性
 */
export interface LocationEditorProps extends BaseEditorProps<LocationValue> {
  /** 默认中心点 */
  defaultCenter?: [number, number];
  /** 默认缩放级别 */
  defaultZoom?: number;
  /** 是否显示地址搜索 */
  showAddressSearch?: boolean;
  /** 是否显示地图 */
  showMap?: boolean;
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * 编辑器注册表类型
 */
export type EditorRegistry = {
  [K in AttributeType]: React.ComponentType<BaseEditorProps>;
};

/**
 * 编辑器工厂函数类型
 */
export type EditorFactory = (type: AttributeType, props: BaseEditorProps) => React.ReactElement | null;

/**
 * 属性编辑器配置
 */
export interface AttributeEditorConfig {
  /** 自动聚焦 */
  autoFocus?: boolean;
  /** 显示标签 */
  showLabel?: boolean;
  /** 显示描述 */
  showDescription?: boolean;
  /** 显示验证错误 */
  showValidationErrors?: boolean;
  /** 紧凑模式 */
  compact?: boolean;
  /** 自定义样式类 */
  customClasses?: Record<string, string>;
}

/**
 * 属性编辑器上下文
 */
export interface AttributeEditorContext {
  /** 配置 */
  config: AttributeEditorConfig;
  /** 验证函数 */
  validate: (value: AttributeValue, validation?: AttributeValidation) => ValidationError[];
  /** 格式化函数 */
  format: (value: AttributeValue, type: AttributeType, options?: AttributeOptions) => string;
} 