import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  SelectionState,
  SelectedItem,
  ObjectType
} from '../types';

export interface SelectionStore extends SelectionState {
  // 选择操作
  selectItem: (id: string, type: ObjectType | 'event', multiSelect?: boolean) => void;
  selectItems: (items: Array<{ id: string; type: ObjectType | 'event' }>) => void;
  deselectItem: (id: string) => void;
  deselectItems: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: (items: Array<{ id: string; type: ObjectType | 'event' }>) => void;
  
  // 范围选择
  selectRange: (fromId: string, toId: string, allItems: Array<{ id: string; type: ObjectType | 'event' }>) => void;
  
  // 选择模式管理
  setSelectionMode: (mode: 'single' | 'multiple' | 'range') => void;
  
  // 查询方法
  isSelected: (id: string) => boolean;
  getSelectedIds: () => string[];
  getSelectedItems: () => SelectedItem[];
  getSelectedItemsByType: (type: ObjectType | 'event') => SelectedItem[];
  getSelectionCount: () => number;
  hasSelection: () => boolean;
  
  // 选择状态操作
  invertSelection: (allItems: Array<{ id: string; type: ObjectType | 'event' }>) => void;
  selectByType: (type: ObjectType | 'event', allItems: Array<{ id: string; type: ObjectType | 'event' }>) => void;
  
  // 历史和撤销（可选功能）
  canUndo: () => boolean;
  undo: () => void;
  
  // 工具函数
  exportSelection: () => string;
  importSelection: (selectionJson: string) => boolean;
}

// 选择历史管理（最多保存10个历史状态）
interface SelectionHistory {
  states: SelectionState[];
  currentIndex: number;
  maxHistory: number;
}

const createDefaultSelectionState = (): SelectionState => ({
  items: [],
  mode: 'multiple',
  lastSelected: undefined,
});

const createDefaultHistory = (): SelectionHistory => ({
  states: [createDefaultSelectionState()],
  currentIndex: 0,
  maxHistory: 10,
});

export const useSelectionStore = create<SelectionStore>()(
  devtools(
    (set, get) => {
      // 内部历史状态
      let history: SelectionHistory = createDefaultHistory();
      
      // 保存状态到历史
      const saveToHistory = (state: SelectionState) => {
        // 移除当前索引之后的历史
        history.states = history.states.slice(0, history.currentIndex + 1);
        
        // 添加新状态
        history.states.push({ ...state });
        
        // 限制历史长度
        if (history.states.length > history.maxHistory) {
          history.states = history.states.slice(-history.maxHistory);
        }
        
        history.currentIndex = history.states.length - 1;
      };
      
      return {
        // 初始状态
        ...createDefaultSelectionState(),
        
        // 选择操作
        selectItem: (id, type, multiSelect = false) => {
          set((state) => {
            const isAlreadySelected = state.items.some(item => item.id === id);
            
            let newItems: SelectedItem[];
            
            if (state.mode === 'single' || !multiSelect) {
              // 单选模式或非多选操作
              if (isAlreadySelected && state.items.length === 1) {
                // 如果只有一个选中项且是当前项，则取消选择
                newItems = [];
              } else {
                newItems = [{
                  id,
                  type,
                  selectedAt: Date.now(),
                }];
              }
            } else {
              // 多选模式
              if (isAlreadySelected) {
                // 取消选择
                newItems = state.items.filter(item => item.id !== id);
              } else {
                // 添加选择
                newItems = [...state.items, {
                  id,
                  type,
                  selectedAt: Date.now(),
                }];
              }
            }
            
            const newState = {
              ...state,
              items: newItems,
              lastSelected: newItems.length > 0 ? id : undefined,
            };
            
            saveToHistory(newState);
            return newState;
          });
        },
        
        selectItems: (items) => {
          set((state) => {
            const newItems: SelectedItem[] = items.map(item => ({
              id: item.id,
              type: item.type,
              selectedAt: Date.now(),
            }));
            
            const newState = {
              ...state,
              items: newItems,
              lastSelected: newItems.length > 0 ? newItems[newItems.length - 1].id : undefined,
            };
            
            saveToHistory(newState);
            return newState;
          });
        },
        
        deselectItem: (id) => {
          set((state) => {
            const newItems = state.items.filter(item => item.id !== id);
            const newState = {
              ...state,
              items: newItems,
              lastSelected: newItems.length > 0 ? newItems[newItems.length - 1].id : undefined,
            };
            
            saveToHistory(newState);
            return newState;
          });
        },
        
        deselectItems: (ids) => {
          set((state) => {
            const idsSet = new Set(ids);
            const newItems = state.items.filter(item => !idsSet.has(item.id));
            const newState = {
              ...state,
              items: newItems,
              lastSelected: newItems.length > 0 ? newItems[newItems.length - 1].id : undefined,
            };
            
            saveToHistory(newState);
            return newState;
          });
        },
        
        clearSelection: () => {
          set((state) => {
            const newState = {
              ...state,
              items: [],
              lastSelected: undefined,
            };
            
            saveToHistory(newState);
            return newState;
          });
        },
        
        selectAll: (items) => {
          set((state) => {
            const newItems: SelectedItem[] = items.map(item => ({
              id: item.id,
              type: item.type,
              selectedAt: Date.now(),
            }));
            
            const newState = {
              ...state,
              items: newItems,
              lastSelected: newItems.length > 0 ? newItems[newItems.length - 1].id : undefined,
            };
            
            saveToHistory(newState);
            return newState;
          });
        },
        
        // 范围选择
        selectRange: (fromId, toId, allItems) => {
          set((state) => {
            const fromIndex = allItems.findIndex(item => item.id === fromId);
            const toIndex = allItems.findIndex(item => item.id === toId);
            
            if (fromIndex === -1 || toIndex === -1) return state;
            
            const startIndex = Math.min(fromIndex, toIndex);
            const endIndex = Math.max(fromIndex, toIndex);
            
            const rangeItems = allItems.slice(startIndex, endIndex + 1);
            const newItems: SelectedItem[] = rangeItems.map(item => ({
              id: item.id,
              type: item.type,
              selectedAt: Date.now(),
            }));
            
            const newState = {
              ...state,
              items: newItems,
              lastSelected: toId,
            };
            
            saveToHistory(newState);
            return newState;
          });
        },
        
        // 选择模式管理
        setSelectionMode: (mode) => {
          set((state) => {
            let newItems = state.items;
            
            // 如果切换到单选模式，只保留最后选中的项
            if (mode === 'single' && state.items.length > 1) {
              const lastItem = state.items.find(item => item.id === state.lastSelected) || state.items[state.items.length - 1];
              newItems = lastItem ? [lastItem] : [];
            }
            
            return {
              ...state,
              mode,
              items: newItems,
            };
          });
        },
        
        // 查询方法
        isSelected: (id) => {
          const state = get();
          return state.items.some(item => item.id === id);
        },
        
        getSelectedIds: () => {
          const state = get();
          return state.items.map(item => item.id);
        },
        
        getSelectedItems: () => {
          const state = get();
          return [...state.items];
        },
        
        getSelectedItemsByType: (type) => {
          const state = get();
          return state.items.filter(item => item.type === type);
        },
        
        getSelectionCount: () => {
          const state = get();
          return state.items.length;
        },
        
        hasSelection: () => {
          const state = get();
          return state.items.length > 0;
        },
        
        // 选择状态操作
        invertSelection: (allItems) => {
          set((state) => {
            const selectedIds = new Set(state.items.map(item => item.id));
            const newItems: SelectedItem[] = allItems
              .filter(item => !selectedIds.has(item.id))
              .map(item => ({
                id: item.id,
                type: item.type,
                selectedAt: Date.now(),
              }));
            
            const newState = {
              ...state,
              items: newItems,
              lastSelected: newItems.length > 0 ? newItems[newItems.length - 1].id : undefined,
            };
            
            saveToHistory(newState);
            return newState;
          });
        },
        
        selectByType: (type, allItems) => {
          set((state) => {
            const typeItems = allItems.filter(item => item.type === type);
            const newItems: SelectedItem[] = typeItems.map(item => ({
              id: item.id,
              type: item.type,
              selectedAt: Date.now(),
            }));
            
            const newState = {
              ...state,
              items: newItems,
              lastSelected: newItems.length > 0 ? newItems[newItems.length - 1].id : undefined,
            };
            
            saveToHistory(newState);
            return newState;
          });
        },
        
        // 历史和撤销
        canUndo: () => {
          return history.currentIndex > 0;
        },
        
        undo: () => {
          if (history.currentIndex > 0) {
            history.currentIndex--;
            const previousState = history.states[history.currentIndex];
            set(previousState);
          }
        },
        
        // 工具函数
        exportSelection: () => {
          const state = get();
          return JSON.stringify({
            items: state.items,
            mode: state.mode,
            lastSelected: state.lastSelected,
          }, null, 2);
        },
        
        importSelection: (selectionJson) => {
          try {
            const selection = JSON.parse(selectionJson) as Partial<SelectionState>;
            
            // 基本验证
            if (!Array.isArray(selection.items)) {
              console.error('Invalid selection data: items is not an array');
              return false;
            }
            
            set((state) => {
              const newState = {
                ...state,
                items: selection.items || [],
                mode: selection.mode || 'multiple',
                lastSelected: selection.lastSelected,
              };
              
              saveToHistory(newState);
              return newState;
            });
            
            return true;
          } catch (error) {
            console.error('Failed to import selection:', error);
            return false;
          }
        },
      };
    },
    {
      name: 'selection-store',
    }
  )
); 