import React, { useState } from 'react';
import { useUIStore, useProjectStore } from '../../store';
import { VIEW_TYPES } from '../../constants/views';
import { ViewType } from '../../types';
import { HelpPanel } from '../UI/HelpPanel';

export const Toolbar: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);
  const {
    currentView,
    setCurrentView,
    sidebarVisible,
    inspectorVisible,
    toggleSidebar,
    toggleInspector,
    zoomLevel,
    zoomIn,
    zoomOut,
    dialogs,
    openAddEventDialog,
    openAddObjectDialog,
    resetTimelineView,
    getCurrentTheme,
    currentTheme: currentThemeName,
    toggleTheme, // 确保包含toggleTheme
  } = useUIStore();

  const { project } = useProjectStore();

  const currentTheme = getCurrentTheme();
  const isDark = currentTheme.name === 'dark';
  const isTimelineView = currentView === VIEW_TYPES.TIMELINE;

  // 处理主题切换
  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleResetTimelineView = () => {
    resetTimelineView();
  };

  const viewButtons = [
    { type: VIEW_TYPES.TIMELINE, label: '时间轴', icon: '📊' },
    { type: VIEW_TYPES.DATA_TABLE, label: '数据表', icon: '📋' },
    { type: VIEW_TYPES.RELATIONSHIP, label: '关系图', icon: '🕸️' },
    { type: VIEW_TYPES.SPATIAL, label: '空间图', icon: '🗺️' },
    { type: VIEW_TYPES.DIRECTOR, label: '导演台', icon: '🎬' },
  ];

  return (
    <>
      <div className="h-14 theme-toolbar theme-border-primary border-b flex items-center px-6 space-x-6 shadow-sm">
        {/* 布局控制 */}
        <div className="flex space-x-3">
          <button
            onClick={toggleSidebar}
            className="px-4 py-2 text-sm theme-bg-secondary hover:theme-bg-primary rounded-lg transition-all duration-200 theme-text-secondary shadow-sm hover:shadow-md transform hover:scale-105 font-medium"
            title="切换侧边栏"
          >
            <span className="mr-2">📂</span>
            侧边栏
          </button>
          <button
            onClick={toggleInspector}
            className="px-4 py-2 text-sm theme-bg-secondary hover:theme-bg-primary rounded-lg transition-all duration-200 theme-text-secondary shadow-sm hover:shadow-md transform hover:scale-105 font-medium"
            title="切换检查器"
          >
            <span className="mr-2">🔍</span>
            检查器
          </button>
        </div>

        {/* 分隔线 */}
        <div className="w-px h-8 theme-border-secondary opacity-50" />

        {/* 视图切换 */}
        <div className="flex space-x-2">
          {viewButtons.map((view) => (
            <button
              key={view.type}
              onClick={() => setCurrentView(view.type as ViewType)}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105 ${
                currentView === view.type
                  ? 'theme-btn-primary shadow-md scale-105'
                  : 'theme-bg-secondary hover:theme-bg-primary theme-text-secondary'
              }`}
              title={view.label}
            >
              <span className="mr-2">{view.icon}</span>
              {view.label}
            </button>
          ))}
        </div>

        {/* 分隔线 */}
        <div className="w-px h-8 theme-border-secondary opacity-50" />

        {/* 缩放控制 */}
        <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-1 shadow-sm">
          <button
            onClick={zoomOut}
            className="w-8 h-8 text-sm theme-bg-secondary hover:theme-bg-primary rounded-md transition-all duration-200 theme-text-secondary shadow-sm hover:shadow-md transform hover:scale-110 font-bold flex items-center justify-center"
            title="缩小"
          >
            −
          </button>
          <span className="text-sm theme-text-tertiary min-w-16 text-center font-mono font-medium">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="w-8 h-8 text-sm theme-bg-secondary hover:theme-bg-primary rounded-md transition-all duration-200 theme-text-secondary shadow-sm hover:shadow-md transform hover:scale-110 font-bold flex items-center justify-center"
            title="放大"
          >
            +
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* 时间轴操作按钮 - 仅在时间轴视图显示 */}
        {isTimelineView && (
          <div className="flex items-center space-x-3">
            <button
              onClick={openAddEventDialog}
              className="px-4 py-2 text-sm theme-btn-primary rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
              title="添加事件"
            >
              <span className="mr-2">➕</span>
              添加事件
            </button>
            <button
              onClick={openAddObjectDialog}
              className="px-4 py-2 text-sm theme-btn-success rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
              title="添加对象"
            >
              <span className="mr-2">➕</span>
              添加对象
            </button>
            <button
              onClick={handleResetTimelineView}
              className="px-4 py-2 text-sm theme-btn-warning rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
              title="重置视图"
            >
              <span className="mr-2">🔄</span>
              重置
            </button>
          </div>
        )}

        {/* 分隔线 */}
        <div className="w-px h-8 theme-border-secondary opacity-50" />

        {/* 右侧工具 */}
        <div className="flex items-center space-x-3">
          {/* 主题切换 */}
          <button
            onClick={handleThemeToggle}
            className="px-4 py-2 text-lg theme-bg-secondary hover:theme-bg-primary rounded-lg transition-all duration-200 theme-text-secondary shadow-sm hover:shadow-md transform hover:scale-105 hover:rotate-12"
            title={`切换主题 (当前: ${currentTheme.name})`}
          >
            {isDark ? '🌞' : '🌙'}
          </button>

          {/* 快捷键帮助 */}
          <button
            onClick={() => setShowHelp(true)}
            className="px-4 py-2 text-sm theme-bg-secondary hover:theme-bg-primary rounded-lg transition-all duration-200 theme-text-secondary shadow-sm hover:shadow-md transform hover:scale-105 font-medium"
            title="快捷键帮助 (Ctrl + /)"
          >
            <span className="mr-2">⌨️</span>
            快捷键
          </button>
        </div>
      </div>

      {/* 快捷键面板 */}
      {showHelp && <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} />}
    </>
  );
}; 