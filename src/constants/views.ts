// 视图类型常量
export const VIEW_TYPES = {
  TIMELINE: 'timeline',
  DATA_TABLE: 'dataTable',
  RELATIONSHIP: 'relationship',
  SPATIAL: 'spatial',
  DIRECTOR: 'director',
  DOCUMENTS: 'documents',
} as const;

export type ViewType = typeof VIEW_TYPES[keyof typeof VIEW_TYPES];

// 检查器面板类型
export const INSPECTOR_PANELS = {
  DATES: 'dates',
  DEPENDENCIES: 'dependencies', 
  RELATIONSHIPS: 'relationships',
  PROPERTIES: 'properties',
  ATTACHMENTS: 'attachments',
} as const;

export type InspectorPanel = typeof INSPECTOR_PANELS[keyof typeof INSPECTOR_PANELS];

// 对象类型常量
export const OBJECT_TYPES = {
  EVENT: 'event',
  OBJECT: 'object',
  PLACE: 'place',
  PERSON: 'person',
  PROJECT: 'project',
  CUSTOM: 'custom',
} as const;

export type ObjectType = typeof OBJECT_TYPES[keyof typeof OBJECT_TYPES];

// 布局区域常量
export const LAYOUT_AREAS = {
  TOOLBAR: 'toolbar',
  SIDEBAR: 'sidebar',
  MAIN_VIEW: 'mainView',
  INSPECTOR: 'inspector',
  CONTEXT_BAR: 'contextBar',
} as const;

export type LayoutArea = typeof LAYOUT_AREAS[keyof typeof LAYOUT_AREAS]; 