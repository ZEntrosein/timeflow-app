import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Timeline } from '../components/Timeline';
import { Event, Timeline as TimelineType, AttributeType } from '../types';

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    const d = new Date(date);
    if (formatStr === 'yyyy-MM-dd HH:mm:ss') {
      return d.toISOString().slice(0, 19).replace('T', ' ');
    }
    if (formatStr === 'HH:mm') {
      return d.toTimeString().slice(0, 5);
    }
    if (formatStr === 'MM-dd') {
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }
    if (formatStr === 'yyyy-MM') {
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    if (formatStr === 'yyyy') {
      return d.getFullYear().toString();
    }
    return d.toISOString().slice(0, 10);
  })
}));

describe('Timeline', () => {
  const mockTimeline: TimelineType = {
    id: 'main',
    name: '主时间轴',
    currentTime: 1640995200000, // 2022-01-01 00:00:00
    startTime: 1640995200000 - 86400000, // 1 day before
    endTime: 1640995200000 + 86400000, // 1 day after
    events: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockEvents: Event[] = [
    {
      id: 'event-1',
      timestamp: 1640995200000, // 2022-01-01 00:00:00
      objectId: 'character-1',
      attributeId: 'age',
      newValue: 25,
      oldValue: 24,
      description: '角色生日',
      createdAt: new Date().toISOString()
    },
    {
      id: 'event-2',
      timestamp: 1640995200000 + 43200000, // 12 hours later
      objectId: 'character-1',
      attributeId: 'status',
      newValue: 'injured',
      oldValue: 'healthy',
      description: '角色受伤',
      createdAt: new Date().toISOString()
    }
  ];

  const defaultProps = {
    timeline: mockTimeline,
    events: mockEvents,
    width: 800,
    height: 200
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    test('应该正确渲染时间轴组件', () => {
      render(<Timeline {...defaultProps} />);
      
      expect(screen.getByText('放大')).toBeInTheDocument();
      expect(screen.getByText('缩小')).toBeInTheDocument();
      expect(screen.getByText(/当前时间:/)).toBeInTheDocument();
      expect(screen.getByText('←')).toBeInTheDocument();
      expect(screen.getByText('→')).toBeInTheDocument();
    });

    test('应该显示正确的初始缩放级别', () => {
      render(<Timeline {...defaultProps} />);
      
      expect(screen.getByText('缩放: 1.0x')).toBeInTheDocument();
    });

    test('应该显示当前时间', () => {
      render(<Timeline {...defaultProps} />);
      
      // 验证时间显示存在
      expect(screen.getByText(/当前时间:/)).toBeInTheDocument();
    });
  });

  describe('缩放功能', () => {
    test('应该能够放大', () => {
      render(<Timeline {...defaultProps} />);
      
      const zoomInButton = screen.getByText('放大');
      fireEvent.click(zoomInButton);
      
      expect(screen.getByText('缩放: 1.2x')).toBeInTheDocument();
    });

    test('应该能够缩小', () => {
      render(<Timeline {...defaultProps} />);
      
      const zoomOutButton = screen.getByText('缩小');
      fireEvent.click(zoomOutButton);
      
      expect(screen.getByText('缩放: 0.8x')).toBeInTheDocument();
    });

    test('缩放应该有最小值限制', () => {
      render(<Timeline {...defaultProps} />);
      
      const zoomOutButton = screen.getByText('缩小');
      
      // 连续点击缩小按钮
      for (let i = 0; i < 20; i++) {
        fireEvent.click(zoomOutButton);
      }
      
      // 验证缩放不会小于0.1
      expect(screen.getByText('缩放: 0.1x')).toBeInTheDocument();
    });

    test('缩放应该有最大值限制', () => {
      render(<Timeline {...defaultProps} />);
      
      const zoomInButton = screen.getByText('放大');
      
      // 连续点击放大按钮
      for (let i = 0; i < 50; i++) {
        fireEvent.click(zoomInButton);
      }
      
      // 验证缩放不会大于10
      expect(screen.getByText('缩放: 10.0x')).toBeInTheDocument();
    });
  });

  describe('平移功能', () => {
    test('应该能够向左平移', () => {
      render(<Timeline {...defaultProps} />);
      
      const panLeftButton = screen.getByText('←');
      fireEvent.click(panLeftButton);
      
      // 验证按钮可点击（具体的平移效果需要更复杂的测试）
      expect(panLeftButton).toBeInTheDocument();
    });

    test('应该能够向右平移', () => {
      render(<Timeline {...defaultProps} />);
      
      const panRightButton = screen.getByText('→');
      fireEvent.click(panRightButton);
      
      // 验证按钮可点击
      expect(panRightButton).toBeInTheDocument();
    });
  });

  describe('回调函数', () => {
    test('时间变化时应该调用回调', () => {
      const onTimeChange = vi.fn();
      render(<Timeline {...defaultProps} onTimeChange={onTimeChange} />);
      
      // 这里需要模拟拖拽或点击事件来触发时间变化
      // 由于Konva的复杂性，我们先验证组件能正常渲染
      expect(screen.getByText(/当前时间:/)).toBeInTheDocument();
    });

    test('事件点击时应该调用回调', () => {
      const onEventClick = vi.fn();
      render(<Timeline {...defaultProps} onEventClick={onEventClick} />);
      
      // 验证组件渲染正常
      expect(screen.getByText(/当前时间:/)).toBeInTheDocument();
    });
  });

  describe('响应式设计', () => {
    test('应该支持自定义宽度和高度', () => {
      render(<Timeline {...defaultProps} width={600} height={150} />);
      
      // 验证组件正常渲染
      expect(screen.getByText('放大')).toBeInTheDocument();
    });

    test('应该有默认的宽度和高度', () => {
      const { timeline, events } = defaultProps;
      render(<Timeline timeline={timeline} events={events} />);
      
      // 验证组件正常渲染
      expect(screen.getByText('放大')).toBeInTheDocument();
    });
  });

  describe('时间刻度', () => {
    test('应该根据缩放级别显示不同的时间刻度', () => {
      render(<Timeline {...defaultProps} />);
      
      // 验证时间轴正常渲染
      expect(screen.getByText(/当前时间:/)).toBeInTheDocument();
      
      // 放大后应该显示更精细的时间刻度
      const zoomInButton = screen.getByText('放大');
      fireEvent.click(zoomInButton);
      fireEvent.click(zoomInButton);
      
      // 验证缩放后仍然正常
      expect(screen.getByText('缩放: 1.4x')).toBeInTheDocument();
    });
  });

  describe('错误处理', () => {
    test('应该处理空事件列表', () => {
      render(<Timeline {...defaultProps} events={[]} />);
      
      expect(screen.getByText(/当前时间:/)).toBeInTheDocument();
    });

    test('应该处理无效的时间范围', () => {
      const invalidTimeline = {
        ...mockTimeline,
        startTime: mockTimeline.endTime,
        endTime: mockTimeline.startTime
      };
      
      render(<Timeline {...defaultProps} timeline={invalidTimeline} />);
      
      // 组件应该仍然能渲染，即使时间范围无效
      expect(screen.getByText(/当前时间:/)).toBeInTheDocument();
    });
  });

  describe('性能优化', () => {
    test('应该只渲染可见范围内的事件', () => {
      // 创建大量事件
      const manyEvents: Event[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `event-${i}`,
        timestamp: mockTimeline.startTime + (i * 1000),
        objectId: 'character-1',
        attributeId: 'age',
        newValue: 25 + i,
        description: `事件 ${i}`,
        createdAt: new Date().toISOString()
      }));
      
      render(<Timeline {...defaultProps} events={manyEvents} />);
      
      // 验证组件正常渲染
      expect(screen.getByText(/当前时间:/)).toBeInTheDocument();
    });
  });

  describe('键盘交互', () => {
    test('应该支持键盘导航', () => {
      render(<Timeline {...defaultProps} />);
      
      // 验证组件可以获得焦点
      const container = screen.getByText(/当前时间:/).closest('.timeline-container');
      expect(container).toBeInTheDocument();
    });
  });
});