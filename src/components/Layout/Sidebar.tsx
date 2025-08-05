import React from 'react';
import { useProjectStore, useUIStore } from '../../store';
import { OBJECT_TYPES } from '../../constants/views';
import { WorldObject } from '../../types';
import { ObjectListDialog } from '../Dialogs/ObjectListDialog';

export const Sidebar: React.FC = () => {
  const { project, getObjects } = useProjectStore();
  const { 
    dialogs, 
    selectedObjectType,
    openObjectListDialog, 
    closeObjectListDialog,
    openAddObjectDialog,
    getCurrentTheme
  } = useUIStore();
  
  const currentTheme = getCurrentTheme();
  const objects = getObjects();

  // 按类型统计对象数量
  const objectCounts: Record<string, number> = {
    [OBJECT_TYPES.PERSON]: objects.filter(obj => obj.category === 'person').length,
    [OBJECT_TYPES.PLACE]: objects.filter(obj => obj.category === 'place').length,
    [OBJECT_TYPES.PROJECT]: objects.filter(obj => obj.category === 'project').length,
    [OBJECT_TYPES.OBJECT]: objects.filter(obj => obj.category === 'object').length,
    [OBJECT_TYPES.CUSTOM]: objects.filter(obj => obj.category === 'custom').length,
  };

  const handleCategoryClick = (category: string) => {
    openObjectListDialog(category);
  };

  const getCategoryIcon = (type: string): string => {
    const icons: Record<string, string> = {
      [OBJECT_TYPES.PERSON]: '👤',
      [OBJECT_TYPES.PLACE]: '📍',
      [OBJECT_TYPES.PROJECT]: '📂',
      [OBJECT_TYPES.OBJECT]: '🎯',
      [OBJECT_TYPES.CUSTOM]: '⭐',
    };
    return icons[type] || '❓';
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      [OBJECT_TYPES.PERSON]: '人物',
      [OBJECT_TYPES.PLACE]: '地点',
      [OBJECT_TYPES.PROJECT]: '项目',
      [OBJECT_TYPES.OBJECT]: '对象',
      [OBJECT_TYPES.CUSTOM]: '自定义',
    };
    return labels[type] || '未知';
  };

  return (
    <>
      <div className={`h-full flex flex-col ${currentTheme.ui.panel}`}>
        {/* 侧边栏标题 */}
        <div className={`h-12 ${currentTheme.background.secondary} ${currentTheme.border.secondary} border-b flex items-center px-4 shadow-sm`}>
          <h3 className={`text-sm font-semibold ${currentTheme.text.primary}`}>对象管理</h3>
        </div>

        {/* 对象类别面板 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className={`text-xs font-medium ${currentTheme.text.tertiary} uppercase tracking-wide mb-4`}>
              对象类别
            </div>
            
            <div className="space-y-3">
              {Object.entries(objectCounts).map(([type, count]) => (
                <div
                  key={type}
                  onClick={() => handleCategoryClick(type)}
                  className={`flex items-center justify-between p-4 rounded-xl ${currentTheme.background.secondary} ${currentTheme.border.secondary} border-2 hover:border-blue-400 hover:${currentTheme.background.primary} cursor-pointer transition-all duration-200 group shadow-sm hover:shadow-md transform hover:scale-102`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-xl transition-transform duration-200 group-hover:scale-110">
                      {getCategoryIcon(type)}
                    </div>
                    <div>
                      <div className={`font-medium ${currentTheme.text.primary} group-hover:${currentTheme.text.primary}`}>
                        {getTypeLabel(type)}
                      </div>
                      <div className={`text-xs ${currentTheme.text.tertiary} group-hover:${currentTheme.text.secondary}`}>
                        {count === 0 ? '暂无对象' : `${count} 个对象`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center justify-center min-w-6 h-6 text-xs font-bold ${currentTheme.text.primary} ${currentTheme.background.primary} rounded-full px-2 transition-colors duration-200`}>
                      {count}
                    </span>
                    <div className={`text-sm ${currentTheme.text.tertiary} group-hover:${currentTheme.text.secondary} transition-colors duration-200`}>
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 底部操作按钮 */}
          <div className={`p-4 ${currentTheme.border.secondary} border-t mt-auto`}>
            <button
              onClick={openAddObjectDialog}
              className="w-full px-4 py-3 theme-btn-primary rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
            >
              <span className="mr-2">➕</span>
              添加新对象
            </button>
          </div>
        </div>
      </div>

      {/* 对象列表对话框 */}
      <ObjectListDialog 
        isOpen={dialogs.objectList} 
        objectType={selectedObjectType}
        onClose={closeObjectListDialog} 
      />
    </>
  );
}; 