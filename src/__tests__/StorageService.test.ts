import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { StorageService } from '../services/StorageService';
import { 
  WorldObject, 
  Event, 
  Timeline, 
  ProjectData, 
  AttributeType 
} from '../types';
import { tmpdir } from 'os';
import { join } from 'path';
import { existsSync } from 'fs';
import { rmSync } from 'fs';

describe('StorageService', () => {
  let storageService: StorageService;
  let tempDbPath: string;

  beforeEach(async () => {
    // 创建临时数据库目录
    tempDbPath = join(tmpdir(), `timeflow-test-${Date.now()}`);
    storageService = new StorageService(tempDbPath);
    await storageService.initialize();
  });

  afterEach(async () => {
    // 清理测试数据
    await storageService.close();
    if (existsSync(tempDbPath)) {
      rmSync(tempDbPath, { recursive: true, force: true });
    }
  });

  describe('初始化和基本操作', () => {
    test('应该成功初始化数据库', async () => {
      // 数据库应该已经在beforeEach中初始化
      expect(storageService).toBeDefined();
      
      // 测试获取统计信息
      const stats = await storageService.getStats();
      expect(stats.objectCount).toBe(0);
      expect(stats.eventCount).toBe(0);
      expect(stats.timelineCount).toBe(0);
    });

    test('应该能够清空所有数据', async () => {
      await storageService.clearAll();
      const stats = await storageService.getStats();
      expect(stats.objectCount).toBe(0);
    });
  });

  describe('对象管理', () => {
    const testObject: WorldObject = {
      id: 'test-character',
      name: '测试角色',
      attributes: [
        {
          id: 'age',
          name: '年龄',
          type: AttributeType.NUMBER,
          value: 25,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'status',
          name: '状态',
          type: AttributeType.ENUM,
          value: 'healthy',
          enumValues: ['healthy', 'injured', 'dead'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    test('应该能够保存和加载对象', async () => {
      await storageService.saveObject(testObject);
      
      const loaded = await storageService.loadObject('test-character');
      expect(loaded).toEqual(testObject);
    });

    test('应该能够获取所有对象', async () => {
      await storageService.saveObject(testObject);
      
      const objects = await storageService.getAllObjects();
      expect(objects).toHaveLength(1);
      expect(objects[0]).toEqual(testObject);
    });

    test('应该能够删除对象', async () => {
      await storageService.saveObject(testObject);
      await storageService.deleteObject('test-character');
      
      const loaded = await storageService.loadObject('test-character');
      expect(loaded).toBeNull();
    });

    test('加载不存在的对象应该返回null', async () => {
      const loaded = await storageService.loadObject('non-existent');
      expect(loaded).toBeNull();
    });
  });

  describe('事件管理', () => {
    const testObject: WorldObject = {
      id: 'test-character',
      name: '测试角色',
      attributes: [
        {
          id: 'age',
          name: '年龄',
          type: AttributeType.NUMBER,
          value: 25,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const testEvent: Event = {
      id: 'test-event',
      timestamp: Date.now(),
      objectId: 'test-character',
      attributeId: 'age',
      newValue: 26,
      oldValue: 25,
      description: '角色年龄增加',
      createdAt: new Date().toISOString()
    };

    test('应该能够保存和加载事件', async () => {
      // 先保存对象，因为事件验证需要对象存在
      await storageService.saveObject(testObject);
      await storageService.saveEvent(testEvent);
      
      const loaded = await storageService.loadEvent('test-event');
      expect(loaded).toEqual(testEvent);
    });

    test('应该能够根据条件查询事件', async () => {
      await storageService.saveObject(testObject);
      await storageService.saveEvent(testEvent);
      
      const events = await storageService.loadEvents({
        objectIds: ['test-character']
      });
      
      expect(events).toHaveLength(1);
      expect(events[0]).toEqual(testEvent);
    });

    test('应该能够根据时间范围查询事件', async () => {
      await storageService.saveObject(testObject);
      
      const event1 = { ...testEvent, id: 'event1', timestamp: 1000 };
      const event2 = { ...testEvent, id: 'event2', timestamp: 2000 };
      const event3 = { ...testEvent, id: 'event3', timestamp: 3000 };
      
      await storageService.saveEvent(event1);
      await storageService.saveEvent(event2);
      await storageService.saveEvent(event3);
      
      const events = await storageService.loadEvents({
        startTime: 1500,
        endTime: 2500
      });
      
      expect(events).toHaveLength(1);
      expect(events[0].id).toBe('event2');
    });

    test('应该能够删除事件', async () => {
      await storageService.saveObject(testObject);
      await storageService.saveEvent(testEvent);
      
      await storageService.deleteEvent('test-event');
      
      const loaded = await storageService.loadEvent('test-event');
      expect(loaded).toBeNull();
    });
  });

  describe('对象状态计算', () => {
    const testObject: WorldObject = {
      id: 'test-character',
      name: '测试角色',
      attributes: [
        {
          id: 'age',
          name: '年龄',
          type: AttributeType.NUMBER,
          value: 25,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'status',
          name: '状态',
          type: AttributeType.ENUM,
          value: 'healthy',
          enumValues: ['healthy', 'injured', 'dead'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    test('应该能够计算对象在指定时间点的状态', async () => {
      await storageService.saveObject(testObject);
      
      // 添加一些事件
      const event1: Event = {
        id: 'event1',
        timestamp: 1000,
        objectId: 'test-character',
        attributeId: 'age',
        newValue: 26,
        createdAt: new Date().toISOString()
      };
      
      const event2: Event = {
        id: 'event2',
        timestamp: 2000,
        objectId: 'test-character',
        attributeId: 'status',
        newValue: 'injured',
        createdAt: new Date().toISOString()
      };
      
      await storageService.saveEvent(event1);
      await storageService.saveEvent(event2);
      
      // 计算时间点1500的状态
      const state = await storageService.calculateObjectStateAtTime('test-character', 1500);
      
      expect(state).toBeDefined();
      expect(state!.attributeValues.age).toBe(26);
      expect(state!.attributeValues.status).toBe('healthy'); // 事件2还没发生
    });
  });

  describe('项目数据管理', () => {
    const testProject: ProjectData = {
      id: 'test-project',
      name: '测试项目',
      description: '这是一个测试项目',
      version: '1.0.0',
      objects: [
        {
          id: 'character-1',
          name: '角色1',
          attributes: [
            {
              id: 'age',
              name: '年龄',
              type: AttributeType.NUMBER,
              value: 25,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      timeline: {
        id: 'main',
        name: '主时间轴',
        currentTime: Date.now(),
        startTime: Date.now() - 86400000,
        endTime: Date.now() + 86400000,
        events: [
          {
            id: 'event-1',
            timestamp: Date.now(),
            objectId: 'character-1',
            attributeId: 'age',
            newValue: 26,
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    test('应该能够保存和加载完整项目', async () => {
      await storageService.saveProject(testProject);
      
      const loaded = await storageService.loadProject('test-project');
      expect(loaded).toBeDefined();
      expect(loaded!.name).toBe('测试项目');
      expect(loaded!.objects).toHaveLength(1);
      expect(loaded!.timeline.events).toHaveLength(1);
    });

    test('应该能够导出项目为JSON', async () => {
      await storageService.saveProject(testProject);
      
      const jsonData = await storageService.exportToJSON('test-project');
      const parsed = JSON.parse(jsonData);
      
      expect(parsed.name).toBe('测试项目');
      expect(parsed.objects).toHaveLength(1);
    });

    test('应该能够从JSON导入项目', async () => {
      const jsonData = JSON.stringify(testProject);
      await storageService.importFromJSON(jsonData);
      
      const loaded = await storageService.loadProject('test-project');
      expect(loaded).toBeDefined();
      expect(loaded!.name).toBe('测试项目');
    });

    test('导出不存在的项目应该抛出错误', async () => {
      await expect(storageService.exportToJSON('non-existent')).rejects.toThrow();
    });
  });
});