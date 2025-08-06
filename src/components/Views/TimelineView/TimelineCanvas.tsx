import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Group, Rect, Text, Line, Circle } from 'react-konva';
import { useUIStore, useProjectStore, useSelectionStore } from '../../../store';
import { TimelineEvent } from '../../../types';
import { format } from 'date-fns';

interface TimelineCanvasProps {
  width: number;
  height: number;
}

export const TimelineCanvas: React.FC<TimelineCanvasProps> = ({ width, height }) => {
  const { viewport, zoomLevel, updateViewport, getCurrentTheme, openEditEventDialog, openContextMenu } = useUIStore();
  const { getEvents, updateEvent } = useProjectStore();
  const {
    selectItem,
    isSelected,
    clearSelection
  } = useSelectionStore();
  
  const stageRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // 获取事件数据
  const events = getEvents();
  const currentTheme = getCurrentTheme();

  // 时间轴配置
  const timelineConfig = {
    topMargin: 60,
    bottomMargin: 40,
    leftMargin: 0,
    rightMargin: 0,
    trackHeight: 45,
    trackSpacing: 8,
    eventHeight: 28,
    eventRadius: 15,
  };

  // 智能轨道分配算法
  const assignEventTracks = (events: TimelineEvent[]) => {
    const tracks: { events: TimelineEvent[], trackIndex: number }[] = [];
    const eventTrackMap = new Map<string, number>();

    // 按开始时间排序事件，然后按ID排序确保稳定性
    const sortedEvents = [...events].sort((a, b) => {
      const timeDiff = a.startTime - b.startTime;
      return timeDiff !== 0 ? timeDiff : a.id.localeCompare(b.id);
    });

    for (const event of sortedEvents) {
      const eventEnd = event.endTime || event.startTime;
      
      // 找到第一个没有时间冲突的轨道
      let trackIndex = 0;
      while (trackIndex < tracks.length) {
        const track = tracks[trackIndex];
        const hasConflict = track.events.some(existingEvent => {
          const existingEnd = existingEvent.endTime || existingEvent.startTime;
          // 使用严格的时间重叠检测
          return !(event.startTime >= existingEnd || eventEnd <= existingEvent.startTime);
        });
        
        if (!hasConflict) break;
        trackIndex++;
      }
      
      // 如果所有轨道都有冲突，创建新轨道
      if (trackIndex === tracks.length) {
        tracks.push({ events: [], trackIndex });
      }
      
      tracks[trackIndex].events.push(event);
      eventTrackMap.set(event.id, trackIndex);
    }
    
    return { tracks, eventTrackMap };
  };

  // 计算轨道分配
  const { tracks, eventTrackMap } = assignEventTracks(events);
  const totalTracks = Math.max(1, tracks.length); // 确保至少有一个轨道

  // 时间轴可用区域
  const timelineArea = {
    x: timelineConfig.leftMargin,
    y: timelineConfig.topMargin,
    width: width - timelineConfig.leftMargin - timelineConfig.rightMargin,
    height: height - timelineConfig.topMargin - timelineConfig.bottomMargin,
  };

  // 计算时间轴区域高度，考虑动态轨道数量
  const calculateTimelineHeight = () => {
    const minHeight = 300; // 增加最小高度
    const trackAreaHeight = totalTracks * (timelineConfig.trackHeight + timelineConfig.trackSpacing) + 120; // 增加顶部和底部边距
    return Math.max(minHeight, Math.min(trackAreaHeight, height - 100)); // 限制最大高度，为图例留空间
  };

  // 更新时间轴区域配置
  const dynamicTimelineArea = {
    ...timelineArea,
    height: calculateTimelineHeight(),
  };

  // 计算事件的Y坐标
  const getEventY = (eventId: string) => {
    const trackIndex = eventTrackMap.get(eventId);
    
    // 添加错误边界检查
    if (trackIndex === undefined) {
      console.warn(`事件 ${eventId} 未找到轨道分配，使用默认轨道 0`);
      return dynamicTimelineArea.y + 40;
    }
    
    if (trackIndex < 0 || trackIndex >= totalTracks) {
      console.warn(`事件 ${eventId} 轨道索引异常: ${trackIndex}，总轨道数: ${totalTracks}`);
      return dynamicTimelineArea.y + 40;
    }
    
    const baseY = dynamicTimelineArea.y + 40; // 增加顶部边距
    const calculatedY = baseY + trackIndex * (timelineConfig.trackHeight + timelineConfig.trackSpacing);
    
    // 确保Y坐标在合理范围内
    if (calculatedY < dynamicTimelineArea.y || calculatedY > dynamicTimelineArea.y + dynamicTimelineArea.height) {
      console.warn(`事件 ${eventId} Y坐标超出范围: ${calculatedY}, 轨道: ${trackIndex}`);
      return Math.max(dynamicTimelineArea.y + 40, Math.min(calculatedY, dynamicTimelineArea.y + dynamicTimelineArea.height - timelineConfig.eventHeight));
    }
    
    return calculatedY;
  };

  // 处理事件点击
  const handleEventClick = (event: TimelineEvent, e: any) => {
    e.cancelBubble = true;
    const isMultiSelect = e.evt.ctrlKey || e.evt.metaKey;
    selectItem(event.id, 'event', isMultiSelect);
  };

  // 处理事件双击（编辑）
  const handleEventDoubleClick = (event: TimelineEvent, e: any) => {
    e.cancelBubble = true;
    openEditEventDialog(event.id);
  };

  // 处理事件拖拽开始
  const handleEventDragStart = (event: TimelineEvent, e: any) => {
    e.cancelBubble = true; // 阻止事件冒泡
    e.evt?.stopPropagation?.(); // 停止事件传播
    
    setDraggedEventId(event.id);
    setIsDragging(false); // 确保画布拖拽状态为false
    
    const currentX = timeToPixel(event.startTime);
    const isInViewport = currentX >= dynamicTimelineArea.x && currentX <= dynamicTimelineArea.x + dynamicTimelineArea.width;
  };

  // 处理事件拖拽结束
  const handleEventDragEnd = (event: TimelineEvent, e: any) => {
    try {
      e.cancelBubble = true; // 阻止事件冒泡
      e.evt?.stopPropagation?.(); // 停止事件传播
      
      // 获取拖拽后的位置
      const groupNode = e.target;
      
      // 如果目标不是 Group，尝试获取父级
      const actualGroup = groupNode.getClassName() === 'Group' ? groupNode : groupNode.getParent();
      
      const newX = actualGroup.x();
      
      // 详细调试 pixelToTime 计算
      const timeRange = viewport.endTime - viewport.startTime;
      const pixelPerTime = dynamicTimelineArea.width / timeRange;
      const pixelOffset = newX - dynamicTimelineArea.x;
      const timeOffset = pixelOffset / pixelPerTime;
      const calculatedTime = viewport.startTime + timeOffset;
      
      const rawTime = pixelToTime(newX);
      
      const newStartTime = Math.max(0, Math.round(rawTime));
      const finalTimeDifference = newStartTime - event.startTime;
      
      // 更新事件数据
      const updatedEvent: Partial<TimelineEvent> = {
        startTime: newStartTime,
        endTime: event.endTime ? Math.max(newStartTime, event.endTime + finalTimeDifference) : undefined,
        updatedAt: new Date().toISOString(),
      };
      
      updateEvent(event.id, updatedEvent);
      
      // 智能视窗调整：如果事件被拖拽到视窗外，调整视窗来显示事件
      const eventNewX = timeToPixel(newStartTime);
      const eventEndX = timeToPixel(updatedEvent.endTime || newStartTime);
      const isEventVisible = !(eventNewX > dynamicTimelineArea.x + dynamicTimelineArea.width || 
                              eventEndX < dynamicTimelineArea.x);
      
      if (!isEventVisible) {
        // 计算需要调整的时间偏移
        let timeAdjustment = 0;
        
        if (eventNewX > dynamicTimelineArea.x + dynamicTimelineArea.width) {
          // 事件在视窗右侧外，向右平移视窗
          const targetX = dynamicTimelineArea.x + dynamicTimelineArea.width * 0.2; // 事件显示在视窗左侧20%位置
          timeAdjustment = pixelToTime(eventNewX) - pixelToTime(targetX);
        } else if (eventEndX < dynamicTimelineArea.x) {
          // 事件在视窗左侧外，向左平移视窗
          const targetX = dynamicTimelineArea.x + dynamicTimelineArea.width * 0.8; // 事件显示在视窗右侧80%位置
          timeAdjustment = pixelToTime(eventEndX) - pixelToTime(targetX);
        }
        
        if (timeAdjustment !== 0) {
          updateViewport({
            startTime: viewport.startTime + timeAdjustment,
            endTime: viewport.endTime + timeAdjustment,
            centerTime: viewport.centerTime + timeAdjustment,
          });
        }
      }
      
      // 确保拖拽的事件被选中
      if (!isSelected(event.id)) {
        selectItem(event.id, 'event', false);
      }

      // 重置拖拽状态
      setDraggedEventId(null);
      setIsDragging(false);
    } catch (error) {
      console.error('拖拽结束处理错误:', error);
      setDraggedEventId(null);
      setIsDragging(false);
    }
  };

  // 处理画布点击（取消选择）
  const handleCanvasClick = (e: any) => {
    // 只有在直接点击Stage时才取消选择
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  };

  // 处理事件右键
  const handleEventContextMenu = (event: TimelineEvent, e: any) => {
    e.cancelBubble = true;
    e.evt.preventDefault();
    
    // 确保右键的事件被选中
    if (!isSelected(event.id)) {
      selectItem(event.id, 'event', false);
    }
    
    // 获取鼠标位置（相对于页面）
    const clientX = e.evt.clientX;
    const clientY = e.evt.clientY;
    
    openContextMenu({ x: clientX, y: clientY }, 'event', event.id);
  };

  // 处理画布右键
  const handleCanvasContextMenu = (e: any) => {
    e.evt.preventDefault();
    
    // 获取鼠标位置（相对于页面）
    const clientX = e.evt.clientX;
    const clientY = e.evt.clientY;
    
    openContextMenu({ x: clientX, y: clientY }, 'canvas');
  };

  // 事件类型颜色配置
  const eventColors = {
    meeting: {
      fill: '#059669',      // emerald-600
      stroke: '#047857',    // emerald-700
      accent: '#065f46',    // emerald-800
    },
    task: {
      fill: '#2563eb',      // blue-600
      stroke: '#1d4ed8',    // blue-700
      accent: '#1e40af',    // blue-800
    },
    design: {
      fill: '#dc2626',      // red-600
      stroke: '#b91c1c',    // red-700
      accent: '#991b1b',    // red-800
    },
    development: {
      fill: '#7c3aed',      // violet-600
      stroke: '#6d28d9',    // violet-700
      accent: '#5b21b6',    // violet-800
    },
    testing: {
      fill: '#ea580c',      // orange-600
      stroke: '#c2410c',    // orange-700
      accent: '#9a3412',    // orange-800
    },
    default: {
      fill: '#6b7280',      // gray-500
      stroke: '#4b5563',    // gray-600
      accent: '#374151',    // gray-700
    },
  };

  // 获取事件颜色
  const getEventColors = (category?: string) => {
    return eventColors[category as keyof typeof eventColors] || eventColors.default;
  };

  // 时间到像素的转换
  const timeToPixel = (time: number): number => {
    const timeRange = viewport.endTime - viewport.startTime;
    const pixelPerTime = dynamicTimelineArea.width / timeRange;
    return dynamicTimelineArea.x + (time - viewport.startTime) * pixelPerTime;
  };

  // 像素到时间的转换
  const pixelToTime = (pixel: number): number => {
    const timeRange = viewport.endTime - viewport.startTime;
    const pixelPerTime = dynamicTimelineArea.width / timeRange;
    return viewport.startTime + (pixel - dynamicTimelineArea.x) / pixelPerTime;
  };

  // 生成时间刻度
  const generateTimeScales = () => {
    const scales = [];
    const timeRange = viewport.endTime - viewport.startTime;
    const targetTickCount = 8; // 目标刻度数量
    const tickInterval = Math.ceil(timeRange / targetTickCount / 50) * 50; // 向上取整到50的倍数

    let currentTime = Math.ceil(viewport.startTime / tickInterval) * tickInterval;
    
    while (currentTime <= viewport.endTime) {
      const x = timeToPixel(currentTime);
      if (x >= dynamicTimelineArea.x && x <= dynamicTimelineArea.x + dynamicTimelineArea.width) {
        scales.push({
          time: currentTime,
          x: x,
          label: currentTime.toString(),
        });
      }
      currentTime += tickInterval;
    }
    
    return scales;
  };

  // 处理拖拽
  const handleMouseDown = (e: any) => {
    const target = e.target;
    const targetName = target.getClassName();
    const targetElementName = target.name?.() || '';
    
    // 允许在以下情况启动画布拖拽：
    // 1. 点击 Stage 本身（空白区域）
    // 2. 点击标识为背景的元素
    const isClickableBackground = (
      target === target.getStage() || 
      targetElementName === 'canvas-background' ||
      targetElementName === 'timeline-border'
    );
    
    if (!isClickableBackground) {
      return;
    }
    
    // 如果正在拖拽事件，不处理画布拖拽
    if (draggedEventId) {
      return;
    }
    
    // 检查是否有事件被选中
    const { getSelectedItemsByType } = useSelectionStore.getState();
    const selectedEvents = getSelectedItemsByType('event');
    const hasSelectedEvents = selectedEvents.length > 0;
    
    if (hasSelectedEvents) {
      // 可以在这里添加用户提示，比如显示一个临时的提示消息
      // 暂时只在控制台显示，后续可以考虑添加UI提示
      return;
    }
    
    setIsDragging(true);
    setDragStart({ x: e.evt.clientX, y: e.evt.clientY });
  };

  const handleMouseMove = (e: any) => {
    // 如果正在拖拽事件，不处理画布平移
    if (draggedEventId) {
      return;
    }
    
    // 如果没有启动画布拖拽，不处理画布平移
    if (!isDragging) {
      return;
    }

    const currentX = e.evt.clientX;
    const currentY = e.evt.clientY;
    const deltaX = currentX - dragStart.x;

    // 防抖：限制更新频率
    const now = Date.now();
    if (now - lastUpdateRef.current < 16) { // 约60fps
      return;
    }
    lastUpdateRef.current = now;

    // 转换为时间偏移
    const timeRange = viewport.endTime - viewport.startTime;
    const pixelPerTime = dynamicTimelineArea.width / timeRange;
    const timeOffset = -deltaX / pixelPerTime;

    // 更新视口
    updateViewport({
      startTime: viewport.startTime + timeOffset,
      endTime: viewport.endTime + timeOffset,
      centerTime: viewport.centerTime + timeOffset,
    });

    // 更新拖拽起点为当前位置
    setDragStart({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // 不要重置 draggedEventId，这会在事件拖拽结束时处理
  };

  // 处理缩放
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    // 检查是否按下Ctrl键，只有Ctrl+滚轮才进行缩放
    if (!e.evt.ctrlKey) {
      return; // 普通滚轮不进行缩放，让用户可以正常滚动页面
    }
    
    const scaleBy = 1.1;
    const scale = e.evt.deltaY < 0 ? scaleBy : 1 / scaleBy;
    
    const timeRange = viewport.endTime - viewport.startTime;
    const newTimeRange = timeRange / scale;

    // 获取鼠标相对于Stage的坐标
    const stage = stageRef.current;
    if (!stage) return;

    const stageBox = stage.container().getBoundingClientRect();
    const relativeX = e.evt.clientX - stageBox.left;
    
    // 如果鼠标不在时间轴区域内，则不进行缩放
    if (relativeX < dynamicTimelineArea.x || relativeX > dynamicTimelineArea.x + dynamicTimelineArea.width) {
      return;
    }
    
    // 使用相对坐标计算时间
    const mouseTime = pixelToTime(relativeX);
    const newStartTime = mouseTime - (mouseTime - viewport.startTime) * (newTimeRange / timeRange);
    const newEndTime = newStartTime + newTimeRange;
    
    // 更新viewport和zoomLevel
    const baseTimeRange = 100; // 基准时间范围，可以根据项目调整
    const newZoomLevel = baseTimeRange / newTimeRange;
    
    updateViewport({
      startTime: newStartTime,
      endTime: newEndTime,
      centerTime: (newStartTime + newEndTime) / 2,
      timeRange: newTimeRange,
    });
    
    // 同步更新zoomLevel以保持一致性
    useUIStore.getState().setZoomLevel(Math.max(0.1, Math.min(5, newZoomLevel)));
  };

  const timeScales = generateTimeScales();

  return (
    <div className={`w-full h-full ${currentTheme.background.canvas.startsWith('#') ? '' : currentTheme.background.canvas}`} style={currentTheme.background.canvas.startsWith('#') ? { backgroundColor: currentTheme.background.canvas } : {}}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
        draggable={false}
      >
        {/* 背景层 */}
        <Layer>
          {/* 全画布灰色背景 - 填满整个视口 */}
          <Rect
            name="canvas-background"
            x={0}
            y={0}
            width={width}
            height={height}
            fill={currentTheme.background.canvas}
          />
          
          {/* 时间轴区域边框 */}
          <Rect
            name="timeline-border"
            x={dynamicTimelineArea.x}
            y={dynamicTimelineArea.y}
            width={dynamicTimelineArea.width}
            height={dynamicTimelineArea.height}
            fill="transparent"
            stroke={currentTheme.grid.border}
            strokeWidth={2}
          />

          {/* 轨道指示器 */}
          {Array.from({ length: totalTracks }, (_, trackIndex) => {
            const trackY = dynamicTimelineArea.y + 40 + trackIndex * (timelineConfig.trackHeight + timelineConfig.trackSpacing);
            return (
              <Group key={`track-${trackIndex}`}>
                {/* 轨道背景 */}
                <Rect
                  x={dynamicTimelineArea.x}
                  y={trackY - 2}
                  width={dynamicTimelineArea.width}
                  height={timelineConfig.trackHeight + 4}
                  fill="transparent"
                  stroke={currentTheme.grid.line}
                  strokeWidth={0.5}
                  opacity={0.3}
                  dash={[1, 3]}
                  listening={false}
          />
                {/* 轨道标签 */}
                <Text
                  x={dynamicTimelineArea.x - 20}
                  y={trackY + timelineConfig.trackHeight / 2 - 6}
                  text={`${trackIndex + 1}`}
                  fontSize={10}
                  fill={currentTheme.text.canvas}
                  opacity={0.6}
                  align="center"
                  wrap="none"
                  listening={false}
                />
              </Group>
            );
          })}

          {/* 网格线 */}
          {timeScales.map((scale, index) => (
            <Group key={`grid-${index}`}>
              <Line
                points={[scale.x, dynamicTimelineArea.y, scale.x, dynamicTimelineArea.y + dynamicTimelineArea.height]}
                stroke={currentTheme.grid.line}
                strokeWidth={1}
                dash={[...currentTheme.grid.dash]}
                listening={false}
              />
            </Group>
          ))}

          {/* 时间刻度 */}
          {timeScales.map((scale, index) => (
            <Group key={`scale-${index}`}>
              {/* 刻度线 */}
              <Line
                points={[scale.x, dynamicTimelineArea.y - 10, scale.x, dynamicTimelineArea.y + 10]}
                stroke={currentTheme.text.canvas}
                strokeWidth={2}
                listening={false}
              />
              {/* 刻度标签 */}
              <Text
                x={scale.x}
                y={dynamicTimelineArea.y - 30}
                text={scale.label}
                fontSize={12}
                fill={currentTheme.text.canvas}
                align="center"
                offsetX={15}
                wrap="none"
                listening={false}
              />
            </Group>
          ))}

          {/* 主时间轴线 */}
          <Line
            points={[dynamicTimelineArea.x, dynamicTimelineArea.y, dynamicTimelineArea.x + dynamicTimelineArea.width, dynamicTimelineArea.y]}
            stroke={currentTheme.text.canvas}
            strokeWidth={2}
            listening={false}
          />
        </Layer>

        {/* 事件层 */}
        <Layer>
          {events.map((event, index) => {
            const x = timeToPixel(event.startTime);
            const y = getEventY(event.id);
            const eventWidth = Math.max(20, timeToPixel(event.endTime || event.startTime) - x);

            // 可视区域检查 - 正在拖拽的事件始终显示
            const isBeingDragged = draggedEventId === event.id;
            
            // 添加缓冲区域，让稍微超出视窗的事件也能显示和拖拽
            const bufferZone = 100; // 100像素缓冲区
            const extendedLeft = dynamicTimelineArea.x - bufferZone;
            const extendedRight = dynamicTimelineArea.x + dynamicTimelineArea.width + bufferZone;
            
            const isInExtendedArea = !(x + eventWidth < extendedLeft || x > extendedRight);
            
            // 只有完全超出扩展区域且未被拖拽的事件才隐藏
            if (!isInExtendedArea && !isBeingDragged) {
              return null;
            }

            const colors = getEventColors(event.category);
            const isEventSelected = isSelected(event.id);

            return (
              <Group
                key={`event-${event.id}`}
                x={x}
                y={y}
                draggable={true}
                onDragStart={(e) => handleEventDragStart(event, e)}
                onDragEnd={(e) => handleEventDragEnd(event, e)}
                onContextMenu={(e) => handleEventContextMenu(event, e)}
                dragBoundFunc={(pos) => {
                  // 只限制拖拽在垂直方向，保持在当前轨道
                  // 水平方向允许自由拖拽，包括拖拽到视窗外
                  const currentTrackY = getEventY(event.id);
                  
                  return {
                    x: pos.x, // 允许在水平方向自由拖拽
                    y: currentTrackY
                  };
                }}
                opacity={isBeingDragged ? 0.7 : 1}
              >
                {/* 事件矩形 - 简化的方形设计 */}
                <Rect
                  x={0}
                  y={0}
                  width={eventWidth}
                  height={timelineConfig.eventHeight}
                  fill={isEventSelected ? colors.accent : colors.fill}
                  stroke={isEventSelected ? '#ffffff' : colors.stroke}
                  strokeWidth={isEventSelected ? 3 : 1}
                  cornerRadius={0}
                  shadowColor={isBeingDragged ? '#000000' : 'transparent'}
                  shadowBlur={isBeingDragged ? 8 : 0}
                  shadowOpacity={isBeingDragged ? 0.3 : 0}
                  shadowOffset={isBeingDragged ? { x: 2, y: 2 } : { x: 0, y: 0 }}
                  onMouseEnter={(e) => {
                    if (!isEventSelected && !isBeingDragged) {
                      const target = e.target;
                      if ('fill' in target && typeof target.fill === 'function') {
                        target.fill(colors.accent);
                        target.getLayer()?.batchDraw();
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isEventSelected && !isBeingDragged) {
                      const target = e.target;
                      if ('fill' in target && typeof target.fill === 'function') {
                        target.fill(colors.fill);
                        target.getLayer()?.batchDraw();
                      }
                    }
                  }}
                  onClick={(e) => handleEventClick(event, e)}
                  onDblClick={(e) => handleEventDoubleClick(event, e)}
                />
                
                {/* 事件标题 */}
                <Text
                  x={8}
                  y={8}
                  text={event.title}
                  fontSize={11}
                  fill="white"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontStyle="500"
                  width={eventWidth - 16}
                  ellipsis={true}
                  wrap="none"
                  listening={false}
                  opacity={isBeingDragged ? 0.8 : 1}
                />

                {/* 左侧指示条 - 替代起始点的简洁设计 */}
                <Rect
                  x={0}
                  y={0}
                  width={3}
                  height={timelineConfig.eventHeight}
                  fill={colors.accent}
                  listening={false}
                />

                {/* 右侧指示条（如果有结束时间且不同于开始时间） */}
                {event.endTime && event.endTime !== event.startTime && eventWidth > 20 && (
                  <Rect
                    x={eventWidth - 3}
                    y={0}
                    width={3}
                    height={timelineConfig.eventHeight}
                    fill={colors.accent}
                    listening={false}
                  />
                )}

                {/* 拖拽指示器 */}
                {isBeingDragged && (
                  <Rect
                    x={-2}
                    y={-2}
                    width={eventWidth + 4}
                    height={timelineConfig.eventHeight + 4}
                    stroke="#ffffff"
                    strokeWidth={2}
                    dash={[4, 4]}
                    fill="transparent"
                    listening={false}
                  />
                )}
              </Group>
            );
          })}
        </Layer>

        {/* 交互层 */}
        <Layer>
          {/* 当前时间指示器 */}
          <Line
            points={[timeToPixel(viewport.centerTime), dynamicTimelineArea.y, timeToPixel(viewport.centerTime), dynamicTimelineArea.y + dynamicTimelineArea.height]}
            stroke={currentTheme.grid.currentTime}
            strokeWidth={2}
            dash={[5, 5]}
            opacity={0.7}
            listening={false}
          />
          
          {/* 当前时间标签 */}
          <Text
            x={timeToPixel(viewport.centerTime)}
            y={dynamicTimelineArea.y - 50}
            text={`当前: ${Math.round(viewport.centerTime)}`}
            fontSize={12}
            fill={currentTheme.grid.currentTime}
            align="center"
            offsetX={25}
            fontStyle="bold"
            wrap="none"
            listening={false}
          />
        </Layer>

        {/* UI元素层 */}
        <Layer>
          {/* 图例背景 */}
          <Rect
            x={width - 180}
            y={20}
            width={160}
            height={100}
            fill={currentTheme.background.canvas}
            stroke={currentTheme.border.canvas}
            strokeWidth={2}
            cornerRadius={8}
            shadowColor="black"
            shadowBlur={4}
            shadowOpacity={0.1}
            shadowOffset={{ x: 1, y: 1 }}
            listening={false}
          />
          
          {/* 图例标题 */}
          <Text
            x={width - 170}
            y={35}
            text="事件类型"
            fontSize={12}
            fill={currentTheme.text.canvas}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontStyle="600"
            wrap="none"
            listening={false}
          />
          
          {/* 会议 */}
          <Rect x={width - 170} y={50} width={12} height={8} fill="#059669" cornerRadius={2} listening={false} />
          <Text x={width - 155} y={52} text="会议" fontSize={10} fill={currentTheme.text.canvas} fontFamily="system-ui" wrap="none" listening={false} />
          
          {/* 任务 */}
          <Rect x={width - 170} y={65} width={12} height={8} fill="#2563eb" cornerRadius={2} listening={false} />
          <Text x={width - 155} y={67} text="任务" fontSize={10} fill={currentTheme.text.canvas} fontFamily="system-ui" wrap="none" listening={false} />
          
          {/* 设计 */}
          <Rect x={width - 110} y={50} width={12} height={8} fill="#dc2626" cornerRadius={2} listening={false} />
          <Text x={width - 95} y={52} text="设计" fontSize={10} fill={currentTheme.text.canvas} fontFamily="system-ui" wrap="none" listening={false} />
          
          {/* 开发 */}
          <Rect x={width - 110} y={65} width={12} height={8} fill="#7c3aed" cornerRadius={2} listening={false} />
          <Text x={width - 95} y={67} text="开发" fontSize={10} fill={currentTheme.text.canvas} fontFamily="system-ui" wrap="none" listening={false} />
          
          {/* 测试 */}
          <Rect x={width - 170} y={80} width={12} height={8} fill="#ea580c" cornerRadius={2} listening={false} />
          <Text x={width - 155} y={82} text="测试" fontSize={10} fill={currentTheme.text.canvas} fontFamily="system-ui" wrap="none" listening={false} />
        </Layer>
      </Stage>
    </div>
  );
}; 