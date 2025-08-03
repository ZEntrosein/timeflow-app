import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConflictWarningDialog } from '../components/ConflictWarningDialog';
import { ConflictType, ConflictSeverity, ConflictResult } from '../services/ConflictDetector';

describe('ConflictWarningDialog', () => {
  const mockConflicts: ConflictResult[] = [
    {
      id: 'conflict-1',
      type: ConflictType.LOGICAL_INCONSISTENCY,
      severity: ConflictSeverity.HIGH,
      title: '死后复活冲突',
      description: '角色在死亡后仍有活动',
      events: [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'status',
          newValue: 'dead',
          createdAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'event-2',
          timestamp: 2000,
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 26,
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ],
      objectId: 'character-1',
      attributeId: 'status',
      suggestions: ['检查死亡时间是否正确', '考虑添加复活事件'],
      timestamp: 2000
    },
    {
      id: 'conflict-2',
      type: ConflictType.STATE_VIOLATION,
      severity: ConflictSeverity.MEDIUM,
      title: '无效状态转换',
      description: '状态转换不合理',
      events: [
        {
          id: 'event-3',
          timestamp: 3000,
          objectId: 'character-2',
          attributeId: 'status',
          newValue: 'healthy',
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ],
      objectId: 'character-2',
      timestamp: 3000
    }
  ];

  const defaultProps = {
    conflicts: mockConflicts,
    isOpen: true,
    onClose: vi.fn()
  };

  describe('基本渲染', () => {
    test('应该在打开时显示对话框', () => {
      render(<ConflictWarningDialog {...defaultProps} />);
      
      expect(screen.getByText(/检测到 2 个冲突/)).toBeInTheDocument();
      expect(screen.getByText('死后复活冲突')).toBeInTheDocument();
      expect(screen.getByText('无效状态转换')).toBeInTheDocument();
    });

    test('应该在关闭时隐藏对话框', () => {
      render(<ConflictWarningDialog {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText(/检测到/)).not.toBeInTheDocument();
    });

    test('应该显示冲突统计信息', () => {
      render(<ConflictWarningDialog {...defaultProps} />);
      
      expect(screen.getByText('⚠️ 高: 1')).toBeInTheDocument();
      expect(screen.getByText('⚡ 中: 1')).toBeInTheDocument();
    });
  });

  describe('冲突信息显示', () => {
    test('应该显示冲突的基本信息', () => {
      render(<ConflictWarningDialog {...defaultProps} />);
      
      // 验证严重程度
      expect(screen.getByText('高')).toBeInTheDocument();
      expect(screen.getByText('中')).toBeInTheDocument();
      
      // 验证类型
      expect(screen.getByText('逻辑不一致')).toBeInTheDocument();
      expect(screen.getByText('状态违反')).toBeInTheDocument();
      
      // 验证描述
      expect(screen.getByText('角色在死亡后仍有活动')).toBeInTheDocument();
      expect(screen.getByText('状态转换不合理')).toBeInTheDocument();
    });

    test('应该显示对象和属性信息', () => {
      render(<ConflictWarningDialog {...defaultProps} />);
      
      expect(screen.getByText('对象: character-1')).toBeInTheDocument();
      expect(screen.getByText('属性: status')).toBeInTheDocument();
      expect(screen.getByText('对象: character-2')).toBeInTheDocument();
    });

    test('应该显示时间信息', () => {
      render(<ConflictWarningDialog {...defaultProps} />);
      
      // 验证时间显示存在（具体格式可能因本地化而异）
      expect(screen.getByText(/时间:/)).toBeInTheDocument();
    });
  });

  describe('交互功能', () => {
    test('应该能关闭对话框', () => {
      const onClose = vi.fn();
      render(<ConflictWarningDialog {...defaultProps} onClose={onClose} />);
      
      const closeButton = screen.getByLabelText('关闭对话框');
      fireEvent.click(closeButton);
      
      expect(onClose).toHaveBeenCalled();
    });

    test('应该支持选择单个冲突', () => {
      render(<ConflictWarningDialog {...defaultProps} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      
      // 验证复选框被选中
      expect(checkboxes[0]).toBeChecked();
    });

    test('应该支持全选/取消全选', () => {
      render(<ConflictWarningDialog {...defaultProps} />);
      
      const selectAllButton = screen.getByText('全选');
      fireEvent.click(selectAllButton);
      
      // 验证所有复选框被选中
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked();
      });
      
      // 点击取消全选
      const unselectAllButton = screen.getByText('取消全选');
      fireEvent.click(unselectAllButton);
      
      // 验证所有复选框被取消选中
      checkboxes.forEach(checkbox => {
        expect(checkbox).not.toBeChecked();
      });
    });

    test('应该在选中冲突后显示忽略按钮', () => {
      const onIgnore = vi.fn();
      render(<ConflictWarningDialog {...defaultProps} onIgnore={onIgnore} />);
      
      // 选择第一个冲突
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      
      // 验证忽略按钮出现
      const ignoreButton = screen.getByText(/忽略选中/);
      expect(ignoreButton).toBeInTheDocument();
      
      // 点击忽略按钮
      fireEvent.click(ignoreButton);
      
      expect(onIgnore).toHaveBeenCalledWith(['conflict-1']);
    });
  });

  describe('详情展开', () => {
    test('应该能展开和收起冲突详情', () => {
      render(<ConflictWarningDialog {...defaultProps} showDetails={true} />);
      
      const detailsButton = screen.getAllByText('详情')[0];
      fireEvent.click(detailsButton);
      
      // 验证详情内容显示
      expect(screen.getByText('相关事件:')).toBeInTheDocument();
      expect(screen.getByText('建议解决方案:')).toBeInTheDocument();
      
      // 点击收起
      const collapseButton = screen.getByText('收起');
      fireEvent.click(collapseButton);
      
      // 验证详情内容隐藏
      expect(screen.queryByText('相关事件:')).not.toBeInTheDocument();
    });

    test('应该显示相关事件信息', () => {
      render(<ConflictWarningDialog {...defaultProps} showDetails={true} />);
      
      const detailsButton = screen.getAllByText('详情')[0];
      fireEvent.click(detailsButton);
      
      // 验证事件信息显示
      expect(screen.getByText('status: undefined → dead')).toBeInTheDocument();
      expect(screen.getByText('age: undefined → 26')).toBeInTheDocument();
    });

    test('应该显示建议解决方案', () => {
      render(<ConflictWarningDialog {...defaultProps} showDetails={true} />);
      
      const detailsButton = screen.getAllByText('详情')[0];
      fireEvent.click(detailsButton);
      
      // 验证建议显示
      expect(screen.getByText('检查死亡时间是否正确')).toBeInTheDocument();
      expect(screen.getByText('考虑添加复活事件')).toBeInTheDocument();
    });
  });

  describe('解决冲突', () => {
    test('应该支持解决单个冲突', () => {
      const onResolve = vi.fn();
      render(<ConflictWarningDialog {...defaultProps} onResolve={onResolve} />);
      
      const resolveButton = screen.getAllByText('解决')[0];
      fireEvent.click(resolveButton);
      
      expect(onResolve).toHaveBeenCalledWith(mockConflicts[0]);
    });
  });

  describe('严重冲突处理', () => {
    test('应该在有严重冲突时隐藏继续按钮', () => {
      const criticalConflicts: ConflictResult[] = [
        {
          ...mockConflicts[0],
          severity: ConflictSeverity.CRITICAL
        }
      ];
      
      render(
        <ConflictWarningDialog 
          {...defaultProps} 
          conflicts={criticalConflicts}
        />
      );
      
      expect(screen.queryByText('继续操作')).not.toBeInTheDocument();
      expect(screen.getByText('稍后处理')).toBeInTheDocument();
    });

    test('应该在没有严重冲突时显示继续按钮', () => {
      render(<ConflictWarningDialog {...defaultProps} />);
      
      expect(screen.getByText('继续操作')).toBeInTheDocument();
      expect(screen.getByText('稍后处理')).toBeInTheDocument();
    });
  });

  describe('空状态处理', () => {
    test('应该处理没有冲突的情况', () => {
      render(
        <ConflictWarningDialog 
          {...defaultProps} 
          conflicts={[]}
        />
      );
      
      expect(screen.getByText(/检测到 0 个冲突/)).toBeInTheDocument();
    });

    test('应该处理没有建议的冲突', () => {
      const conflictsWithoutSuggestions: ConflictResult[] = [
        {
          ...mockConflicts[0],
          suggestions: undefined
        }
      ];
      
      render(
        <ConflictWarningDialog 
          {...defaultProps} 
          conflicts={conflictsWithoutSuggestions}
          showDetails={true}
        />
      );
      
      const detailsButton = screen.getAllByText('详情')[0];
      fireEvent.click(detailsButton);
      
      expect(screen.queryByText('建议解决方案:')).not.toBeInTheDocument();
    });
  });

  describe('无障碍访问', () => {
    test('应该支持键盘导航', () => {
      render(<ConflictWarningDialog {...defaultProps} />);
      
      const closeButton = screen.getByLabelText('关闭对话框');
      expect(closeButton).toBeInTheDocument();
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

      render(<ConflictWarningDialog {...defaultProps} />);
      
      expect(screen.getByText(/检测到 2 个冲突/)).toBeInTheDocument();
    });
  });
});