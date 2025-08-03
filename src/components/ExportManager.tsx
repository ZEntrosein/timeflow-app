import React, { useState, useCallback, useRef } from 'react';
import { WorldObject, Event, Timeline, ProjectData } from '../types';
import { defaultStorageService } from '../services';
import { validateProjectData } from '../utils/validation';
import './ExportManager.css';

interface ExportManagerProps {
  objects: WorldObject[];
  events: Event[];
  timeline: Timeline;
  onImport?: (data: ProjectData) => void;
  onExport?: (data: ProjectData) => void;
}

interface ProjectMetadata {
  name: string;
  description: string;
  version: string;
  author?: string;
  tags?: string[];
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  objects,
  events,
  timeline,
  onImport,
  onExport
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 项目元数据状态
  const [metadata, setMetadata] = useState<ProjectMetadata>({
    name: 'TimeFlow Project',
    description: '时间线可视化项目',
    version: '1.0.0',
    author: '',
    tags: []
  });

  // 清除消息
  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  // 生成项目ID
  const generateProjectId = useCallback((): string => {
    return `timeflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // 创建完整的项目数据
  const createProjectData = useCallback((): ProjectData => {
    const now = new Date().toISOString();
    
    return {
      id: generateProjectId(),
      name: metadata.name,
      description: metadata.description,
      version: metadata.version,
      objects: objects,
      timeline: {
        ...timeline,
        events: events
      },
      createdAt: now,
      updatedAt: now,
      // 扩展字段
      metadata: {
        author: metadata.author,
        tags: metadata.tags,
        exportedAt: now,
        exportedBy: 'TimeFlow Web App',
        objectCount: objects.length,
        eventCount: events.length,
        timeRange: {
          start: timeline.startTime,
          end: timeline.endTime
        }
      }
    } as ProjectData & { metadata: any };
  }, [metadata, objects, events, timeline, generateProjectId]);

  // 导出为JSON文件
  const handleExportToFile = useCallback(async () => {
    try {
      setIsExporting(true);
      clearMessages();

      const projectData = createProjectData();
      
      // 验证数据
      validateProjectData(projectData);
      
      // 创建JSON字符串
      const jsonString = JSON.stringify(projectData, null, 2);
      
      // 创建下载链接
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // 创建下载元素
      const link = document.createElement('a');
      link.href = url;
      link.download = `${metadata.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL
      URL.revokeObjectURL(url);
      
      // 触发回调
      onExport?.(projectData);
      
      setSuccess(`项目已成功导出为 ${link.download}`);
      
    } catch (err) {
      setError(`导出失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsExporting(false);
    }
  }, [createProjectData, metadata.name, onExport, clearMessages]);

  // 导出到存储服务
  const handleExportToStorage = useCallback(async () => {
    try {
      setIsExporting(true);
      clearMessages();

      const projectData = createProjectData();
      
      // 初始化存储服务
      await defaultStorageService.initialize();
      
      // 保存项目数据
      await defaultStorageService.saveProject(projectData);
      
      setSuccess('项目已成功保存到本地存储');
      
    } catch (err) {
      setError(`保存失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsExporting(false);
    }
  }, [createProjectData, clearMessages]);

  // 处理文件导入
  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        setIsImporting(true);
        clearMessages();
        
        const content = e.target?.result as string;
        const projectData: ProjectData = JSON.parse(content);
        
        // 验证导入的数据
        validateProjectData(projectData);
        
        // 检查数据完整性
        if (!projectData.objects || !Array.isArray(projectData.objects)) {
          throw new Error('导入文件缺少有效的对象数据');
        }
        
        if (!projectData.timeline || !projectData.timeline.events) {
          throw new Error('导入文件缺少有效的时间轴数据');
        }
        
        // 更新元数据
        setMetadata({
          name: projectData.name || 'Imported Project',
          description: projectData.description || '导入的项目',
          version: projectData.version || '1.0.0',
          author: (projectData as any).metadata?.author || '',
          tags: (projectData as any).metadata?.tags || []
        });
        
        // 触发导入回调
        onImport?.(projectData);
        
        setSuccess(`成功导入项目: ${projectData.name} (${projectData.objects.length} 个对象, ${projectData.timeline.events.length} 个事件)`);
        
      } catch (err) {
        setError(`导入失败: ${err instanceof Error ? err.message : '文件格式错误'}`);
      } finally {
        setIsImporting(false);
        // 清空文件输入
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      setError('文件读取失败');
      setIsImporting(false);
    };
    
    reader.readAsText(file);
  }, [onImport, clearMessages]);

  // 从存储服务导入
  const handleImportFromStorage = useCallback(async (projectId: string) => {
    try {
      setIsImporting(true);
      clearMessages();
      
      await defaultStorageService.initialize();
      const projectData = await defaultStorageService.loadProject(projectId);
      
      if (!projectData) {
        throw new Error(`项目 ${projectId} 不存在`);
      }
      
      // 更新元数据
      setMetadata({
        name: projectData.name,
        description: projectData.description || '',
        version: projectData.version,
        author: (projectData as any).metadata?.author || '',
        tags: (projectData as any).metadata?.tags || []
      });
      
      onImport?.(projectData);
      
      setSuccess(`成功从存储加载项目: ${projectData.name}`);
      
    } catch (err) {
      setError(`导入失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsImporting(false);
    }
  }, [onImport, clearMessages]);

  // 获取项目统计信息
  const getProjectStats = useCallback(() => {
    const totalAttributes = objects.reduce((sum, obj) => sum + obj.attributes.length, 0);
    const objectTypes = [...new Set(objects.map(obj => obj.category || 'Unknown'))];
    const timeSpan = timeline.endTime - timeline.startTime;
    const timeSpanDays = Math.ceil(timeSpan / (24 * 60 * 60 * 1000));
    
    return {
      objectCount: objects.length,
      eventCount: events.length,
      attributeCount: totalAttributes,
      objectTypes: objectTypes.length,
      timeSpanDays,
      avgEventsPerDay: timeSpanDays > 0 ? (events.length / timeSpanDays).toFixed(2) : 0
    };
  }, [objects, events, timeline]);

  const stats = getProjectStats();

  return (
    <div className="export-manager">
      <div className="export-header">
        <h2>数据导出和项目管理</h2>
        <button
          className="metadata-toggle"
          onClick={() => setShowMetadataForm(!showMetadataForm)}
        >
          {showMetadataForm ? '隐藏' : '编辑'} 项目信息
        </button>
      </div>

      {/* 错误和成功消息 */}
      {error && (
        <div className="message error">
          <span>❌ {error}</span>
          <button onClick={clearMessages}>×</button>
        </div>
      )}
      
      {success && (
        <div className="message success">
          <span>✅ {success}</span>
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      {/* 项目元数据表单 */}
      {showMetadataForm && (
        <div className="metadata-form">
          <h3>项目信息</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="project-name">项目名称 *</label>
              <input
                id="project-name"
                type="text"
                value={metadata.name}
                onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入项目名称"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="project-version">版本号</label>
              <input
                id="project-version"
                type="text"
                value={metadata.version}
                onChange={(e) => setMetadata(prev => ({ ...prev, version: e.target.value }))}
                placeholder="1.0.0"
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="project-description">项目描述</label>
              <textarea
                id="project-description"
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="描述这个时间线项目的内容..."
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="project-author">作者</label>
              <input
                id="project-author"
                type="text"
                value={metadata.author}
                onChange={(e) => setMetadata(prev => ({ ...prev, author: e.target.value }))}
                placeholder="作者姓名"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="project-tags">标签 (逗号分隔)</label>
              <input
                id="project-tags"
                type="text"
                value={metadata.tags?.join(', ') || ''}
                onChange={(e) => setMetadata(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                }))}
                placeholder="历史, 小说, 游戏"
              />
            </div>
          </div>
        </div>
      )}

      {/* 项目统计信息 */}
      <div className="project-stats">
        <h3>项目统计</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.objectCount}</span>
            <span className="stat-label">对象</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.eventCount}</span>
            <span className="stat-label">事件</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.attributeCount}</span>
            <span className="stat-label">属性</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.timeSpanDays}</span>
            <span className="stat-label">天数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.avgEventsPerDay}</span>
            <span className="stat-label">日均事件</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.objectTypes}</span>
            <span className="stat-label">对象类型</span>
          </div>
        </div>
      </div>

      {/* 导出选项 */}
      <div className="export-section">
        <h3>导出项目</h3>
        <div className="export-options">
          <button
            className="export-btn primary"
            onClick={handleExportToFile}
            disabled={isExporting || objects.length === 0}
          >
            {isExporting ? '导出中...' : '📥 导出为JSON文件'}
          </button>
          
          <button
            className="export-btn secondary"
            onClick={handleExportToStorage}
            disabled={isExporting || objects.length === 0}
          >
            {isExporting ? '保存中...' : '💾 保存到本地存储'}
          </button>
        </div>
        
        <div className="export-info">
          <p>
            📋 导出包含所有对象、事件、时间轴和项目元数据。
            JSON文件可以在其他TimeFlow应用中导入。
          </p>
        </div>
      </div>

      {/* 导入选项 */}
      <div className="import-section">
        <h3>导入项目</h3>
        <div className="import-options">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
          
          <button
            className="import-btn primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            {isImporting ? '导入中...' : '📤 从JSON文件导入'}
          </button>
          
          <button
            className="import-btn secondary"
            onClick={() => {
              const projectId = prompt('请输入项目ID:');
              if (projectId) {
                handleImportFromStorage(projectId);
              }
            }}
            disabled={isImporting}
          >
            {isImporting ? '加载中...' : '📂 从本地存储导入'}
          </button>
        </div>
        
        <div className="import-warning">
          <p>
            ⚠️ 导入操作将替换当前的所有数据。请确保已保存当前项目。
          </p>
        </div>
      </div>
    </div>
  );
};