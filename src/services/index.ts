// 服务层目录索引文件
// 用于数据持久化、API调用等服务

import { StorageService } from './StorageService';
import { TemporalEngine } from './TemporalEngine';
import { ConflictDetector } from './ConflictDetector';

// 导出类型和类
export { StorageService } from './StorageService';
export { TemporalEngine } from './TemporalEngine';
export { ConflictDetector, ConflictType, ConflictSeverity } from './ConflictDetector';
export type { ConflictResult, ConflictRule } from './ConflictDetector';

// 创建默认服务实例
export const defaultStorageService = new StorageService();
export const defaultTemporalEngine = new TemporalEngine();
export const defaultConflictDetector = new ConflictDetector();