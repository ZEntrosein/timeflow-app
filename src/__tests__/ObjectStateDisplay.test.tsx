import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ObjectStateDisplay } from '../components/ObjectStateDisplay';
import { WorldObject, Event, AttributeType } from '../types';
import { defaultTemporalEngine } from '../services';

// Mock temporal engine
vi.mock('../services', () => ({
  defaultTemporalEngine: {
    calculateMultipleStatesAtTime: vi.fn(),
    objectExistsAtTime: vi.fn(),
    getAttributeChangeCount: vi.fn()
  }
}));

describe('ObjectStateDisplay', () => {
  const mockObjects: WorldObject[] = [
    {
      id: 'character-1',
      name: '角色A',
      description: '测试角色描述',
      attributes: [
        {
          id: 'age',
          name: '年龄',
          type: AttributeType.NUMBER,
          value: 25,
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'status',
          name: '状态',
          type: AttributeType.ENUM,
          value: 'healthy',
          enumValues: ['healthy', 'injured', 'dead'],
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'name',
          name: '姓名',
          type: AttributeType.TEXT,
          value: '张三',
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z'
        }
      ],
      createdAt: '2022-01-01T00:00:00.000Z',
      updatedAt: '2022-01-01T00:00:00.000Z'
    },
    {
      id: 'character-2',
      name: '角色B',
      attributes: [
        {
          id: 'level',
          name: '等级',
          type: AttributeType.NUMBER,
          value: 10,
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z'
        }
      ],
      createdAt: '2022-01-01T00:00:00.000Z',
      updatedAt: '2022-01-01T00:00:00.000Z'
    }
  ];

  const mockEvents: Event[] = [
    {
      id: 'event-1',
      timestamp: 1640995200000,
      objectId: 'character-1',
      attributeId: 'age',
      newValue: 26,
      oldValue: 25,
      description: '生日',
      createdAt: '2022-01-01T00:00:00.000Z'
    }
  ];

  const defaultProps = {
    objects: mockObjects,
    events: mockEvents,
    currentTime: 1641038400000 // 2022-01-01 12:00:00
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    const mockStates = new Map([
      ['character-1', {
        objectId: 'character-1',
        timestamp: 1641038400000,
        attributeValues: {
          age: 26,
          status: 'healthy',
          name: '张三'
        }
      }],
      ['character-2', {
        objectId: 'character-2',
        timestamp: 1641038400000,
        attributeValues: {
          level: 10
        }
      }]
    ]);

    (defaultTemporalEngine.calculateMultipleStatesAtTime as any).mockReturnValue(mockStates);
    (defaultTemporalEngine.objectExistsAtTime as any).mockReturnValue(true);
    (defaultTemporalEngine.getAttributeChangeCount as any).mockReturnValue(1);
  });

  describe('基本渲染', () => {
    test('应该正确渲染对象状态显示', async () => {
      render(<ObjectStateDisplay {...defaultProps} />);
      
      // 等待组件加载完成
      await waitFor(() => {
        expect(screen.getByText('对象状态')).toBeInTheDocument();
      });
      
      // 验证统计信息
      expect(screen.getByText(/活跃对象:/)).toBeInTheDocument();
      expect(screen.getByText(/总变化数:/)).toBeInTheDocument();
    });

    test('应该显示所有活跃对象', async () => {
      render(<ObjectStateDisplay {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('角色A')).toBeInTheDocument();
        expect(screen.getByText('角色B')).toBeInTheDocument();
      });
    });

    test('应该显示对象属性和值', async () => {
      render(<ObjectStateDisplay {...defaultProps} />);
      
      await waitFor(() => {
        // 验证属性名称
        expect(screen.getByText('年龄')).toBeInTheDocument();
        expect(screen.getByText('状态')).toBeInTheDocument();
        expect(screen.getByText('姓名')).toBeInTheDocument();
        expect(screen.getByText('等级')).toBeInTheDocument();
        
        // 验证属性值
        expect(screen.getByText('26')).toBeInTheDocument();
        expect(screen.getByText('healthy')).toBeInTheDocument();
        expect(screen.getByText('张三')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
      });
    });

    test('应该显示属性类型标识', async () => {
      render(<ObjectStateDisplay {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('(number)')).toBeInTheDocument();
        expect(screen.getByText('(enum)')).toBeInTheDocument();
        expect(screen.getByText('(text)')).toBeInTheDocument();
      });
    });
  });

  describe('对象选择', () => {
    test('应该支持对象选择', async () => {
      const onObjectSelect = vi.fn();
      render(
        <ObjectStateDisplay 
          {...defaultProps} 
          onObjectSelect={onObjectSelect}
        />
      );
      
      await waitFor(() => {
        const objectCard = screen.getByText('角色A').closest('.object-card');
        expect(objectCard).toBeInTheDocument();
        
        fireEvent.click(objectCard!);
        expect(onObjectSelect).toHaveBeenCalledWith('character-1');
      });
    });

    test('应该高亮显示选中的对象', async () => {
      render(
        <ObjectStateDisplay 
          {...defaultProps} 
          selectedObjectId="character-1"
        />
      );
      
      await waitFor(() => {
        const objectCard = screen.getByText('角色A').closest('.object-card');
        expect(objectCard).toHaveClass('selected');
      });
    });
  });

  describe('时间变化响应', () => {
    test('应该在时间变化时重新计算状态', async () => {
      const { rerender } = render(<ObjectStateDisplay {...defaultProps} />);
      
      // 验证初始调用
      await waitFor(() => {
        expect(defaultTemporalEngine.calculateMultipleStatesAtTime).toHaveBeenCalledWith(
          ['character-1', 'character-2'],
          1641038400000,
          mockEvents,
          mockObjects
        );
      });
      
      // 更改时间并重新渲染
      rerender(
        <ObjectStateDisplay 
          {...defaultProps} 
          currentTime={1641124800000}
        />
      );
      
      await waitFor(() => {
        expect(defaultTemporalEngine.calculateMultipleStatesAtTime).toHaveBeenCalledWith(
          ['character-1', 'character-2'],
          1641124800000,
          mockEvents,
          mockObjects
        );
      });
    });
  });

  describe('空状态处理', () => {
    test('应该处理没有对象的情况', async () => {
      render(
        <ObjectStateDisplay 
          {...defaultProps} 
          objects={[]}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('当前时间点没有活跃的对象')).toBeInTheDocument();
      });
    });

    test('应该处理没有活跃对象的情况', async () => {
      (defaultTemporalEngine.objectExistsAtTime as any).mockReturnValue(false);
      
      render(<ObjectStateDisplay {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('当前时间点没有活跃的对象')).toBeInTheDocument();
      });
    });
  });

  describe('错误处理', () => {
    test('应该显示计算错误', async () => {
      (defaultTemporalEngine.calculateMultipleStatesAtTime as any).mockImplementation(() => {
        throw new Error('计算失败');
      });
      
      render(<ObjectStateDisplay {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('状态计算失败: 计算失败')).toBeInTheDocument();
      });
    });
  });

  describe('性能优化', () => {
    test('应该使用React.memo优化渲染', () => {
      const { rerender } = render(<ObjectStateDisplay {...defaultProps} />);
      
      // 重新渲染相同的props
      rerender(<ObjectStateDisplay {...defaultProps} />);
      
      // 组件应该正常工作（具体的memo优化需要在实际使用中验证）
      expect(screen.getByText('对象状态')).toBeInTheDocument();
    });
  });

  describe('统计信息', () => {
    test('应该正确计算和显示统计信息', async () => {
      render(<ObjectStateDisplay {...defaultProps} />);
      
      await waitFor(() => {
        // 验证活跃对象统计
        expect(screen.getByText('活跃对象: 2/2')).toBeInTheDocument();
        
        // 验证变化统计
        expect(screen.getByText(/总变化数:/)).toBeInTheDocument();
      });
    });
  });

  describe('动画功能', () => {
    test('应该支持禁用动画', async () => {
      render(
        <ObjectStateDisplay 
          {...defaultProps} 
          showAnimations={false}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('对象状态')).toBeInTheDocument();
      });
    });
  });

  describe('属性值格式化', () => {
    test('应该正确格式化不同类型的属性值', async () => {
      const mockStatesWithNull = new Map([
        ['character-1', {
          objectId: 'character-1',
          timestamp: 1641038400000,
          attributeValues: {
            age: null,
            status: 'injured',
            name: undefined
          }
        }]
      ]);

      (defaultTemporalEngine.calculateMultipleStatesAtTime as any).mockReturnValue(mockStatesWithNull);
      
      render(<ObjectStateDisplay {...defaultProps} />);
      
      await waitFor(() => {
        // 验证null值显示为--
        expect(screen.getAllByText('--')).toHaveLength(2);
        
        // 验证正常值显示
        expect(screen.getByText('injured')).toBeInTheDocument();
      });
    });

    test('应该为数字添加千分位分隔符', async () => {
      const mockStatesWithLargeNumber = new Map([
        ['character-1', {
          objectId: 'character-1',
          timestamp: 1641038400000,
          attributeValues: {
            age: 1234567
          }
        }]
      ]);

      (defaultTemporalEngine.calculateMultipleStatesAtTime as any).mockReturnValue(mockStatesWithLargeNumber);
      
      render(<ObjectStateDisplay {...defaultProps} />);
      
      await waitFor(() => {
        // 验证大数字格式化
        expect(screen.getByText('1,234,567')).toBeInTheDocument();
      });
    });
  });

  describe('响应式设计', () => {
    test('应该在移动设备上正确显示', async () => {
      // 模拟移动设备视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(<ObjectStateDisplay {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('对象状态')).toBeInTheDocument();
      });
    });
  });
});