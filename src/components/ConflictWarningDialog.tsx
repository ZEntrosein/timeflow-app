import React, { useState, useCallback } from 'react';
import { ConflictResult, ConflictSeverity, ConflictType } from '../services/ConflictDetector';
import './ConflictWarningDialog.css';

interface ConflictWarningDialogProps {
  conflicts: ConflictResult[];
  isOpen: boolean;
  onClose: () => void;
  onIgnore?: (conflictIds: string[]) => void;
  onResolve?: (conflict: ConflictResult) => void;
  showDetails?: boolean;
}

export const ConflictWarningDialog: React.FC<ConflictWarningDialogProps> = ({
  conflicts,
  isOpen,
  onClose,
  onIgnore,
  onResolve,
  showDetails = true
}) => {
  const [selectedConflicts, setSelectedConflicts] = useState<Set<string>>(new Set());
  const [expandedConflict, setExpandedConflict] = useState<string | null>(null);

  // 获取严重程度图标和颜色
  const getSeverityInfo = (severity: ConflictSeverity) => {
    switch (severity) {
      case ConflictSeverity.CRITICAL:
        return { icon: '🚨', color: '#dc3545', label: '严重' };
      case ConflictSeverity.HIGH:
        return { icon: '⚠️', color: '#fd7e14', label: '高' };
      case ConflictSeverity.MEDIUM:
        return { icon: '⚡', color: '#ffc107', label: '中' };
      case ConflictSeverity.LOW:
        return { icon: 'ℹ️', color: '#17a2b8', label: '低' };
      default:
        return { icon: '❓', color: '#6c757d', label: '未知' };
    }
  };

  // 获取冲突类型标签
  const getTypeLabel = (type: ConflictType): string => {
    switch (type) {
      case ConflictType.LOGICAL_INCONSISTENCY:
        return '逻辑不一致';
      case ConflictType.TEMPORAL_PARADOX:
        return '时间悖论';
      case ConflictType.STATE_VIOLATION:
        return '状态违反';
      case ConflictType.DEPENDENCY_VIOLATION:
        return '依赖违反';
      case ConflictType.BUSINESS_RULE_VIOLATION:
        return '业务规则违反';
      default:
        return '未知类型';
    }
  };

  // 处理冲突选择
  const handleConflictToggle = useCallback((conflictId: string) => {
    setSelectedConflicts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conflictId)) {
        newSet.delete(conflictId);
      } else {
        newSet.add(conflictId);
      }
      return newSet;
    });
  }, []);

  // 全选/取消全选
  const handleSelectAll = useCallback(() => {
    if (selectedConflicts.size === conflicts.length) {
      setSelectedConflicts(new Set());
    } else {
      setSelectedConflicts(new Set(conflicts.map(c => c.id)));
    }
  }, [conflicts, selectedConflicts.size]);

  // 忽略选中的冲突
  const handleIgnoreSelected = useCallback(() => {
    if (selectedConflicts.size > 0) {
      onIgnore?.(Array.from(selectedConflicts));
      setSelectedConflicts(new Set());
    }
  }, [selectedConflicts, onIgnore]);

  // 展开/收起冲突详情
  const toggleConflictDetails = useCallback((conflictId: string) => {
    setExpandedConflict(prev => prev === conflictId ? null : conflictId);
  }, []);

  // 格式化时间戳
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  if (!isOpen) return null;

  const criticalConflicts = conflicts.filter(c => c.severity === ConflictSeverity.CRITICAL);
  const highConflicts = conflicts.filter(c => c.severity === ConflictSeverity.HIGH);
  const otherConflicts = conflicts.filter(c => 
    c.severity !== ConflictSeverity.CRITICAL && c.severity !== ConflictSeverity.HIGH
  );

  return (
    <div className="conflict-dialog-overlay">
      <div className="conflict-dialog">
        <div className="conflict-dialog-header">
          <h2>
            🚨 检测到 {conflicts.length} 个冲突
          </h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="关闭对话框"
          >
            ×
          </button>
        </div>

        <div className="conflict-dialog-content">
          {/* 冲突摘要 */}
          <div className="conflict-summary">
            <div className="summary-stats">
              {criticalConflicts.length > 0 && (
                <span className="stat critical">
                  🚨 严重: {criticalConflicts.length}
                </span>
              )}
              {highConflicts.length > 0 && (
                <span className="stat high">
                  ⚠️ 高: {highConflicts.length}
                </span>
              )}
              {otherConflicts.length > 0 && (
                <span className="stat other">
                  📋 其他: {otherConflicts.length}
                </span>
              )}
            </div>
            
            <div className="batch-actions">
              <button 
                className="select-all-btn"
                onClick={handleSelectAll}
              >
                {selectedConflicts.size === conflicts.length ? '取消全选' : '全选'}
              </button>
              {selectedConflicts.size > 0 && onIgnore && (
                <button 
                  className="ignore-selected-btn"
                  onClick={handleIgnoreSelected}
                >
                  忽略选中 ({selectedConflicts.size})
                </button>
              )}
            </div>
          </div>

          {/* 冲突列表 */}
          <div className="conflicts-list">
            {conflicts.map(conflict => {
              const severityInfo = getSeverityInfo(conflict.severity);
              const isSelected = selectedConflicts.has(conflict.id);
              const isExpanded = expandedConflict === conflict.id;
              
              return (
                <div 
                  key={conflict.id}
                  className={`conflict-item ${conflict.severity} ${isSelected ? 'selected' : ''}`}
                >
                  <div className="conflict-header">
                    <div className="conflict-main-info">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleConflictToggle(conflict.id)}
                        className="conflict-checkbox"
                      />
                      
                      <span 
                        className="severity-badge"
                        style={{ backgroundColor: severityInfo.color }}
                      >
                        {severityInfo.icon} {severityInfo.label}
                      </span>
                      
                      <span className="type-badge">
                        {getTypeLabel(conflict.type)}
                      </span>
                      
                      <h4 className="conflict-title">{conflict.title}</h4>
                    </div>
                    
                    <div className="conflict-actions">
                      {showDetails && (
                        <button
                          className="details-toggle"
                          onClick={() => toggleConflictDetails(conflict.id)}
                        >
                          {isExpanded ? '收起' : '详情'}
                        </button>
                      )}
                      {onResolve && (
                        <button
                          className="resolve-btn"
                          onClick={() => onResolve(conflict)}
                        >
                          解决
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="conflict-description">
                    {conflict.description}
                  </div>

                  <div className="conflict-meta">
                    <span>对象: {conflict.objectId}</span>
                    {conflict.attributeId && (
                      <span>属性: {conflict.attributeId}</span>
                    )}
                    <span>时间: {formatTimestamp(conflict.timestamp)}</span>
                  </div>

                  {isExpanded && showDetails && (
                    <div className="conflict-details">
                      {/* 相关事件 */}
                      <div className="related-events">
                        <h5>相关事件:</h5>
                        <div className="events-list">
                          {conflict.events.map(event => (
                            <div key={event.id} className="event-item">
                              <div className="event-info">
                                <span className="event-time">
                                  {formatTimestamp(event.timestamp)}
                                </span>
                                <span className="event-description">
                                  {event.description || `${event.attributeId}: ${event.oldValue} → ${event.newValue}`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 建议解决方案 */}
                      {conflict.suggestions && conflict.suggestions.length > 0 && (
                        <div className="suggestions">
                          <h5>建议解决方案:</h5>
                          <ul>
                            {conflict.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="conflict-dialog-footer">
          <div className="footer-info">
            <p>
              💡 冲突检测帮助您发现时间线中的逻辑问题。
              您可以选择忽略某些冲突或修改相关事件来解决问题。
            </p>
          </div>
          
          <div className="footer-actions">
            <button 
              className="secondary-btn"
              onClick={onClose}
            >
              稍后处理
            </button>
            
            {criticalConflicts.length === 0 && (
              <button 
                className="primary-btn"
                onClick={onClose}
              >
                继续操作
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};