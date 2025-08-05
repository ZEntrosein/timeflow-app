import React from 'react';
import { useUIStore } from '../../store';
import { VIEW_TYPES } from '../../constants/views';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { Inspector } from './Inspector';
import { ContextBar } from './ContextBar';
import { ViewContainer } from './ViewContainer';
import { AddObjectDialog } from '../Dialogs/AddObjectDialog';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const {
    layoutConfig,
    sidebarVisible,
    inspectorVisible,
    currentView,
    getCurrentTheme,
    dialogs,
    closeAddObjectDialog,
  } = useUIStore();

  const currentTheme = getCurrentTheme();

  return (
    <div className={`flex flex-col h-screen ${currentTheme.background.primary} overflow-hidden`}>
      {/* 工具栏 */}
      <Toolbar />
      
      {/* 主内容区域 */}
      <div className="flex flex-1 min-h-0">
        {/* 侧边栏 */}
        {sidebarVisible && (
          <div 
            className={`${currentTheme.ui.panel} ${currentTheme.border.primary} border-r flex-shrink-0`}
            style={{ width: layoutConfig.sidebarWidth }}
          >
            <Sidebar />
          </div>
        )}
        
        {/* 主视图区域 */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* 视图容器 */}
          <div className={`flex-1 ${currentTheme.ui.panel}`}>
            <ViewContainer />
            {children}
          </div>
          
          {/* 上下文导航栏 */}
          <div 
            className={`${currentTheme.ui.contextBar} ${currentTheme.border.primary} border-t`}
            style={{ height: layoutConfig.contextBarHeight }}
          >
            <ContextBar />
          </div>
        </div>
        
        {/* 检查器面板 */}
        {inspectorVisible && (
          <div 
            className={`${currentTheme.ui.panel} ${currentTheme.border.primary} border-l flex-shrink-0 h-full`}
            style={{ width: layoutConfig.inspectorWidth }}
          >
            <Inspector />
          </div>
        )}
      </div>

      {/* 对话框 */}
      <AddObjectDialog 
        isOpen={dialogs.addObject} 
        onClose={closeAddObjectDialog} 
      />
    </div>
  );
}; 