import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TimelineCanvas } from './TimelineCanvas';
import { useProjectStore, useUIStore, useSelectionStore } from '../../../store';
import { AddEventDialog } from '../../Dialogs/AddEventDialog';
import { EditEventDialog } from '../../Dialogs/EditEventDialog';
import { ContextMenu } from '../../UI/ContextMenu';

export const TimelineView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const {
    viewport,
    dialogs,
    closeAddEventDialog,
    closeEditEventDialog,
    openAddEventDialog,
    openEditEventDialog,
    editingEventId,
    contextMenu,
    openContextMenu,
    closeContextMenu,
    resetTimelineView,
    getCurrentTheme,
  } = useUIStore();

  const {
    project,
    getEvents,
    removeEvent,
    getEvent,
    createSampleData,
  } = useProjectStore();

  const currentTheme = getCurrentTheme();

  const {
    getSelectedItemsByType,
    getSelectionCount,
    hasSelection,
    clearSelection,
    getSelectedItems,
    selectItem
  } = useSelectionStore();

  // 获取上下文菜单项
  const getContextMenuItems = () => {
    const { targetType, targetId } = contextMenu;
    
    if (targetType === 'event' && targetId) {
      const event = getEvent(targetId);
      if (event) {
        return [
          {
            id: 'edit-event',
            label: '编辑事件',
            icon: '✏️',
            onClick: () => openEditEventDialog(targetId)
          },
          {
            id: 'duplicate-event',
            label: '复制事件',
            icon: '📋',
            onClick: () => {
              // TODO: 实现复制功能
              console.log('复制事件:', event.title);
            }
          },
          {
            id: 'separator-1',
            label: '',
            separator: true
          },
          {
            id: 'select-event',
            label: '选择事件',
            icon: '🎯',
            onClick: () => selectItem(targetId, 'event', false)
          },
          {
            id: 'separator-2',
            label: '',
            separator: true
          },
          {
            id: 'delete-event',
            label: '删除事件',
            icon: '🗑️',
            onClick: () => {
              if (confirm(`确定要删除事件"${event.title}"吗？此操作无法撤销。`)) {
                removeEvent(targetId);
              }
            }
          }
        ];
      }
    }
    
    if (targetType === 'canvas') {
      return [
        {
          id: 'add-event',
          label: '添加事件',
          icon: '📅',
          onClick: () => openAddEventDialog()
        },
        {
          id: 'separator-1',
          label: '',
          separator: true
        },
        {
          id: 'clear-selection',
          label: '清除选择',
          icon: '🚫',
          disabled: !hasSelection(),
          onClick: () => clearSelection()
        }
      ];
    }
    
    return [];
  };

  // 监听容器尺寸变化
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ 
          width: clientWidth || 800, 
          height: clientHeight || 600 
        });
      }
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // 如果没有数据，创建示例数据
  useEffect(() => {
    if (project && project.timeline.events.length === 0 && project.objects.length === 0) {
      createSampleData();
    }
  }, [project, createSampleData]);

  // 计算缩放级别和时间范围信息
  const timeRange = viewport.endTime - viewport.startTime;
  const zoomLevel = Math.round((5000 / timeRange) * 100); // 基准时间范围5000，计算缩放百分比

  // 计算选择信息
  const selectedEvents = getSelectedItemsByType('event');
  const totalSelected = getSelectionCount();
  const hasAnySelection = hasSelection();
  const selectedItems = getSelectedItems();

  // 删除选中的事件
  const handleDeleteSelected = useCallback(() => {
    if (!hasAnySelection) return;

    const eventsToDelete = selectedEvents.map(item => item.id);

    // 确认删除
    const eventText = eventsToDelete.length > 0 ? `${eventsToDelete.length} 个事件` : '';
    
    if (!confirm(`确定要删除 ${eventText} 吗？此操作无法撤销。`)) {
      return;
    }

    // 执行删除
    eventsToDelete.forEach(id => removeEvent(id));

    // 清除选择
    clearSelection();

    console.log(`已删除: ${eventText}`);
  }, [hasAnySelection, selectedEvents, removeEvent, clearSelection]);

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果当前焦点在输入框或文本区域，不处理快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // ESC键清除选择
      if (e.key === 'Escape') {
        if (hasAnySelection) {
          clearSelection();
          e.preventDefault();
        }
      }
      
      // Delete键删除选中项目
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (hasAnySelection) {
          handleDeleteSelected();
          e.preventDefault();
        }
      }
    };

    // 只在组件可见时监听键盘事件
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasAnySelection, clearSelection, handleDeleteSelected]);

  // 如果project为null，显示加载状态
  if (!project) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">正在初始化项目...</div>
          <div className="text-sm text-gray-400">请稍候</div>
        </div>
      </div>
    );
  }

  const handleResetView = () => {
    if (project && project.timeline.events.length > 0) {
      resetTimelineView(project.timeline.events);
    } else {
      resetTimelineView();
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* 顶部状态栏 */}
      <div className={`h-10 border-b flex items-center justify-between px-4 text-xs overflow-hidden ${currentTheme.background.secondary} ${currentTheme.border.primary}`}>
        <div className="flex items-center space-x-4 flex-shrink-0">
          <span className={`whitespace-nowrap ${currentTheme.text.secondary}`}>
            时间范围: {Math.round(viewport.startTime)} - {Math.round(viewport.endTime)}
          </span>
          <span className={`whitespace-nowrap ${currentTheme.text.secondary}`}>
            缩放: {zoomLevel}%
          </span>
          <span className={`whitespace-nowrap ${currentTheme.text.secondary}`}>
            事件数: {getEvents().length}
          </span>
        </div>
        
        <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
          {/* 确保右侧控件不被挤压 */}
          {hasAnySelection && (
            <div className={`flex items-center space-x-2 px-2 py-1 rounded border ${currentTheme.background.secondary}`} style={{
              backgroundColor: currentTheme.name === 'light' ? '#eff6ff' : '#1e3a8a',
              color: currentTheme.name === 'light' ? '#1d4ed8' : '#93c5fd',
              borderColor: currentTheme.name === 'light' ? '#dbeafe' : '#1e40af'
            }}>
              已选择: {selectedEvents.length} 事件
              <button 
                onClick={clearSelection}
                className="ml-1 hover:opacity-80"
                style={{ color: currentTheme.name === 'light' ? '#3b82f6' : '#60a5fa' }}
              >
                清除
              </button>
              <button 
                onClick={handleDeleteSelected}
                className="ml-1 hover:opacity-80"
                style={{ color: currentTheme.name === 'light' ? '#ef4444' : '#f87171' }}
              >
                删除
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => openAddEventDialog()}
              className={`px-3 py-1 rounded text-xs hover:opacity-80 ${currentTheme.name === 'light' ? 'bg-blue-500 text-white' : 'bg-blue-600 text-blue-100'}`}
            >
              + 事件
            </button>
            <button 
              onClick={handleResetView}
              className={`px-2 py-1 border rounded text-xs hover:opacity-80 ${currentTheme.background.secondary} ${currentTheme.border.primary} ${currentTheme.text.secondary}`}
            >
              重置视图
            </button>
          </div>
        </div>
      </div>

      {/* 时间轴画布容器 */}
      <div 
        ref={containerRef}
        className={`flex-1 relative overflow-hidden ${currentTheme.background.primary}`}
        style={{
          position: 'absolute',
          top: '40px',
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <TimelineCanvas 
          width={dimensions.width} 
          height={dimensions.height - 40}
        />
      </div>

      {/* 对话框 */}
      <AddEventDialog 
        isOpen={dialogs.addEvent} 
        onClose={closeAddEventDialog} 
      />
      <EditEventDialog
        isOpen={dialogs.editEvent}
        onClose={closeEditEventDialog}
        eventId={editingEventId}
      />
      <ContextMenu
        isOpen={contextMenu.isOpen}
        onClose={closeContextMenu}
        items={getContextMenuItems()}
        position={contextMenu.position}
      />
    </div>
  );
}; 