import React from 'react';
import { useUIStore, useProjectStore, useSelectionStore } from '../../store';
import { WorldObject } from '../../types';

interface ObjectListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  objectType?: string;
}

export const ObjectListDialog: React.FC<ObjectListDialogProps> = ({
  isOpen,
  onClose,
  objectType
}) => {
  const { getObjects } = useProjectStore();
  const { openEditObjectDialog } = useUIStore();
  const { selectItem, isSelected } = useSelectionStore();
  
  if (!isOpen || !objectType) return null;

  const objects = getObjects().filter(obj => obj.category === objectType);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleObjectClick = (object: WorldObject) => {
    selectItem(object.id, object.category as any, false);
    onClose(); // 选择对象后自动关闭弹窗
  };

  const handleObjectDoubleClick = (object: WorldObject) => {
    openEditObjectDialog(object.id);
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'event': '事件',
      'object': '对象',
      'person': '人物',
      'place': '地点',
      'project': '项目',
      'custom': '自定义',
    };
    return labels[type] || '未知';
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '2px solid #e5e7eb',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 标题栏 */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937'
            }}
          >
            {getTypeLabel(objectType)} 列表 ({objects.length})
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* 对象列表 */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px'
          }}
        >
          {objects.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: '#6b7280'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                暂无{getTypeLabel(objectType)}
              </div>
              <div style={{ fontSize: '14px' }}>
                点击"+"按钮创建第一个{getTypeLabel(objectType)}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '8px'
              }}
            >
              {objects.map((obj) => {
                const selected = isSelected(obj.id);
                return (
                  <div
                    key={obj.id}
                    onClick={() => handleObjectClick(obj)}
                    onDoubleClick={() => handleObjectDoubleClick(obj)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: selected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                      backgroundColor: selected ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <div
                      style={{
                        fontWeight: '500',
                        fontSize: '14px',
                        color: '#1f2937',
                        marginBottom: '4px'
                      }}
                    >
                      {obj.name}
                    </div>
                    {obj.description && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '8px',
                          lineHeight: '1.4'
                        }}
                      >
                        {obj.description}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <span>{obj.attributes.length} 个属性</span>
                      {obj.tags && obj.tags.length > 0 && (
                        <span>
                          标签: {obj.tags.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: '#6b7280',
              textAlign: 'center'
            }}
          >
            💡 提示：单击选择对象，双击编辑对象
          </div>
        </div>
      </div>
    </div>
  );
}; 