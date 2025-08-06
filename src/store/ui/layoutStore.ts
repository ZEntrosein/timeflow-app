import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { LayoutConfig, ViewportInfo, LayoutArea } from '../../types';
import { LAYOUT_AREAS } from '../../constants/views';

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

export interface LayoutStore {
  // 状态
  layoutConfig: LayoutConfig;
  viewport: ViewportInfo;
  zoomLevel: number;
  
  // 布局控制
  updateLayoutConfig: (config: Partial<LayoutConfig>) => void;
  toggleLayoutArea: (area: LayoutArea) => void;
  setSidebarWidth: (width: number) => void;
  setInspectorWidth: (width: number) => void;
  setToolbarHeight: (height: number) => void;
  setContextBarHeight: (height: number) => void;
  resetLayout: () => void;
  
  // 视口控制
  updateViewport: (viewport: Partial<ViewportInfo>) => void;
  centerOnTime: (time: number) => void;
  resetTimelineView: (events?: { startTime: number; endTime?: number }[]) => void;
  setTimeRange: (startTime: number, endTime: number) => void;
  
  // 缩放控制
  setZoomLevel: (level: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  
  // 便捷方法
  toggleSidebar: () => void;
  toggleInspector: () => void;
  isSidebarVisible: () => boolean;
  isInspectorVisible: () => boolean;
  
  // 响应式布局
  adaptToScreenSize: (screenWidth: number, screenHeight: number) => void;
  setCompactMode: (enabled: boolean) => void;
}

export const useLayoutStore = create<LayoutStore>()(
  devtools(
    persist(
      (set, get) => ({
        layoutConfig: defaultLayoutConfig,
        viewport: defaultViewport,
        zoomLevel: 1,

        // 布局控制
        updateLayoutConfig: (config) =>
          set((state) => ({
            layoutConfig: { ...state.layoutConfig, ...config }
          })),

        toggleLayoutArea: (area) =>
          set((state) => ({
            layoutConfig: {
              ...state.layoutConfig,
              visibleAreas: {
                ...state.layoutConfig.visibleAreas,
                [area]: !state.layoutConfig.visibleAreas[area]
              }
            }
          })),

        setSidebarWidth: (width) =>
          set((state) => ({
            layoutConfig: { ...state.layoutConfig, sidebarWidth: Math.max(200, Math.min(600, width)) }
          })),

        setInspectorWidth: (width) =>
          set((state) => ({
            layoutConfig: { ...state.layoutConfig, inspectorWidth: Math.max(250, Math.min(800, width)) }
          })),

        setToolbarHeight: (height) =>
          set((state) => ({
            layoutConfig: { ...state.layoutConfig, toolbarHeight: Math.max(40, Math.min(80, height)) }
          })),

        setContextBarHeight: (height) =>
          set((state) => ({
            layoutConfig: { ...state.layoutConfig, contextBarHeight: Math.max(30, Math.min(60, height)) }
          })),

        resetLayout: () =>
          set({ layoutConfig: defaultLayoutConfig }),

        // 视口控制
        updateViewport: (viewport) =>
          set((state) => ({
            viewport: { ...state.viewport, ...viewport }
          })),

        centerOnTime: (time) => {
          const { viewport } = get();
          const halfRange = viewport.timeRange / 2;
          set({
            viewport: {
              ...viewport,
              centerTime: time,
              startTime: time - halfRange,
              endTime: time + halfRange,
            }
          });
        },

        resetTimelineView: (events) => {
          if (events && events.length > 0) {
            const times = events.flatMap(e => [e.startTime, e.endTime || e.startTime]);
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);
            const padding = (maxTime - minTime) * 0.1; // 10% padding
            
            set({
              viewport: {
                startTime: minTime - padding,
                endTime: maxTime + padding,
                centerTime: (minTime + maxTime) / 2,
                timeRange: (maxTime - minTime) + (padding * 2),
              }
            });
          } else {
            set({ viewport: defaultViewport });
          }
        },

        setTimeRange: (startTime, endTime) =>
          set({
            viewport: {
              startTime,
              endTime,
              centerTime: (startTime + endTime) / 2,
              timeRange: endTime - startTime,
            }
          }),

        // 缩放控制
        setZoomLevel: (level) =>
          set({ zoomLevel: Math.max(0.1, Math.min(10, level)) }),

        zoomIn: () => {
          const { zoomLevel } = get();
          get().setZoomLevel(zoomLevel * 1.2);
        },

        zoomOut: () => {
          const { zoomLevel } = get();
          get().setZoomLevel(zoomLevel / 1.2);
        },

        resetZoom: () =>
          set({ zoomLevel: 1 }),

        // 便捷方法
        toggleSidebar: () =>
          get().toggleLayoutArea(LAYOUT_AREAS.SIDEBAR),

        toggleInspector: () =>
          get().toggleLayoutArea(LAYOUT_AREAS.INSPECTOR),

        isSidebarVisible: () =>
          get().layoutConfig.visibleAreas[LAYOUT_AREAS.SIDEBAR],

        isInspectorVisible: () =>
          get().layoutConfig.visibleAreas[LAYOUT_AREAS.INSPECTOR],

        // 响应式布局
        adaptToScreenSize: (screenWidth, screenHeight) => {
          const { updateLayoutConfig } = get();
          
          // 移动设备适配
          if (screenWidth < 768) {
            updateLayoutConfig({
              sidebarWidth: Math.min(250, screenWidth * 0.8),
              inspectorWidth: Math.min(300, screenWidth * 0.9),
              visibleAreas: {
                ...defaultLayoutConfig.visibleAreas,
                [LAYOUT_AREAS.SIDEBAR]: false, // 默认隐藏侧边栏
              }
            });
          }
          // 平板适配
          else if (screenWidth < 1024) {
            updateLayoutConfig({
              sidebarWidth: 250,
              inspectorWidth: 280,
            });
          }
          // 桌面端恢复默认
          else {
            updateLayoutConfig({
              sidebarWidth: 280,
              inspectorWidth: 320,
            });
          }
        },

        setCompactMode: (enabled) => {
          const { updateLayoutConfig } = get();
          
          if (enabled) {
            updateLayoutConfig({
              sidebarWidth: 200,
              inspectorWidth: 250,
              toolbarHeight: 40,
              contextBarHeight: 32,
            });
          } else {
            updateLayoutConfig(defaultLayoutConfig);
          }
        },
      }),
      {
        name: 'layout-store',
        partialize: (state) => ({
          layoutConfig: state.layoutConfig,
          zoomLevel: state.zoomLevel,
        }),
      }
    ),
    { name: 'layout-store' }
  )
); 