import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  ViewConfig,
  FilterConfig,
  GroupingConfig,
  ViewType
} from '../types';
import { VIEW_TYPES } from '../constants/views';

// 默认的视图配置
const createDefaultViewConfig = (type: ViewType): ViewConfig => ({
  type,
  config: {},
  filters: [],
  grouping: undefined,
});

// 预设的默认视图配置
const defaultViewConfigs: Record<ViewType, ViewConfig> = {
  [VIEW_TYPES.TIMELINE]: {
    type: VIEW_TYPES.TIMELINE,
    config: {
      showGrid: true,
      snapToGrid: true,
      gridInterval: 100,
      showEventDetails: true,
      compactMode: false,
      trackHeight: 60,
    },
    filters: [],
    grouping: {
      field: 'objectId',
      type: 'object',
      expanded: true,
    },
  },
  [VIEW_TYPES.DATA_TABLE]: {
    type: VIEW_TYPES.DATA_TABLE,
    config: {
      pageSize: 50,
      showPagination: true,
      sortable: true,
      resizable: true,
      columns: ['name', 'type', 'createdAt', 'updatedAt'],
    },
    filters: [],
  },
  [VIEW_TYPES.RELATIONSHIP]: {
    type: VIEW_TYPES.RELATIONSHIP,
    config: {
      layoutAlgorithm: 'force',
      nodeSize: 'auto',
      showLabels: true,
      linkStrength: 0.5,
      repelForce: -100,
    },
    filters: [],
  },
  [VIEW_TYPES.SPATIAL]: {
    type: VIEW_TYPES.SPATIAL,
    config: {
      mapType: '2d',
      showCoordinates: false,
      zoomLevel: 1,
      centerX: 0,
      centerY: 0,
    },
    filters: [],
  },
  [VIEW_TYPES.DIRECTOR]: {
    type: VIEW_TYPES.DIRECTOR,
    config: {
      sequenceMode: 'linear',
      showTimecode: true,
      autoPlay: false,
      playbackSpeed: 1,
    },
    filters: [],
  },
};

export interface ViewStore {
  // 视图配置
  viewConfigs: Record<ViewType, ViewConfig>;
  
  // 当前视图的过滤器和搜索
  activeFilters: Record<ViewType, FilterConfig[]>;
  searchQuery: string;
  
  // 视图配置管理
  getViewConfig: (viewType: ViewType) => ViewConfig;
  updateViewConfig: (viewType: ViewType, config: Partial<ViewConfig>) => void;
  resetViewConfig: (viewType: ViewType) => void;
  resetAllViewConfigs: () => void;
  
  // 过滤器管理
  addFilter: (viewType: ViewType, filter: FilterConfig) => void;
  updateFilter: (viewType: ViewType, filterId: string, updates: Partial<FilterConfig>) => void;
  removeFilter: (viewType: ViewType, filterId: string) => void;
  clearFilters: (viewType: ViewType) => void;
  toggleFilter: (viewType: ViewType, filterId: string) => void;
  getActiveFilters: (viewType: ViewType) => FilterConfig[];
  
  // 分组管理
  setGrouping: (viewType: ViewType, grouping: GroupingConfig | undefined) => void;
  toggleGroupExpansion: (viewType: ViewType) => void;
  
  // 搜索管理
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  
  // 工具函数
  generateFilterId: () => string;
  exportViewConfig: (viewType: ViewType) => string;
  importViewConfig: (viewType: ViewType, configJson: string) => boolean;
}

export const useViewStore = create<ViewStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      viewConfigs: { ...defaultViewConfigs },
      activeFilters: {
        [VIEW_TYPES.TIMELINE]: [],
        [VIEW_TYPES.DATA_TABLE]: [],
        [VIEW_TYPES.RELATIONSHIP]: [],
        [VIEW_TYPES.SPATIAL]: [],
        [VIEW_TYPES.DIRECTOR]: [],
      },
      searchQuery: '',
      
      // 视图配置管理
      getViewConfig: (viewType) => {
        const state = get();
        return state.viewConfigs[viewType] || createDefaultViewConfig(viewType);
      },
      
      updateViewConfig: (viewType, configUpdates) => {
        set((state) => ({
          viewConfigs: {
            ...state.viewConfigs,
            [viewType]: {
              ...state.viewConfigs[viewType],
              ...configUpdates,
              config: {
                ...state.viewConfigs[viewType]?.config,
                ...(configUpdates.config || {}),
              },
            },
          },
        }));
      },
      
      resetViewConfig: (viewType) => {
        set((state) => ({
          viewConfigs: {
            ...state.viewConfigs,
            [viewType]: { ...defaultViewConfigs[viewType] },
          },
        }));
      },
      
      resetAllViewConfigs: () => {
        set({ viewConfigs: { ...defaultViewConfigs } });
      },
      
      // 过滤器管理
      addFilter: (viewType, filter) => {
        set((state) => {
          const currentFilters = state.viewConfigs[viewType]?.filters || [];
          const updatedFilters = [...currentFilters, filter];
          
          return {
            viewConfigs: {
              ...state.viewConfigs,
              [viewType]: {
                ...state.viewConfigs[viewType],
                filters: updatedFilters,
              },
            },
            activeFilters: {
              ...state.activeFilters,
              [viewType]: updatedFilters.filter(f => f.enabled),
            },
          };
        });
      },
      
      updateFilter: (viewType, filterId, updates) => {
        set((state) => {
          const currentFilters = state.viewConfigs[viewType]?.filters || [];
          const updatedFilters = currentFilters.map(filter =>
            filter.id === filterId ? { ...filter, ...updates } : filter
          );
          
          return {
            viewConfigs: {
              ...state.viewConfigs,
              [viewType]: {
                ...state.viewConfigs[viewType],
                filters: updatedFilters,
              },
            },
            activeFilters: {
              ...state.activeFilters,
              [viewType]: updatedFilters.filter(f => f.enabled),
            },
          };
        });
      },
      
      removeFilter: (viewType, filterId) => {
        set((state) => {
          const currentFilters = state.viewConfigs[viewType]?.filters || [];
          const updatedFilters = currentFilters.filter(filter => filter.id !== filterId);
          
          return {
            viewConfigs: {
              ...state.viewConfigs,
              [viewType]: {
                ...state.viewConfigs[viewType],
                filters: updatedFilters,
              },
            },
            activeFilters: {
              ...state.activeFilters,
              [viewType]: updatedFilters.filter(f => f.enabled),
            },
          };
        });
      },
      
      clearFilters: (viewType) => {
        set((state) => ({
          viewConfigs: {
            ...state.viewConfigs,
            [viewType]: {
              ...state.viewConfigs[viewType],
              filters: [],
            },
          },
          activeFilters: {
            ...state.activeFilters,
            [viewType]: [],
          },
        }));
      },
      
      toggleFilter: (viewType, filterId) => {
        const state = get();
        const currentFilters = state.viewConfigs[viewType]?.filters || [];
        const filterToToggle = currentFilters.find(f => f.id === filterId);
        
        if (filterToToggle) {
          state.updateFilter(viewType, filterId, { enabled: !filterToToggle.enabled });
        }
      },
      
      getActiveFilters: (viewType) => {
        const state = get();
        return state.activeFilters[viewType] || [];
      },
      
      // 分组管理
      setGrouping: (viewType, grouping) => {
        set((state) => ({
          viewConfigs: {
            ...state.viewConfigs,
            [viewType]: {
              ...state.viewConfigs[viewType],
              grouping,
            },
          },
        }));
      },
      
      toggleGroupExpansion: (viewType) => {
        set((state) => {
          const currentGrouping = state.viewConfigs[viewType]?.grouping;
          if (!currentGrouping) return state;
          
          return {
            viewConfigs: {
              ...state.viewConfigs,
              [viewType]: {
                ...state.viewConfigs[viewType],
                grouping: {
                  ...currentGrouping,
                  expanded: !currentGrouping.expanded,
                },
              },
            },
          };
        });
      },
      
      // 搜索管理
      setSearchQuery: (query) => set({ searchQuery: query }),
      clearSearch: () => set({ searchQuery: '' }),
      
      // 工具函数
      generateFilterId: () => {
        return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      },
      
      exportViewConfig: (viewType) => {
        const state = get();
        const config = state.viewConfigs[viewType];
        return JSON.stringify(config, null, 2);
      },
      
      importViewConfig: (viewType, configJson) => {
        try {
          const config = JSON.parse(configJson) as ViewConfig;
          
          // 基本验证
          if (!config.type || config.type !== viewType) {
            console.error('Invalid view config: type mismatch');
            return false;
          }
          
          set((state) => ({
            viewConfigs: {
              ...state.viewConfigs,
              [viewType]: config,
            },
            activeFilters: {
              ...state.activeFilters,
              [viewType]: config.filters?.filter(f => f.enabled) || [],
            },
          }));
          
          return true;
        } catch (error) {
          console.error('Failed to import view config:', error);
          return false;
        }
      },
    }),
    {
      name: 'view-store',
    }
  )
); 