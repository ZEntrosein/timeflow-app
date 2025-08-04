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
    openAddObjectDialog
  } = useUIStore();
  
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
      <div className="h-full flex flex-col bg-white">
        {/* 侧边栏标题 */}
        <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-3">
          <h3 className="text-sm font-medium text-gray-700">对象管理</h3>
        </div>

        {/* 对象类别面板 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              对象类别
            </div>
            
            <div className="space-y-2">
              {Object.entries(objectCounts).map(([type, count]) => (
                <div
                  key={type}
                  onClick={() => handleCategoryClick(type)}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                  style={{
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg">
                      {getCategoryIcon(type)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {getTypeLabel(type)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {count === 0 ? '暂无对象' : `${count} 个对象`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      {count}
                    </span>
                    <div className="ml-2 text-gray-400 group-hover:text-blue-500">
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mx-3 p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs font-medium text-gray-600 mb-2">项目统计</div>
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>总对象数：</span>
                <span className="font-medium text-gray-700">{objects.length}</span>
              </div>
              <div className="flex justify-between">
                <span>有效类别：</span>
                <span className="font-medium text-gray-700">
                  {Object.values(objectCounts).filter(count => count > 0).length}
                </span>
              </div>
            </div>
          </div>

          {/* 空状态 */}
          {objects.length === 0 && (
            <div className="mx-3 mt-6 text-center">
              <div className="text-gray-400 mb-2 text-2xl">🎭</div>
              <div className="text-sm text-gray-500 mb-1">暂无任何对象</div>
              <div className="text-xs text-gray-400">
                点击下方按钮开始创建
              </div>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="border-t border-gray-200 p-3">
          <button 
            onClick={() => openAddObjectDialog()}
            className="w-full py-2 px-4 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors duration-200 font-medium"
          >
            + 创建新对象
          </button>
          <div className="text-xs text-gray-400 text-center mt-2">
            💡 点击类别查看详细列表
          </div>
        </div>
      </div>

      {/* 对象列表弹窗 */}
      <ObjectListDialog
        isOpen={dialogs.objectList}
        onClose={closeObjectListDialog}
        objectType={selectedObjectType}
      />
    </>
  );
}; 