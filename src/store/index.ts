/**
 * 状态管理 Store 导出
 * 优化后的模块化状态管理架构
 */

// 核心业务状态
export { useProjectStore } from './projectStore';
export { useViewStore } from './viewStore';
export { useSelectionStore } from './selectionStore';

// UI 状态管理（模块化后）
export { useDialogStore } from './ui/dialogStore';
export { useThemeStore } from './ui/themeStore';
export { useLayoutStore } from './ui/layoutStore';
export { useToastStore } from './ui/toastStore';

// 保持向后兼容的组合UI Store
export { useUIStore } from './uiStore';

// 类型导出
export type { ProjectStore } from './projectStore';
export type { ViewStore } from './viewStore';
export type { SelectionStore } from './selectionStore';

// UI 类型导出
export type { DialogStore } from './ui/dialogStore';
export type { ThemeStore } from './ui/themeStore';
export type { LayoutStore } from './ui/layoutStore';
export type { ToastStore } from './ui/toastStore';

// 组合Hooks（便于迁移）- 这些Hook应该在组件中使用
/*
export const useUI = () => {
  const dialog = useDialogStore();
  const theme = useThemeStore();
  const layout = useLayoutStore();
  const toast = useToastStore();
  
  return {
    dialog,
    theme,
    layout,
    toast,
  };
};

export const useAppState = () => {
  const project = useProjectStore();
  const view = useViewStore();
  const selection = useSelectionStore();
  const ui = useUI();
  
  return {
    project,
    view,
    selection,
    ui,
  };
};
*/ 