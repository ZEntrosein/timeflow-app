import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportManager } from '../components/ExportManager';
import { WorldObject, Event, Timeline, AttributeType } from '../types';
import { defaultStorageService } from '../services';

// Mock storage service
vi.mock('../services', () => ({
  defaultStorageService: {
    initialize: vi.fn(),
    saveProject: vi.fn(),
    loadProject: vi.fn()
  }
}));

// Mock file download
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
global.URL = {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL
} as any;

// Mock file reader
class MockFileReader {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  result: string | ArrayBuffer | null = null;

  readAsText(file: Blob) {
    setTimeout(() => {
      if (this.onload) {
        this.result = '{"test": "data"}';
        this.onload({ target: this } as any);
      }
    }, 10);
  }
}

global.FileReader = MockFileReader as any;

describe('ExportManager', () => {
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
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z'
        }
      ],
      category: 'Character',
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

  const mockTimeline: Timeline = {
    id: 'main',
    name: '主时间轴',
    currentTime: 1640995200000,
    startTime: 1640995200000 - 86400000,
    endTime: 1640995200000 + 86400000,
    events: mockEvents,
    createdAt: '2022-01-01T00:00:00.000Z',
    updatedAt: '2022-01-01T00:00:00.000Z'
  };

  const defaultProps = {
    objects: mockObjects,
    events: mockEvents,
    timeline: mockTimeline
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
    
    // Mock DOM methods
    document.createElement = vi.fn().mockImplementation((tagName) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
          style: {}
        };
      }
      return {};
    });
    
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  describe('基本渲染', () => {
    test('应该正确渲染导出管理器', () => {
      render(<ExportManager {...defaultProps} />);
      
      expect(screen.getByText('数据导出和项目管理')).toBeInTheDocument();
      expect(screen.getByText('项目统计')).toBeInTheDocument();
      expect(screen.getByText('导出项目')).toBeInTheDocument();
      expect(screen.getByText('导入项目')).toBeInTheDocument();
    });

    test('应该显示项目统计信息', () => {
      render(<ExportManager {...defaultProps} />);
      
      expect(screen.getByText('1')).toBeInTheDocument(); // 对象数量
      expect(screen.getByText('对象')).toBeInTheDocument();
      expect(screen.getByText('事件')).toBeInTheDocument();
      expect(screen.getByText('属性')).toBeInTheDocument();
    });

    test('应该显示导出和导入按钮', () => {
      render(<ExportManager {...defaultProps} />);
      
      expect(screen.getByText('📥 导出为JSON文件')).toBeInTheDocument();
      expect(screen.getByText('💾 保存到本地存储')).toBeInTheDocument();
      expect(screen.getByText('📤 从JSON文件导入')).toBeInTheDocument();
      expect(screen.getByText('📂 从本地存储导入')).toBeInTheDocument();
    });
  });

  describe('项目元数据管理', () => {
    test('应该能显示和隐藏元数据表单', () => {
      render(<ExportManager {...defaultProps} />);
      
      const toggleButton = screen.getByText('编辑 项目信息');
      fireEvent.click(toggleButton);
      
      expect(screen.getByLabelText('项目名称 *')).toBeInTheDocument();
      expect(screen.getByLabelText('版本号')).toBeInTheDocument();
      expect(screen.getByLabelText('项目描述')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('隐藏 项目信息'));
      expect(screen.queryByLabelText('项目名称 *')).not.toBeInTheDocument();
    });

    test('应该能编辑项目元数据', () => {
      render(<ExportManager {...defaultProps} />);
      
      const toggleButton = screen.getByText('编辑 项目信息');
      fireEvent.click(toggleButton);
      
      const nameInput = screen.getByLabelText('项目名称 *');
      fireEvent.change(nameInput, { target: { value: '新项目名称' } });
      
      expect(nameInput).toHaveValue('新项目名称');
    });
  });

  describe('JSON文件导出', () => {
    test('应该能导出JSON文件', async () => {
      render(<ExportManager {...defaultProps} />);
      
      const exportButton = screen.getByText('📥 导出为JSON文件');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
        expect(document.createElement).toHaveBeenCalledWith('a');
      });
    });

    test('应该在没有数据时禁用导出按钮', () => {
      render(<ExportManager {...defaultProps} objects={[]} />);
      
      const exportButton = screen.getByText('📥 导出为JSON文件');
      expect(exportButton).toBeDisabled();
    });

    test('应该在导出过程中显示加载状态', async () => {
      render(<ExportManager {...defaultProps} />);
      
      const exportButton = screen.getByText('📥 导出为JSON文件');
      fireEvent.click(exportButton);
      
      // 短暂检查加载状态
      expect(screen.getByText('导出中...')).toBeInTheDocument();
    });
  });

  describe('存储服务导出', () => {
    test('应该能保存到本地存储', async () => {
      (defaultStorageService.initialize as any).mockResolvedValue(undefined);
      (defaultStorageService.saveProject as any).mockResolvedValue(undefined);
      
      render(<ExportManager {...defaultProps} />);
      
      const saveButton = screen.getByText('💾 保存到本地存储');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(defaultStorageService.initialize).toHaveBeenCalled();
        expect(defaultStorageService.saveProject).toHaveBeenCalled();
      });
    });

    test('应该处理保存错误', async () => {
      (defaultStorageService.initialize as any).mockRejectedValue(new Error('保存失败'));
      
      render(<ExportManager {...defaultProps} />);
      
      const saveButton = screen.getByText('💾 保存到本地存储');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/保存失败/)).toBeInTheDocument();
      });
    });
  });

  describe('文件导入', () => {
    test('应该能处理文件选择', async () => {
      const onImport = vi.fn();
      render(<ExportManager {...defaultProps} onImport={onImport} />);
      
      const importButton = screen.getByText('📤 从JSON文件导入');
      fireEvent.click(importButton);
      
      // 模拟文件选择
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const mockFile = new File(['{"test": "data"}'], 'test.json', { type: 'application/json' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [mockFile],
        writable: false,
      });
      
      fireEvent.change(fileInput);
      
      // 等待文件读取完成
      await waitFor(() => {
        // 由于我们的mock返回无效JSON，会显示错误
        expect(screen.getByText(/导入失败/)).toBeInTheDocument();
      });
    });
  });

  describe('存储服务导入', () => {
    test('应该能从存储服务导入', async () => {
      const mockProjectData = {
        id: 'test-project',
        name: '测试项目',
        description: '测试描述',
        version: '1.0.0',
        objects: mockObjects,
        timeline: mockTimeline,
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-01T00:00:00.000Z'
      };
      
      (defaultStorageService.initialize as any).mockResolvedValue(undefined);
      (defaultStorageService.loadProject as any).mockResolvedValue(mockProjectData);
      
      // Mock window.prompt
      global.prompt = vi.fn().mockReturnValue('test-project');
      
      const onImport = vi.fn();
      render(<ExportManager {...defaultProps} onImport={onImport} />);
      
      const importButton = screen.getByText('📂 从本地存储导入');
      fireEvent.click(importButton);
      
      await waitFor(() => {
        expect(defaultStorageService.loadProject).toHaveBeenCalledWith('test-project');
        expect(onImport).toHaveBeenCalledWith(mockProjectData);
      });
    });

    test('应该处理导入错误', async () => {
      (defaultStorageService.initialize as any).mockRejectedValue(new Error('加载失败'));
      global.prompt = vi.fn().mockReturnValue('test-project');
      
      render(<ExportManager {...defaultProps} />);
      
      const importButton = screen.getByText('📂 从本地存储导入');
      fireEvent.click(importButton);
      
      await waitFor(() => {
        expect(screen.getByText(/导入失败/)).toBeInTheDocument();
      });
    });
  });

  describe('回调函数', () => {
    test('应该在导出时调用回调', async () => {
      const onExport = vi.fn();
      render(<ExportManager {...defaultProps} onExport={onExport} />);
      
      const exportButton = screen.getByText('📥 导出为JSON文件');
      fireEvent.click(exportButton);
      
      await waitFor(() => {
        expect(onExport).toHaveBeenCalled();
      });
    });
  });

  describe('消息管理', () => {
    test('应该能清除错误消息', async () => {
      (defaultStorageService.initialize as any).mockRejectedValue(new Error('测试错误'));
      
      render(<ExportManager {...defaultProps} />);
      
      const saveButton = screen.getByText('💾 保存到本地存储');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/测试错误/)).toBeInTheDocument();
      });
      
      const clearButton = screen.getByText('×');
      fireEvent.click(clearButton);
      
      expect(screen.queryByText(/测试错误/)).not.toBeInTheDocument();
    });
  });

  describe('响应式设计', () => {
    test('应该在移动设备上正确显示', () => {
      // 模拟移动设备视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(<ExportManager {...defaultProps} />);
      
      expect(screen.getByText('数据导出和项目管理')).toBeInTheDocument();
    });
  });

  describe('边界条件', () => {
    test('应该处理空数据', () => {
      render(<ExportManager objects={[]} events={[]} timeline={mockTimeline} />);
      
      expect(screen.getByText('0')).toBeInTheDocument(); // 对象数量为0
    });

    test('应该处理缺少可选属性的对象', () => {
      const objectsWithoutCategory = [{
        ...mockObjects[0],
        category: undefined
      }];
      
      render(<ExportManager {...defaultProps} objects={objectsWithoutCategory} />);
      
      // 应该正常渲染
      expect(screen.getByText('数据导出和项目管理')).toBeInTheDocument();
    });
  });
});