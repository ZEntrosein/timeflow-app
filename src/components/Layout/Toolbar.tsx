import React from 'react';
import { useUIStore, useProjectStore } from '../../store';
import { VIEW_TYPES } from '../../constants/views';
import { ViewType } from '../../types';

export const Toolbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    toggleSidebar,
    toggleInspector,
    zoomIn,
    zoomOut,
    zoomLevel,
    toggleTheme,
    getCurrentTheme,
    openAddEventDialog,
    openAddObjectDialog,
    resetTimelineView,
  } = useUIStore();

  const { project } = useProjectStore();

  const currentTheme = getCurrentTheme();
  const isDark = currentTheme.name === 'dark';
  const isTimelineView = currentView === VIEW_TYPES.TIMELINE;

  const handleResetTimelineView = () => {
    if (project && project.timeline.events.length > 0) {
      resetTimelineView(project.timeline.events);
    } else {
      resetTimelineView();
    }
  };

  const viewButtons = [
    { type: VIEW_TYPES.TIMELINE, label: '时间轴', icon: '📊' },
    { type: VIEW_TYPES.DATA_TABLE, label: '数据表', icon: '📋' },
    { type: VIEW_TYPES.RELATIONSHIP, label: '关系图', icon: '🕸️' },
    { type: VIEW_TYPES.SPATIAL, label: '空间图', icon: '🗺️' },
    { type: VIEW_TYPES.DIRECTOR, label: '导演台', icon: '🎬' },
  ];

  return (
    <div className={`h-12 ${currentTheme.ui.toolbar} ${currentTheme.border.primary} border-b flex items-center px-4 space-x-4`}>
      {/* 布局控制 */}
      <div className="flex space-x-2">
        <button
          onClick={toggleSidebar}
          className={`px-3 py-1 text-sm ${currentTheme.background.secondary} hover:${currentTheme.background.primary} rounded transition-colors ${currentTheme.text.secondary}`}
          title="切换侧边栏"
        >
          📂
        </button>
        <button
          onClick={toggleInspector}
          className={`px-3 py-1 text-sm ${currentTheme.background.secondary} hover:${currentTheme.background.primary} rounded transition-colors ${currentTheme.text.secondary}`}
          title="切换检查器"
        >
          🔍
        </button>
      </div>

      {/* 分隔线 */}
      <div className={`w-px h-6 ${currentTheme.border.secondary.replace('border-', 'bg-')}`} />

      {/* 视图切换 */}
      <div className="flex space-x-1">
        {viewButtons.map((view) => (
          <button
            key={view.type}
            onClick={() => setCurrentView(view.type as ViewType)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              currentView === view.type
                ? 'bg-blue-500 text-white'
                : `${currentTheme.background.secondary} hover:${currentTheme.background.primary} ${currentTheme.text.secondary}`
            }`}
            title={view.label}
          >
            <span className="mr-1">{view.icon}</span>
            {view.label}
          </button>
        ))}
      </div>

      {/* 分隔线 */}
      <div className={`w-px h-6 ${currentTheme.border.secondary.replace('border-', 'bg-')}`} />

      {/* 缩放控制 */}
      <div className="flex items-center space-x-2">
        <button
          onClick={zoomOut}
          className={`px-2 py-1 text-sm ${currentTheme.background.secondary} hover:${currentTheme.background.primary} rounded transition-colors ${currentTheme.text.secondary}`}
          title="缩小"
        >
          −
        </button>
        <span className={`text-sm ${currentTheme.text.tertiary} min-w-16 text-center`}>
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className={`px-2 py-1 text-sm ${currentTheme.background.secondary} hover:${currentTheme.background.primary} rounded transition-colors ${currentTheme.text.secondary}`}
          title="放大"
        >
          +
        </button>
      </div>

      {/* 分隔线 */}
      <div className={`w-px h-6 ${currentTheme.border.secondary.replace('border-', 'bg-')}`} />

      {/* 主题切换 */}
      <button
        onClick={toggleTheme}
        className={`px-3 py-1 text-sm ${currentTheme.background.secondary} hover:${currentTheme.background.primary} rounded transition-colors ${currentTheme.text.secondary}`}
        title="切换主题"
      >
        {isDark ? '🌞' : '🌙'}
      </button>

      {/* 时间轴操作按钮 - 仅在时间轴视图显示 */}
      {isTimelineView && (
        <>
          {/* 分隔线 */}
          <div className={`w-px h-6 ${currentTheme.border.secondary.replace('border-', 'bg-')}`} />
          
          <div className="flex items-center space-x-2">
            <button
              onClick={openAddEventDialog}
              className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors shadow-sm"
              title="添加事件"
            >
              ➕ 事件
            </button>
            <button
              onClick={openAddObjectDialog}
              className="px-3 py-1 text-xs bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors shadow-sm"
              title="添加对象"
            >
              ➕ 对象
            </button>
          </div>
        </>
      )}
    </div>
  );
}; 