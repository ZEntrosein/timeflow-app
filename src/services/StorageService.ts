// 浏览器兼容的存储服务
import { 
  WorldObject, 
  Event, 
  Timeline, 
  ProjectData, 
  TimelineQueryOptions,
  ObjectState 
} from '../types';
import { validateWorldObject, validateEvent, validateProjectData, validateTimeline } from '../utils/validation';

/**
 * 浏览器存储服务类
 * 使用IndexedDB和localStorage实现本地数据持久化
 */
export class StorageService {
  private isInitialized: boolean = false;
  private db: IDBDatabase | null = null;
  private readonly dbName = 'timeflow-data';
  private readonly dbVersion = 1;

  constructor() {
    // 浏览器环境初始化
  }

  /**
   * 初始化数据库连接
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        // 使用IndexedDB
        await this.initIndexedDB();
      } else {
        // 降级到localStorage
        console.warn('IndexedDB not available, using localStorage fallback');
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      // 降级到内存存储
      this.isInitialized = true;
    }
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains('objects')) {
          db.createObjectStore('objects', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('events')) {
          const eventStore = db.createObjectStore('events', { keyPath: 'id' });
          eventStore.createIndex('timestamp', 'timestamp');
          eventStore.createIndex('objectId', 'objectId');
        }
        
        if (!db.objectStoreNames.contains('timelines')) {
          db.createObjectStore('timelines', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.isInitialized = false;
  }

  /**
   * 检查数据库是否已初始化
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Storage service not initialized. Call initialize() first.');
    }
  }

  /**
   * 保存世界对象
   */
  async saveObject(obj: WorldObject): Promise<void> {
    this.ensureInitialized();
    validateWorldObject(obj);
    
    if (this.db) {
      const transaction = this.db.transaction(['objects'], 'readwrite');
      const store = transaction.objectStore('objects');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(obj);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } else {
      // localStorage fallback
      const key = `object:${obj.id}`;
      localStorage.setItem(key, JSON.stringify(obj));
    }
  }

  /**
   * 加载世界对象
   */
  async loadObject(id: string): Promise<WorldObject | null> {
    this.ensureInitialized();
    
    if (this.db) {
      const transaction = this.db.transaction(['objects'], 'readonly');
      const store = transaction.objectStore('objects');
      return new Promise<WorldObject | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } else {
      // localStorage fallback
      const key = `object:${id}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  }

  /**
   * 加载所有对象
   */
  async loadObjects(): Promise<WorldObject[]> {
    this.ensureInitialized();
    
    if (this.db) {
      const transaction = this.db.transaction(['objects'], 'readonly');
      const store = transaction.objectStore('objects');
      return new Promise<WorldObject[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } else {
      // localStorage fallback
      const objects: WorldObject[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('object:')) {
          const data = localStorage.getItem(key);
          if (data) {
            objects.push(JSON.parse(data));
          }
        }
      }
      return objects;
    }
  }

  /**
   * 获取所有对象（loadObjects的别名）
   */
  async getAllObjects(): Promise<WorldObject[]> {
    return this.loadObjects();
  }

  /**
   * 保存事件
   */
  async saveEvent(event: Event): Promise<void> {
    this.ensureInitialized();
    
    // 先加载对象进行验证
    const objects = await this.loadObjects();
    validateEvent(event, objects);
    
    if (this.db) {
      const transaction = this.db.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(event);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } else {
      // localStorage fallback
      const key = `event:${event.id}`;
      localStorage.setItem(key, JSON.stringify(event));
    }
  }

  /**
   * 加载事件
   */
  async loadEvents(options?: TimelineQueryOptions): Promise<Event[]> {
    this.ensureInitialized();
    
    let events: Event[] = [];
    
    if (this.db) {
      const transaction = this.db.transaction(['events'], 'readonly');
      const store = transaction.objectStore('events');
      events = await new Promise<Event[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } else {
      // localStorage fallback
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('event:')) {
          const data = localStorage.getItem(key);
          if (data) {
            events.push(JSON.parse(data));
          }
        }
      }
    }

    // 应用过滤选项
    if (options) {
      events = this.filterEvents(events, options);
    }

    // 排序
    events.sort((a, b) => a.timestamp - b.timestamp);
    
    return events;
  }

  /**
   * 过滤事件
   */
  private filterEvents(events: Event[], options: TimelineQueryOptions): Event[] {
    let filtered = events;

    if (options.objectIds && options.objectIds.length > 0) {
      filtered = filtered.filter(event => options.objectIds!.includes(event.objectId));
    }

    if (options.startTime !== undefined) {
      filtered = filtered.filter(event => event.timestamp >= options.startTime!);
    }

    if (options.endTime !== undefined) {
      filtered = filtered.filter(event => event.timestamp <= options.endTime!);
    }

    if (options.attributeIds && options.attributeIds.length > 0) {
      filtered = filtered.filter(event => options.attributeIds!.includes(event.attributeId));
    }

    // 排序
    if (options.sortBy === 'timestamp') {
      filtered.sort((a, b) => {
        const direction = options.sortOrder === 'desc' ? -1 : 1;
        return (a.timestamp - b.timestamp) * direction;
      });
    }

    // 限制数量
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * 删除对象
   */
  async deleteObject(id: string): Promise<void> {
    this.ensureInitialized();
    
    if (this.db) {
      const transaction = this.db.transaction(['objects'], 'readwrite');
      const store = transaction.objectStore('objects');
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } else {
      // localStorage fallback
      const key = `object:${id}`;
      localStorage.removeItem(key);
    }
  }

  /**
   * 删除事件
   */
  async deleteEvent(id: string): Promise<void> {
    this.ensureInitialized();
    
    if (this.db) {
      const transaction = this.db.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } else {
      // localStorage fallback
      const key = `event:${id}`;
      localStorage.removeItem(key);
    }
  }

  /**
   * 计算对象在指定时间的状态
   */
  async calculateObjectStateAtTime(objectId: string, timestamp: number): Promise<ObjectState | null> {
    const obj = await this.loadObject(objectId);
    if (!obj) return null;

    const events = await this.loadEvents({
      objectIds: [objectId],
      endTime: timestamp,
      sortBy: 'timestamp',
      sortOrder: 'asc'
    });

    // 从对象的初始属性值开始
    const attributeValues: Record<string, string | number | null> = {};
    obj.attributes.forEach(attr => {
      attributeValues[attr.id] = attr.value;
    });

    // 应用时间戳之前的所有事件
    events.forEach(event => {
      if (event.timestamp <= timestamp) {
        attributeValues[event.attributeId] = event.newValue;
      }
    });

    return {
      objectId,
      timestamp,
      attributeValues
    };
  }

  /**
   * 保存项目数据
   */
  async saveProject(projectData: ProjectData): Promise<void> {
    this.ensureInitialized();
    validateProjectData(projectData);
    
    if (this.db) {
      const transaction = this.db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      await new Promise<void>((resolve, reject) => {
        const request = store.put(projectData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } else {
      // localStorage fallback
      const key = `project:${projectData.id}`;
      localStorage.setItem(key, JSON.stringify(projectData));
    }
  }

  /**
   * 加载项目数据
   */
  async loadProject(id: string): Promise<ProjectData | null> {
    this.ensureInitialized();
    
    if (this.db) {
      const transaction = this.db.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      return new Promise<ProjectData | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } else {
      // localStorage fallback
      const key = `project:${id}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  }

  /**
   * 获取数据库统计信息
   */
  async getStats(): Promise<{
    objectCount: number;
    eventCount: number;
    timelineCount: number;
    projectCount: number;
  }> {
    this.ensureInitialized();
    
    const [objects, events] = await Promise.all([
      this.loadObjects(),
      this.loadEvents()
    ]);

    return {
      objectCount: objects.length,
      eventCount: events.length,
      timelineCount: 1, // 简化实现
      projectCount: 1   // 简化实现
    };
  }
}