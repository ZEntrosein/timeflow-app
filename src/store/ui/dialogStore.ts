import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 对话框状态接口
export interface DialogState {
  addEvent: boolean;
  addObject: boolean;
  addAttribute: boolean;
  editEvent: boolean;
  editObject: boolean;
  objectList: boolean;
  importData: boolean;
  exportData: boolean;
  settings: boolean;
  help: boolean;
  keyboardShortcuts: boolean;
  conflictWarning: boolean;
}

// 编辑状态
export interface EditingState {
  editingEventId?: string;
  editingObjectId?: string;
  selectedObjectType?: string;
  conflictData?: any;
}

export interface DialogStore {
  // 状态
  dialogs: DialogState;
  editing: EditingState;

  // 对话框操作
  openDialog: (dialogName: keyof DialogState) => void;
  closeDialog: (dialogName: keyof DialogState) => void;
  closeAllDialogs: () => void;
  
  // 编辑操作
  setEditingEvent: (eventId?: string) => void;
  setEditingObject: (objectId?: string) => void;
  setSelectedObjectType: (objectType?: string) => void;
  setConflictData: (data?: any) => void;
  
  // 便捷方法
  openAddEventDialog: () => void;
  openAddObjectDialog: () => void;
  openAddAttributeDialog: () => void;
  openEditEventDialog: (eventId: string) => void;
  openEditObjectDialog: (objectId: string) => void;
  openObjectListDialog: (objectType: string) => void;
  
  closeAddEventDialog: () => void;
  closeAddObjectDialog: () => void;
  closeAddAttributeDialog: () => void;
  closeEditEventDialog: () => void;
  closeEditObjectDialog: () => void;
  closeObjectListDialog: () => void;
}

// 默认状态
const defaultDialogState: DialogState = {
  addEvent: false,
  addObject: false,
  addAttribute: false,
  editEvent: false,
  editObject: false,
  objectList: false,
  importData: false,
  exportData: false,
  settings: false,
  help: false,
  keyboardShortcuts: false,
  conflictWarning: false,
};

const defaultEditingState: EditingState = {};

export const useDialogStore = create<DialogStore>()(
  devtools(
    (set, get) => ({
      dialogs: defaultDialogState,
      editing: defaultEditingState,

      // 通用对话框操作
      openDialog: (dialogName) => 
        set((state) => ({
          dialogs: { ...state.dialogs, [dialogName]: true }
        })),
        
      closeDialog: (dialogName) => 
        set((state) => ({
          dialogs: { ...state.dialogs, [dialogName]: false }
        })),
        
      closeAllDialogs: () => 
        set({ dialogs: defaultDialogState, editing: defaultEditingState }),

      // 编辑状态操作
      setEditingEvent: (eventId) => 
        set((state) => ({
          editing: { ...state.editing, editingEventId: eventId }
        })),
        
      setEditingObject: (objectId) => 
        set((state) => ({
          editing: { ...state.editing, editingObjectId: objectId }
        })),
        
      setSelectedObjectType: (objectType) => 
        set((state) => ({
          editing: { ...state.editing, selectedObjectType: objectType }
        })),
        
      setConflictData: (data) => 
        set((state) => ({
          editing: { ...state.editing, conflictData: data }
        })),

      // 便捷方法
      openAddEventDialog: () => {
        const { openDialog } = get();
        openDialog('addEvent');
      },
      
      openAddObjectDialog: () => {
        const { openDialog } = get();
        openDialog('addObject');
      },
      
      openAddAttributeDialog: () => {
        const { openDialog } = get();
        openDialog('addAttribute');
      },
      
      openEditEventDialog: (eventId) => {
        const { openDialog, setEditingEvent } = get();
        setEditingEvent(eventId);
        openDialog('editEvent');
      },
      
      openEditObjectDialog: (objectId) => {
        const { openDialog, setEditingObject } = get();
        setEditingObject(objectId);
        openDialog('editObject');
      },
      
      openObjectListDialog: (objectType) => {
        const { openDialog, setSelectedObjectType } = get();
        setSelectedObjectType(objectType);
        openDialog('objectList');
      },
      
      closeAddEventDialog: () => {
        const { closeDialog } = get();
        closeDialog('addEvent');
      },
      
      closeAddObjectDialog: () => {
        const { closeDialog } = get();
        closeDialog('addObject');
      },
      
      closeAddAttributeDialog: () => {
        const { closeDialog } = get();
        closeDialog('addAttribute');
      },
      
      closeEditEventDialog: () => {
        const { closeDialog, setEditingEvent } = get();
        setEditingEvent(undefined);
        closeDialog('editEvent');
      },
      
      closeEditObjectDialog: () => {
        const { closeDialog, setEditingObject } = get();
        setEditingObject(undefined);
        closeDialog('editObject');
      },
      
      closeObjectListDialog: () => {
        const { closeDialog, setSelectedObjectType } = get();
        setSelectedObjectType(undefined);
        closeDialog('objectList');
      },
    }),
    { name: 'dialog-store' }
  )
); 