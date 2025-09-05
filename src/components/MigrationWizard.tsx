/**
 * 数据迁移向导
 */

import React, { useState } from 'react';
import { useProjectStore } from '../store';
import { useDocumentStore } from '../store/documentStore';
import { migrateObjectsToDocuments, getMigrationStats, needsMigration } from '../utils/dataMigration';

interface MigrationWizardProps {
  onClose: () => void;
}

export const MigrationWizard: React.FC<MigrationWizardProps> = ({ onClose }) => {
  const { getObjects } = useProjectStore();
  const { documents, importDocuments } = useDocumentStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const objects = getObjects();
  const stats = getMigrationStats(objects);
  const needsMigrate = needsMigration(objects, documents);

  const handleMigration = async () => {
    if (!needsMigrate) return;
    
    setIsProcessing(true);
    try {
      const migratedDocs = migrateObjectsToDocuments(objects);
      const exportData = JSON.stringify({ documents: migratedDocs, links: [] });
      importDocuments(exportData);
      
      alert(`成功迁移 ${migratedDocs.length} 个对象到文档系统！`);
      onClose();
    } catch (error) {
      console.error('迁移失败:', error);
      alert('迁移失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!needsMigrate) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-bold mb-4">数据迁移</h3>
          <p>您的数据已经是最新格式，无需迁移。</p>
          <div className="mt-4 flex justify-end">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={onClose}
            >
              确定
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h3 className="text-lg font-bold mb-4">数据迁移向导</h3>
        
        <div className="mb-4">
          <p className="mb-2">检测到您有现有的对象数据，是否要迁移到新的文档系统？</p>
          
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-medium mb-2">迁移统计:</h4>
            <ul className="text-sm space-y-1">
              <li>总对象数: {stats.totalObjects}</li>
              <li>总属性数: {stats.totalAttributes}</li>
              <li>预计生成文档: {stats.estimatedDocuments}</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            onClick={onClose}
            disabled={isProcessing}
          >
            稍后处理
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={handleMigration}
            disabled={isProcessing}
          >
            {isProcessing ? '迁移中...' : '开始迁移'}
          </button>
        </div>
      </div>
    </div>
  );
}; 