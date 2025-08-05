import React from 'react';
import { useUIStore, useProjectStore } from '../../store';

export const ContextBar: React.FC = () => {
  const { viewport, centerOnTime, updateViewport, zoomLevel, getCurrentTheme } = useUIStore();
  const { getEvents } = useProjectStore();
  const currentTheme = getCurrentTheme();
  const events = getEvents();

  // 计算概览条显示的总范围（比当前视口大5倍）
  const overviewRange = viewport.timeRange * 5;
  const overviewStart = viewport.centerTime - overviewRange / 2;
  const overviewEnd = viewport.centerTime + overviewRange / 2;

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newCenterTime = overviewStart + overviewRange * percentage;
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
          
          {/* 零点指示线 */}
          {overviewStart <= 0 && overviewEnd >= 0 && (
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-gray-600 opacity-60"
              style={{
                left: `${((0 - overviewStart) / overviewRange) * 100}%`
              }}
              title="时间零点"
            />
          )}
          
          {/* 负数区域指示 */}
          {overviewStart < 0 && (
            <div 
              className="absolute top-0 bottom-0 bg-red-200 bg-opacity-20"
              style={{
                left: '0%',
                width: `${Math.min(((0 - overviewStart) / overviewRange) * 100, 100)}%`
              }}
              title="负数时间区域"
            />
          )}
          
          {/* 当前视口指示器 */}
          <div 
            className="absolute top-0 bottom-0 bg-blue-500 bg-opacity-30 border-2 border-blue-500 rounded-sm"
            style={{
              left: `${((viewport.startTime - overviewStart) / overviewRange) * 100}%`,
              width: `${(viewport.timeRange / overviewRange) * 100}%`,
            }}
          >
            {/* 左右拖拽手柄 */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 cursor-ew-resize" />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 cursor-ew-resize" />
          </div>

          {/* 事件指示器 */}
          <div className="absolute inset-0">
            {events.map((event, index) => {
              const eventTime = event.startTime;
              // 只显示在概览范围内的事件
              if (eventTime >= overviewStart && eventTime <= overviewEnd) {
                const position = ((eventTime - overviewStart) / overviewRange) * 100;
                const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500'];
                const color = colors[index % colors.length];
                
                return (
                  <div 
                    key={event.id}
                    className={`absolute top-1 bottom-1 w-1 ${color} rounded-full`}
                    style={{ left: `${position}%` }}
                    title={event.title}
                  />
                );
              }
              return null;
            })}
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
          onClick={() => centerOnTime(viewport.centerTime - viewport.timeRange * 0.5)}
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
          onClick={() => centerOnTime(viewport.centerTime + viewport.timeRange * 0.5)}
          title="向后移动"
        >
          ▶
        </button>
      </div>
    </div>
  );
}; 