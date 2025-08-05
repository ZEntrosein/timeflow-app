import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../store';

interface KeyboardShortcut {
  key: string;
  description: string;
  category: string;
}

interface HelpPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const shortcuts: KeyboardShortcut[] = [
  // 通用快捷键
  { key: 'Ctrl + S', description: '保存项目', category: '通用' },
  { key: 'Ctrl + Z', description: '撤销操作', category: '通用' },
  { key: 'Ctrl + Y', description: '重做操作', category: '通用' },
  { key: 'Ctrl + /', description: '显示/隐藏快捷键帮助', category: '通用' },
  { key: 'F11', description: '全屏切换', category: '通用' },
  
  // 视图操作
  { key: '1', description: '切换到时间轴视图', category: '视图' },
  { key: '2', description: '切换到数据表视图', category: '视图' },
  { key: '3', description: '切换到关系图视图', category: '视图' },
  { key: '4', description: '切换到空间图视图', category: '视图' },
  { key: '5', description: '切换到导演台视图', category: '视图' },
  { key: 'Tab', description: '切换侧边栏', category: '视图' },
  { key: 'Shift + Tab', description: '切换检查器', category: '视图' },
  
  // 时间轴操作
  { key: 'Ctrl + +', description: '放大时间轴', category: '时间轴' },
  { key: 'Ctrl + -', description: '缩小时间轴', category: '时间轴' },
  { key: 'Ctrl + 0', description: '重置缩放', category: '时间轴' },
  { key: '空格', description: '拖拽时间轴（按住）', category: '时间轴' },
  { key: '↑↓←→', description: '微调选中事件位置', category: '时间轴' },
  
  // 选择操作
  { key: 'Ctrl + A', description: '全选事件', category: '选择' },
  { key: 'Ctrl + 点击', description: '多选事件', category: '选择' },
  { key: 'Shift + 点击', description: '范围选择', category: '选择' },
  { key: 'Escape', description: '取消选择', category: '选择' },
  
  // 编辑操作
  { key: 'Ctrl + N', description: '新建事件', category: '编辑' },
  { key: 'Ctrl + Shift + N', description: '新建对象', category: '编辑' },
  { key: 'Enter', description: '编辑选中项', category: '编辑' },
  { key: 'Delete', description: '删除选中项', category: '编辑' },
  { key: 'Ctrl + D', description: '复制选中项', category: '编辑' },
];

export const HelpPanel: React.FC<HelpPanelProps> = ({ isOpen = false, onClose }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { getCurrentTheme, sidebarVisible, layoutConfig } = useUIStore();
  const currentTheme = getCurrentTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // 使用外部控制的 isOpen 或内部状态
  const actualIsOpen = isOpen !== undefined ? isOpen : internalOpen;
  const handleClose = onClose || (() => setInternalOpen(false));
  const handleOpen = () => {
    if (onClose) {
      // 外部控制，无法自行打开
      return;
    }
    setInternalOpen(true);
  };

  // 监听Ctrl+/快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        if (onClose) {
          // 外部控制时，只能关闭，不能打开
          if (actualIsOpen) {
            handleClose();
          }
        } else {
          setInternalOpen(prev => !prev);
        }
      }
      if (e.key === 'Escape' && actualIsOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actualIsOpen, onClose, handleClose]);

  // 过滤快捷键
  const filteredShortcuts = shortcuts.filter(
    shortcut =>
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 按类别分组
  const groupedShortcuts = filteredShortcuts.reduce((groups, shortcut) => {
    const category = shortcut.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(shortcut);
    return groups;
  }, {} as Record<string, KeyboardShortcut[]>);

  // 计算按钮位置 - 使用实际的侧边栏宽度 + 边距
  const buttonLeftPosition = sidebarVisible ? layoutConfig.sidebarWidth + 16 : 16; // 16px = 1rem 边距

  // 如果是外部控制且不显示，或者内部控制且不显示，则显示触发按钮
  if (!actualIsOpen && !onClose) {
    return (
      <button
        onClick={handleOpen}
        className={`fixed bottom-4 z-40 px-3 py-2 ${currentTheme.background.secondary} ${currentTheme.text.secondary} ${currentTheme.border.secondary} border rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
        style={{ left: `${buttonLeftPosition}px` }}
        title="快捷键帮助 (Ctrl + /)"
      >
        <span className="mr-2">⌨️</span>
        快捷键
      </button>
    );
  }

  // 如果不显示，返回null
  if (!actualIsOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
      <div 
        className="w-full max-w-4xl max-h-[80vh] rounded-xl shadow-2xl border-2 overflow-hidden backdrop-blur-sm"
        style={{ 
          backgroundColor: currentTheme.name === 'dark' ? '#1f2937' : '#ffffff',
          borderColor: currentTheme.name === 'dark' ? '#4b5563' : '#cbd5e1'
        }}
      >
        {/* 头部 */}
        <div 
          className="border-b px-6 py-4 flex items-center justify-between"
          style={{ 
            backgroundColor: currentTheme.name === 'dark' ? '#374151' : '#f8fafc',
            borderColor: currentTheme.name === 'dark' ? '#4b5563' : '#e2e8f0'
          }}
        >
          <div>
            <h2 
              className="text-xl font-bold"
              style={{ color: currentTheme.name === 'dark' ? '#f9fafb' : '#1e293b' }}
            >
              ⌨️ 快捷键参考
            </h2>
            <p 
              className="text-sm mt-1"
              style={{ color: currentTheme.name === 'dark' ? '#9ca3af' : '#64748b' }}
            >
              提升你的工作效率 • 按 Ctrl + / 再次隐藏
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:opacity-80 transition-all duration-200 flex items-center justify-center font-bold"
            style={{ 
              backgroundColor: currentTheme.name === 'dark' ? '#4b5563' : '#e2e8f0',
              color: currentTheme.name === 'dark' ? '#f9fafb' : '#475569'
            }}
          >
            ×
          </button>
        </div>

        {/* 搜索框 */}
        <div 
          className="p-6 pb-4"
          style={{ backgroundColor: currentTheme.name === 'dark' ? '#1f2937' : '#ffffff' }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="搜索快捷键..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{
                backgroundColor: currentTheme.name === 'dark' ? '#374151' : '#f1f5f9',
                borderColor: currentTheme.name === 'dark' ? '#4b5563' : '#cbd5e1',
                color: currentTheme.name === 'dark' ? '#f9fafb' : '#1e293b'
              }}
            />
            <div 
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              style={{ color: currentTheme.name === 'dark' ? '#9ca3af' : '#64748b' }}
            >
              🔍
            </div>
          </div>
        </div>

        {/* 快捷键列表 */}
        <div 
          className="px-6 pb-6 overflow-y-auto max-h-96"
          style={{ backgroundColor: currentTheme.name === 'dark' ? '#1f2937' : '#ffffff' }}
        >
          {Object.keys(groupedShortcuts).length === 0 ? (
            <div 
              className="text-center py-8"
              style={{ color: currentTheme.name === 'dark' ? '#9ca3af' : '#64748b' }}
            >
              <div className="text-4xl mb-2">🔍</div>
              <p>没有找到匹配的快捷键</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                <div 
                  key={category} 
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: currentTheme.name === 'dark' ? '#374151' : '#f8fafc',
                    borderColor: currentTheme.name === 'dark' ? '#4b5563' : '#e2e8f0'
                  }}
                >
                  <h3 
                    className="font-semibold mb-3 text-sm uppercase tracking-wide"
                    style={{ color: currentTheme.name === 'dark' ? '#f9fafb' : '#1e293b' }}
                  >
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <span 
                          className="text-sm flex-1"
                          style={{ color: currentTheme.name === 'dark' ? '#d1d5db' : '#475569' }}
                        >
                          {shortcut.description}
                        </span>
                        <div className="flex items-center space-x-1 ml-4">
                          {shortcut.key.split(' + ').map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              {keyIndex > 0 && (
                                <span 
                                  className="text-xs"
                                  style={{ color: currentTheme.name === 'dark' ? '#9ca3af' : '#64748b' }}
                                >
                                  +
                                </span>
                              )}
                              <kbd 
                                className="px-2 py-1 text-xs font-mono border rounded shadow-sm"
                                style={{
                                  backgroundColor: currentTheme.name === 'dark' ? '#4b5563' : '#ffffff',
                                  color: currentTheme.name === 'dark' ? '#f9fafb' : '#1e293b',
                                  borderColor: currentTheme.name === 'dark' ? '#6b7280' : '#cbd5e1'
                                }}
                              >
                                {key}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div 
          className="border-t px-6 py-3 text-center"
          style={{
            backgroundColor: currentTheme.name === 'dark' ? '#374151' : '#f8fafc',
            borderColor: currentTheme.name === 'dark' ? '#4b5563' : '#e2e8f0'
          }}
        >
          <p 
            className="text-xs"
            style={{ color: currentTheme.name === 'dark' ? '#9ca3af' : '#64748b' }}
          >
            💡 提示：大部分快捷键只在相应的视图或上下文中生效
          </p>
        </div>
      </div>
    </div>
  );
}; 