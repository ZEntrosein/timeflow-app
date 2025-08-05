import React from 'react';
import { useUIStore } from '../../store';

export const ContextBar: React.FC = () => {
  const { viewport, centerOnTime, updateViewport, zoomLevel, getCurrentTheme } = useUIStore();
  const currentTheme = getCurrentTheme();

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const timeRange = viewport.endTime - viewport.startTime;
    const newCenterTime = viewport.startTime + timeRange * percentage;
    centerOnTime(newCenterTime);
  };

  return (
    <div className={`h-full ${currentTheme.ui.contextBar} ${currentTheme.border.primary} border-t flex items-center px-4`}>
      {/* 时间轴概览 */}
      <div className={`flex-1 h-6 ${currentTheme.background.secondary} ${currentTheme.border.secondary} border rounded relative overflow-hidden cursor-pointer`}>
        <div 
          className={`h-full ${currentTheme.background.primary} relative`}
          onClick={handleTimelineClick}
          title="点击跳转到指定时间"
        >
          {/* 时间轴背景网格 */}
          <div 
            className="absolute inset-0"
            style={{
              background: currentTheme.name === 'dark' 
                ? 'linear-gradient(to right, #374151, #4b5563)' 
                : 'linear-gradient(to right, #f3f4f6, #e5e7eb)'
            }}
          />
          
          {/* 当前视口指示器 */}
          <div 
            className="absolute top-0 bottom-0 bg-blue-500 bg-opacity-30 border-2 border-blue-500 rounded-sm"
            style={{
              left: `${((viewport.startTime - 0) / (1000 - 0)) * 100}%`,
              width: `${((viewport.endTime - viewport.startTime) / (1000 - 0)) * 100}%`,
            }}
          >
            {/* 左右拖拽手柄 */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 cursor-ew-resize" />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 cursor-ew-resize" />
          </div>

          {/* 事件指示器 */}
          <div className="absolute inset-0">
            {/* 示例事件点 */}
            <div 
              className="absolute top-1 bottom-1 w-1 bg-red-500 rounded-full"
              style={{ left: '20%' }}
              title="事件 1"
            />
            <div 
              className="absolute top-1 bottom-1 w-1 bg-green-500 rounded-full"
              style={{ left: '45%' }}
              title="事件 2"
            />
            <div 
              className="absolute top-1 bottom-1 w-1 bg-blue-500 rounded-full"
              style={{ left: '75%' }}
              title="事件 3"
            />
          </div>
        </div>
      </div>

      {/* 时间信息 */}
      <div className={`ml-4 flex items-center space-x-4 text-xs ${currentTheme.text.tertiary}`}>
        <div className="flex items-center space-x-2">
          <span>开始:</span>
          <span className="font-mono">{Math.round(viewport.startTime)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>结束:</span>
          <span className="font-mono">{Math.round(viewport.endTime)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>范围:</span>
          <span className="font-mono">{Math.round(viewport.timeRange)}</span>
        </div>
      </div>

      {/* 导航控制 */}
      <div className="ml-4 flex items-center space-x-2">
        <button 
          className={`px-2 py-1 text-xs ${currentTheme.background.secondary} hover:${currentTheme.background.primary} ${currentTheme.text.secondary} rounded transition-colors duration-200`}
          onClick={() => updateViewport({ 
            startTime: Math.max(0, viewport.startTime - viewport.timeRange * 0.5),
            endTime: viewport.endTime - viewport.timeRange * 0.5,
            centerTime: viewport.centerTime - viewport.timeRange * 0.5
          })}
          title="向前移动"
        >
          ◀
        </button>
        <button 
          className={`px-2 py-1 text-xs ${currentTheme.background.secondary} hover:${currentTheme.background.primary} ${currentTheme.text.secondary} rounded transition-colors duration-200`}
          onClick={() => centerOnTime(500)}
          title="回到中心"
        >
          ⚫
        </button>
        <button 
          className={`px-2 py-1 text-xs ${currentTheme.background.secondary} hover:${currentTheme.background.primary} ${currentTheme.text.secondary} rounded transition-colors duration-200`}
          onClick={() => updateViewport({ 
            startTime: viewport.startTime + viewport.timeRange * 0.5,
            endTime: Math.min(1000, viewport.endTime + viewport.timeRange * 0.5),
            centerTime: viewport.centerTime + viewport.timeRange * 0.5
          })}
          title="向后移动"
        >
          ▶
        </button>
      </div>
    </div>
  );
}; 