import React from 'react';
import { useUIStore, useProjectStore } from '../../store';
import { VIEW_TYPES } from '../../constants/views';
import { WorldObject, TimelineEvent } from '../../types';
import { TimelineView } from '../Views/TimelineView';
import { AttributeTableView } from '../Views/AttributeViews/AttributeTableView';
import { searchByAttributes, FilterBuilder } from '../../utils/attributeSearch';

export const ViewContainer: React.FC = () => {
  const { currentView } = useUIStore();

  const renderCurrentView = () => {
    switch (currentView) {
      case VIEW_TYPES.TIMELINE:
        return <TimelineView />;
      case VIEW_TYPES.DATA_TABLE:
        return <AttributeTableViewContainer />;
      case VIEW_TYPES.RELATIONSHIP:
        return <RelationshipView />;
      case VIEW_TYPES.SPATIAL:
        return <SpatialView />;
      case VIEW_TYPES.DIRECTOR:
        return <DirectorView />;
      default:
        return <TimelineView />;
    }
  };

  return (
    <div className="h-full w-full bg-white">
      {renderCurrentView()}
    </div>
  );
};

// 属性表格视图容器，提供数据和搜索功能
const AttributeTableViewContainer: React.FC = () => {
  const { getObjects, getEvents, updateObject, updateEvent } = useProjectStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<any[]>([]);
  
  // 获取所有数据项
  const objects = getObjects();
  const events = getEvents();
  const allData = [...objects, ...events];
  
  // 收集所有可用的属性名称
  const visibleAttributes = React.useMemo(() => {
    const attributeNames = new Set<string>();
    allData.forEach(item => {
      if (item.attributes) {
        item.attributes.forEach(attr => {
          attributeNames.add(attr.name);
        });
      }
    });
    return Array.from(attributeNames);
  }, [allData]);

  // 应用搜索和过滤
  const filteredData = React.useMemo(() => {
    if (!searchTerm && filters.length === 0) {
      return allData;
    }
    
    return searchByAttributes(allData, {
      query: searchTerm,
      searchAttributes: visibleAttributes,
      filters: filters,
      sort: [{ attribute: 'name', order: 'asc' }]
    });
  }, [allData, searchTerm, filters]);

  // 处理数据更新
  const handleDataChange = (updatedData: (WorldObject | TimelineEvent)[]) => {
    updatedData.forEach(item => {
      if ('startTime' in item) {
        // 这是一个事件
        updateEvent(item.id, item as TimelineEvent);
      } else {
        // 这是一个对象
        updateObject(item.id, item as WorldObject);
      }
    });
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* 搜索和过滤工具栏 */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="搜索属性内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            显示 {filteredData.length} / {allData.length} 项
          </div>
        </div>
      </div>
      
      {/* 表格视图 */}
      <div className="flex-1 overflow-hidden">
        <AttributeTableView 
          data={filteredData}
          visibleAttributes={visibleAttributes}
          editable={true}
          onDataChange={handleDataChange}
          onSelectionChange={(selectedIds) => {
            console.log('选择的项目:', selectedIds);
          }}
        />
      </div>
    </div>
  );
};

// 临时视图组件，展示不同视图的基本结构  
const DataTableView: React.FC = () => (
  <div className="h-full p-6 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
    <div className="text-6xl mb-4">📋</div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">数据表视图</h2>
    <p className="text-gray-600 text-center max-w-md">
      以表格形式展示所有对象和事件数据，支持排序、筛选和批量编辑。
      适合进行数据管理和批量操作。
    </p>
    <div className="mt-6 bg-white rounded shadow p-4">
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="font-bold p-2 bg-gray-100">名称</div>
        <div className="font-bold p-2 bg-gray-100">类型</div>
        <div className="font-bold p-2 bg-gray-100">时间</div>
        <div className="font-bold p-2 bg-gray-100">状态</div>
        <div className="p-2">示例对象1</div>
        <div className="p-2">人物</div>
        <div className="p-2">2024-01-01</div>
        <div className="p-2">✅ 已完成</div>
      </div>
    </div>
  </div>
);

const RelationshipView: React.FC = () => (
  <div className="h-full p-6 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-violet-100">
    <div className="text-6xl mb-4">🕸️</div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">关系图视图</h2>
    <p className="text-gray-600 text-center max-w-md">
      以网络图形式展示对象之间的关系和依赖。
      帮助理解复杂的关联关系和影响链。
    </p>
    <div className="mt-6 relative">
      <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">A</div>
      <div className="absolute top-8 left-20 w-px h-8 bg-gray-400 transform rotate-45"></div>
      <div className="absolute top-4 left-24 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center text-white font-bold">B</div>
      <div className="absolute top-12 left-8 w-16 h-16 bg-red-400 rounded-full flex items-center justify-center text-white font-bold">C</div>
    </div>
  </div>
);

const SpatialView: React.FC = () => (
  <div className="h-full p-6 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100">
    <div className="text-6xl mb-4">🗺️</div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">空间图视图</h2>
    <p className="text-gray-600 text-center max-w-md">
      在2D或3D空间中展示对象的位置关系。
      适合地理位置或空间布局的可视化。
    </p>
    <div className="mt-6 w-48 h-32 bg-white rounded shadow relative">
      <div className="absolute top-4 left-8 w-4 h-4 bg-red-500 rounded-full"></div>
      <div className="absolute top-12 left-20 w-4 h-4 bg-blue-500 rounded-full"></div>
      <div className="absolute bottom-8 right-12 w-4 h-4 bg-green-500 rounded-full"></div>
    </div>
  </div>
);

const DirectorView: React.FC = () => (
  <div className="h-full p-6 flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
    <div className="text-6xl mb-4">🎬</div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">导演台视图</h2>
    <p className="text-gray-600 text-center max-w-md">
      以故事叙述的方式组织和预览事件序列。
      适合创意写作和故事构建。
    </p>
    <div className="mt-6 flex space-x-2">
      <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center text-xs">场景1</div>
      <div className="text-gray-400">→</div>
      <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center text-xs">场景2</div>
      <div className="text-gray-400">→</div>
      <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center text-xs">场景3</div>
    </div>
  </div>
); 