import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventManager } from '../components/EventManager';
import { defaultStorageService } from '../services';
import { WorldObject, Event, AttributeType } from '../types';

// Mock storage service
vi.mock('../services', () => ({
  defaultStorageService: {
    initialize: vi.fn(),
    getAllObjects: vi.fn(),
    loadEvents: vi.fn(),
    saveEvent: vi.fn(),
    deleteEvent: vi.fn()
  }
}));

describe('EventManager', () => {
  const mockObjects: WorldObject[] = [
    {
      id: 'character-1',
      name: '测试角色',
      attributes: [
        {
          id: 'age',
          name: '年龄',
          type: AttributeType.NUMBER,
          value: 25,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'status',
          name: '状态',
          type: AttributeType.ENUM,
          value: 'healthy',
          enumValues: ['healthy', 'injured', 'dead'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'name',
          name: '姓名',
          type: AttributeType.TEXT,
          value: '张三',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const mockEvents: Event[] = [
    {
      id: 'event-1',
      timestamp: Date.now(),
      objectId: 'character-1',
      attributeId: 'age',
      newValue: 26,
      oldValue: 25,
      description: '年龄增长',
      createdAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    (defaultStorageService.initialize as any).mockResolvedValue(undefined);
    (defaultStorageService.getAllObjects as any).mockResolvedValue(mockObjects);
    (defaultStorageService.loadEvents as any).mockResolvedValue(mockEvents);
    (defaultStorageService.saveEvent as any).mockResolvedValue(undefined);
    (defaultStorageService.deleteEvent as any).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('初始化和数据加载', () => {
    test('应该正确初始化并加载数据', async () => {
      render(<EventManager />);
      
      // 等待加载完成
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      // 验证存储服务被调用
      expect(defaultStorageService.initialize).toHaveBeenCalled();
      expect(defaultStorageService.getAllObjects).toHaveBeenCalled();
      expect(defaultStorageService.loadEvents).toHaveBeenCalled();
      
      // 验证UI元素
      expect(screen.getByText('事件管理')).toBeInTheDocument();
      expect(screen.getByText('创建新事件')).toBeInTheDocument();
      expect(screen.getByText('事件列表')).toBeInTheDocument();
    });

    test('应该显示加载状态', () => {
      render(<EventManager />);
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    test('应该处理初始化错误', async () => {
      const errorMessage = '数据库连接失败';
      (defaultStorageService.initialize as any).mockRejectedValue(new Error(errorMessage));
      
      render(<EventManager />);
      
      await waitFor(() => {
        expect(screen.getByText(`加载数据失败: ${errorMessage}`)).toBeInTheDocument();
      });
    });
  });

  describe('事件表单', () => {
    test('应该显示对象选择下拉框', async () => {
      render(<EventManager />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      const objectSelect = screen.getByLabelText('选择对象:');
      expect(objectSelect).toBeInTheDocument();
      expect(screen.getByText('测试角色')).toBeInTheDocument();
    });

    test('选择对象后应该显示属性选择', async () => {
      render(<EventManager />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      const objectSelect = screen.getByLabelText('选择对象:');
      fireEvent.change(objectSelect, { target: { value: 'character-1' } });
      
      await waitFor(() => {
        expect(screen.getByLabelText('选择属性:')).toBeInTheDocument();
        expect(screen.getByText('年龄 (number)')).toBeInTheDocument();
        expect(screen.getByText('状态 (enum)')).toBeInTheDocument();
        expect(screen.getByText('姓名 (text)')).toBeInTheDocument();
      });
    });

    test('选择数字属性应该显示数字输入框', async () => {
      render(<EventManager />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      // 选择对象
      const objectSelect = screen.getByLabelText('选择对象:');
      fireEvent.change(objectSelect, { target: { value: 'character-1' } });
      
      // 选择数字属性
      await waitFor(() => {
        const attributeSelect = screen.getByLabelText('选择属性:');
        fireEvent.change(attributeSelect, { target: { value: 'age' } });
      });
      
      await waitFor(() => {
        const valueInput = screen.getByPlaceholderText('输入数字值');
        expect(valueInput).toBeInTheDocument();
        expect(valueInput).toHaveAttribute('type', 'number');
      });
    });

    test('选择枚举属性应该显示选择框', async () => {
      render(<EventManager />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      // 选择对象
      const objectSelect = screen.getByLabelText('选择对象:');
      fireEvent.change(objectSelect, { target: { value: 'character-1' } });
      
      // 选择枚举属性
      await waitFor(() => {
        const attributeSelect = screen.getByLabelText('选择属性:');
        fireEvent.change(attributeSelect, { target: { value: 'status' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('选择枚举值')).toBeInTheDocument();
        expect(screen.getByText('healthy')).toBeInTheDocument();
        expect(screen.getByText('injured')).toBeInTheDocument();
        expect(screen.getByText('dead')).toBeInTheDocument();
      });
    });

    test('选择文本属性应该显示文本输入框', async () => {
      render(<EventManager />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      // 选择对象
      const objectSelect = screen.getByLabelText('选择对象:');
      fireEvent.change(objectSelect, { target: { value: 'character-1' } });
      
      // 选择文本属性
      await waitFor(() => {
        const attributeSelect = screen.getByLabelText('选择属性:');
        fireEvent.change(attributeSelect, { target: { value: 'name' } });
      });
      
      await waitFor(() => {
        const valueInput = screen.getByPlaceholderText('输入文本值');
        expect(valueInput).toBeInTheDocument();
        expect(valueInput).toHaveAttribute('type', 'text');
      });
    });
  });

  describe('事件创建', () => {
    test('应该能创建数字类型事件', async () => {
      const onEventCreated = vi.fn();
      render(<EventManager onEventCreated={onEventCreated} />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      // 填写表单
      fireEvent.change(screen.getByLabelText('选择对象:'), { target: { value: 'character-1' } });
      
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('选择属性:'), { target: { value: 'age' } });
      });
      
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('输入数字值'), { target: { value: '30' } });
      });
      
      fireEvent.change(screen.getByPlaceholderText('描述这个事件的内容...'), { 
        target: { value: '角色生日' } 
      });
      
      // 提交表单
      fireEvent.click(screen.getByText('创建事件'));
      
      await waitFor(() => {
        expect(defaultStorageService.saveEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            objectId: 'character-1',
            attributeId: 'age',
            newValue: 30,
            description: '角色生日'
          })
        );
      });
      
      expect(onEventCreated).toHaveBeenCalled();
    });

    test('应该能创建枚举类型事件', async () => {
      render(<EventManager />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      // 填写表单
      fireEvent.change(screen.getByLabelText('选择对象:'), { target: { value: 'character-1' } });
      
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('选择属性:'), { target: { value: 'status' } });
      });
      
      await waitFor(() => {
        fireEvent.change(screen.getByDisplayValue('选择枚举值'), { target: { value: 'injured' } });
      });
      
      // 提交表单
      fireEvent.click(screen.getByText('创建事件'));
      
      await waitFor(() => {
        expect(defaultStorageService.saveEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            objectId: 'character-1',
            attributeId: 'status',
            newValue: 'injured'
          })
        );
      });
    });

    test('应该处理表单验证错误', async () => {
      render(<EventManager />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      // 不选择对象和属性直接提交
      fireEvent.click(screen.getByText('创建事件'));
      
      await waitFor(() => {
        expect(screen.getByText('请选择对象和属性')).toBeInTheDocument();
      });
    });

    test('应该处理数字验证错误', async () => {
      render(<EventManager />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      // 选择数字属性但输入非数字值
      fireEvent.change(screen.getByLabelText('选择对象:'), { target: { value: 'character-1' } });
      
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('选择属性:'), { target: { value: 'age' } });
      });
      
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('输入数字值'), { target: { value: 'abc' } });
      });
      
      fireEvent.click(screen.getByText('创建事件'));
      
      await waitFor(() => {
        expect(screen.getByText('数字类型属性需要输入有效数字')).toBeInTheDocument();
      });
    });

    test('应该处理存储错误', async () => {
      const errorMessage = '保存失败';
      (defaultStorageService.saveEvent as any).mockRejectedValue(new Error(errorMessage));
      
      render(<EventManager />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      // 填写有效表单
      fireEvent.change(screen.getByLabelText('选择对象:'), { target: { value: 'character-1' } });
      
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('选择属性:'), { target: { value: 'age' } });
      });
      
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('输入数字值'), { target: { value: '30' } });
      });
      
      fireEvent.click(screen.getByText('创建事件'));
      
      await waitFor(() => {
        expect(screen.getByText(`创建事件失败: ${errorMessage}`)).toBeInTheDocument();
      });
    });
  });

  describe('事件列表', () => {
    test('应该显示事件列表', async () => {
      render(<EventManager />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      // 验证事件显示
      expect(screen.getByText('测试角色')).toBeInTheDocument();
      expect(screen.getByText('年龄增长')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument(); // 旧值
      expect(screen.getByText('26')).toBeInTheDocument(); // 新值
    });

    test('应该能删除事件', async () => {
      const onEventDeleted = vi.fn();
      render(<EventManager onEventDeleted={onEventDeleted} />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      // 点击删除按钮
      fireEvent.click(screen.getByText('删除'));
      
      await waitFor(() => {
        expect(defaultStorageService.deleteEvent).toHaveBeenCalledWith('event-1');
      });
      
      expect(onEventDeleted).toHaveBeenCalledWith('event-1');
    });

    test('没有事件时应该显示空状态', async () => {
      (defaultStorageService.loadEvents as any).mockResolvedValue([]);
      
      render(<EventManager />);
      
      await waitFor(() => {
        expect(screen.getByText('暂无事件')).toBeInTheDocument();
      });
    });
  });

  describe('回调函数', () => {
    test('应该在事件创建时调用回调', async () => {
      const onEventCreated = vi.fn();
      render(<EventManager onEventCreated={onEventCreated} />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      // 创建事件
      fireEvent.change(screen.getByLabelText('选择对象:'), { target: { value: 'character-1' } });
      
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText('选择属性:'), { target: { value: 'age' } });
      });
      
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('输入数字值'), { target: { value: '30' } });
      });
      
      fireEvent.click(screen.getByText('创建事件'));
      
      await waitFor(() => {
        expect(onEventCreated).toHaveBeenCalledWith(expect.objectContaining({
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 30
        }));
      });
    });

    test('应该在事件删除时调用回调', async () => {
      const onEventDeleted = vi.fn();
      render(<EventManager onEventDeleted={onEventDeleted} />);
      
      await waitFor(() => {
        expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('删除'));
      
      await waitFor(() => {
        expect(onEventDeleted).toHaveBeenCalledWith('event-1');
      });
    });
  });
});