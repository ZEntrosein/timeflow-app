import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  UIState, 
  LayoutConfig, 
  ViewportInfo,
  ViewType,
  InspectorPanel,
  LayoutArea
} from '../types';
import { VIEW_TYPES, INSPECTOR_PANELS, LAYOUT_AREAS } from '../constants/views';
import { themes, ThemeName, type Theme } from '../constants/themes';
import { ToastMessage } from '../components/UI/Toast';

// 默认布局配置
const defaultLayoutConfig: LayoutConfig = {
  sidebarWidth: 280,
  inspectorWidth: 320,
  toolbarHeight: 48,
  contextBarHeight: 40,
  visibleAreas: {
    [LAYOUT_AREAS.TOOLBAR]: true,
    [LAYOUT_AREAS.SIDEBAR]: true,
    [LAYOUT_AREAS.MAIN_VIEW]: true,
    [LAYOUT_AREAS.INSPECTOR]: true,
    [LAYOUT_AREAS.CONTEXT_BAR]: true,
  },
};

// 默认视口信息
const defaultViewport: ViewportInfo = {
  startTime: 0,
  endTime: 1000,
  centerTime: 500,
  timeRange: 1000,
};

// 默认UI状态
const defaultUIState: UIState = {
  currentView: VIEW_TYPES.TIMELINE,
  inspectorVisible: true,
  activeInspectorPanel: INSPECTOR_PANELS.PROPERTIES,
  sidebarVisible: true,
  selectedItems: [],
  layoutConfig: defaultLayoutConfig,
  zoomLevel: 1,
  viewport: defaultViewport,
  currentTheme: 'light',
  dialogs: {
    addEvent: false,
    addObject: false,
    editEvent: false,
    editObject: false,
    objectList: false,
  },
  editingEventId: undefined,
  editingObjectId: undefined,
  selectedObjectType: undefined,
  contextMenu: {
    isOpen: false,
    position: { x: 0, y: 0 },
    targetType: undefined,
    targetId: undefined,
  },
  toasts: [],
};

export interface UIStore extends UIState {
  // 视图切换
  setCurrentView: (view: ViewType) => void;
  
  // 主题管理
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  getCurrentTheme: () => Theme;
  
  // 对话框管理
  openAddEventDialog: () => void;
  closeAddEventDialog: () => void;
  openAddObjectDialog: () => void;
  closeAddObjectDialog: () => void;
  openEditEventDialog: (eventId: string) => void;
  closeEditEventDialog: () => void;
  openEditObjectDialog: (objectId: string) => void;
  closeEditObjectDialog: () => void;
  openObjectListDialog: (objectType: string) => void;
  closeObjectListDialog: () => void;
  
  // 上下文菜单管理
  openContextMenu: (position: { x: number; y: number }, targetType: 'event' | 'object' | 'canvas', targetId?: string) => void;
  closeContextMenu: () => void;
  
  // 检查器面板控制
  toggleInspector: () => void;
  setInspectorVisible: (visible: boolean) => void;
  setActiveInspectorPanel: (panel: InspectorPanel) => void;
  
  // 侧边栏控制
  toggleSidebar: () => void;
  setSidebarVisible: (visible: boolean) => void;
  
  // 选择控制
  setSelectedItems: (items: string[]) => void;
  addSelectedItem: (itemId: string) => void;
  removeSelectedItem: (itemId: string) => void;
  clearSelection: () => void;
  
  // 布局控制
  updateLayoutConfig: (config: Partial<LayoutConfig>) => void;
  toggleLayoutArea: (area: LayoutArea) => void;
  setSidebarWidth: (width: number) => void;
  setInspectorWidth: (width: number) => void;
  
  // 缩放和视口控制
  setZoomLevel: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  updateViewport: (viewport: Partial<ViewportInfo>) => void;
  centerOnTime: (time: number) => void;
  resetTimelineView: (events?: { startTime: number; endTime?: number }[]) => void;
  
  // 重置功能
  resetUI: () => void;

  // Toast 通知系统
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      ...defaultUIState,
      
      // 视图切换
      setCurrentView: (view) => set({ currentView: view }),
      
      // 主题管理
      setTheme: (theme) => {
        set({ currentTheme: theme });
        // 更新HTML根元素的class
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      toggleTheme: () => {
        const currentTheme = get().currentTheme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        // 更新状态
        set({ currentTheme: newTheme });
        // 更新HTML根元素的class
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      getCurrentTheme: () => themes[get().currentTheme as ThemeName],
      
      // 对话框管理
      openAddEventDialog: () => set((state) => ({
        dialogs: { ...state.dialogs, addEvent: true }
      })),
      closeAddEventDialog: () => set((state) => ({
        dialogs: { ...state.dialogs, addEvent: false }
      })),
      openAddObjectDialog: () => set((state) => ({
        dialogs: { ...state.dialogs, addObject: true }
      })),
      closeAddObjectDialog: () => set((state) => ({
        dialogs: { ...state.dialogs, addObject: false }
      })),
      openEditEventDialog: (eventId) => set((state) => ({
        dialogs: { ...state.dialogs, editEvent: true },
        editingEventId: eventId
      })),
      closeEditEventDialog: () => set((state) => ({
        dialogs: { ...state.dialogs, editEvent: false },
        editingEventId: undefined
      })),
      openEditObjectDialog: (objectId) => set((state) => ({
        dialogs: { ...state.dialogs, editObject: true },
        editingObjectId: objectId
      })),
      closeEditObjectDialog: () => set((state) => ({
        dialogs: { ...state.dialogs, editObject: false },
        editingObjectId: undefined
      })),

      // 对象列表弹窗管理
      openObjectListDialog: (objectType) => set((state) => ({
        dialogs: { ...state.dialogs, objectList: true },
        selectedObjectType: objectType
      })),
      closeObjectListDialog: () => set((state) => ({
        dialogs: { ...state.dialogs, objectList: false },
        selectedObjectType: undefined
      })),
      
      // 上下文菜单管理
      openContextMenu: (position, targetType, targetId) => set({
        contextMenu: {
          isOpen: true,
          position,
          targetType,
          targetId
        }
      }),
      closeContextMenu: () => set({
        contextMenu: {
          isOpen: false,
          position: { x: 0, y: 0 },
          targetType: undefined,
          targetId: undefined
        }
      }),
      
      // 检查器面板控制
      toggleInspector: () => set((state) => ({ 
        inspectorVisible: !state.inspectorVisible 
      })),
      
      setInspectorVisible: (visible) => set({ inspectorVisible: visible }),
      
      setActiveInspectorPanel: (panel) => set({ 
        activeInspectorPanel: panel,
        inspectorVisible: true 
      }),
      
      // 侧边栏控制
      toggleSidebar: () => set((state) => ({ 
        sidebarVisible: !state.sidebarVisible 
      })),
      
      setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
      
      // 选择控制
      setSelectedItems: (items) => set({ selectedItems: items }),
      
      addSelectedItem: (itemId) => set((state) => ({
        selectedItems: state.selectedItems.includes(itemId) 
          ? state.selectedItems 
          : [...state.selectedItems, itemId]
      })),
      
      removeSelectedItem: (itemId) => set((state) => ({
        selectedItems: state.selectedItems.filter(id => id !== itemId)
      })),
      
      clearSelection: () => set({ selectedItems: [] }),
      
      // 布局控制
      updateLayoutConfig: (config) => set((state) => ({
        layoutConfig: { ...state.layoutConfig, ...config }
      })),
      
      toggleLayoutArea: (area) => set((state) => ({
        layoutConfig: {
          ...state.layoutConfig,
          visibleAreas: {
            ...state.layoutConfig.visibleAreas,
            [area as string]: !state.layoutConfig.visibleAreas[area]
          }
        }
      })),
      
      setSidebarWidth: (width) => set((state) => ({
        layoutConfig: { ...state.layoutConfig, sidebarWidth: width }
      })),
      
      setInspectorWidth: (width) => set((state) => ({
        layoutConfig: { ...state.layoutConfig, inspectorWidth: width }
      })),
      
      // 缩放和视口控制
      setZoomLevel: (level) => set({ zoomLevel: level }),
      zoomIn: () => set((state) => {
        const newZoomLevel = Math.min(state.zoomLevel * 1.2, 5);
        
        // 同时更新viewport以实现真正的缩放效果
        const currentTimeRange = state.viewport.endTime - state.viewport.startTime;
        const newTimeRange = currentTimeRange / 1.2; // 缩小时间范围来放大视图
        const centerTime = state.viewport.centerTime || (state.viewport.startTime + state.viewport.endTime) / 2;
        const newStartTime = centerTime - newTimeRange / 2;
        const newEndTime = centerTime + newTimeRange / 2;
        
        return {
          zoomLevel: newZoomLevel,
          viewport: {
            ...state.viewport,
            startTime: newStartTime,
            endTime: newEndTime,
            centerTime: centerTime,
            timeRange: newTimeRange,
          }
        };
      }),
      zoomOut: () => set((state) => {
        const newZoomLevel = Math.max(state.zoomLevel / 1.2, 0.1);
        
        // 同时更新viewport以实现真正的缩放效果
        const currentTimeRange = state.viewport.endTime - state.viewport.startTime;
        const newTimeRange = currentTimeRange * 1.2; // 扩大时间范围来缩小视图
        const centerTime = state.viewport.centerTime || (state.viewport.startTime + state.viewport.endTime) / 2;
        const newStartTime = centerTime - newTimeRange / 2;
        const newEndTime = centerTime + newTimeRange / 2;
        
        return {
          zoomLevel: newZoomLevel,
          viewport: {
            ...state.viewport,
            startTime: newStartTime,
            endTime: newEndTime,
            centerTime: centerTime,
            timeRange: newTimeRange,
          }
        };
      }),
      updateViewport: (viewport) => set((state) => {
        const newViewport = { ...state.viewport, ...viewport };
        
        // 确保 timeRange 和其他字段保持一致
        if (newViewport.startTime !== undefined && newViewport.endTime !== undefined) {
          newViewport.timeRange = newViewport.endTime - newViewport.startTime;
          newViewport.centerTime = (newViewport.startTime + newViewport.endTime) / 2;
        } else if (newViewport.centerTime !== undefined && newViewport.timeRange !== undefined) {
          newViewport.startTime = newViewport.centerTime - newViewport.timeRange / 2;
          newViewport.endTime = newViewport.centerTime + newViewport.timeRange / 2;
        }
        
        // 调试信息（开发环境）
        if (process.env.NODE_ENV === 'development') {
          console.log('Viewport updated:', {
            startTime: newViewport.startTime,
            endTime: newViewport.endTime,
            centerTime: newViewport.centerTime,
            timeRange: newViewport.timeRange,
            calculated: {
              timeRange: newViewport.endTime - newViewport.startTime,
              centerTime: (newViewport.startTime + newViewport.endTime) / 2
            }
          });
        }
        
        return { viewport: newViewport };
      }),
      centerOnTime: (time) => set((state) => {
        const halfRange = state.viewport.timeRange / 2;
        
        return {
          viewport: {
            ...state.viewport,
            centerTime: time,
            startTime: time - halfRange,
            endTime: time + halfRange
          }
        };
      }),
      resetTimelineView: (events) => {
        if (events && events.length > 0) {
          const allStartTimes = events.map(e => e.startTime);
          const allEndTimes = events.map(e => e.endTime || e.startTime);
          
          const minTime = Math.min(...allStartTimes);
          const maxTime = Math.max(...allEndTimes);
          const padding = (maxTime - minTime) * 0.1; // 10% 边距
          
          set((state) => ({
            viewport: {
              ...state.viewport,
              startTime: minTime - padding,
              endTime: maxTime + padding,
              centerTime: (minTime + maxTime) / 2,
              timeRange: maxTime - minTime + 2 * padding,
            }
          }));
        } else {
          // 默认重置到初始视口
          set((state) => ({
            viewport: {
              ...state.viewport,
              ...defaultViewport,
            }
          }));
        }
      },
      
      // 重置功能
      resetUI: () => set(defaultUIState),

      // Toast 通知系统
      addToast: (toast) => {
        const newToast: ToastMessage = {
          ...toast,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        set((state) => ({
          toasts: [...state.toasts, newToast],
        }));
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      },

      clearToasts: () => {
        set({ toasts: [] });
      },
    }),
    {
      name: 'ui-store',
    }
  )
); 