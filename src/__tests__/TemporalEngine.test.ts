import { describe, test, expect, beforeEach, vi } from 'vitest';
import { TemporalEngine } from '../services/TemporalEngine';
import { Event, WorldObject, AttributeType } from '../types';

describe('TemporalEngine', () => {
  let engine: TemporalEngine;
  let mockObject: WorldObject;
  let mockEvents: Event[];

  beforeEach(() => {
    engine = new TemporalEngine();
    
    mockObject = {
      id: 'character-1',
      name: '测试角色',
      attributes: [
        {
          id: 'age',
          name: '年龄',
          type: AttributeType.NUMBER,
          value: 20,
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'status',
          name: '状态',
          type: AttributeType.ENUM,
          value: 'healthy',
          enumValues: ['healthy', 'injured', 'dead'],
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'name',
          name: '姓名',
          type: AttributeType.TEXT,
          value: '张三',
          createdAt: '2022-01-01T00:00:00.000Z',
          updatedAt: '2022-01-01T00:00:00.000Z'
        }
      ],
      createdAt: '2022-01-01T00:00:00.000Z',
      updatedAt: '2022-01-01T00:00:00.000Z'
    };

    mockEvents = [
      {
        id: 'event-1',
        timestamp: 1640995200000, // 2022-01-01 00:00:00
        objectId: 'character-1',
        attributeId: 'age',
        newValue: 21,
        oldValue: 20,
        description: '生日',
        createdAt: '2022-01-01T00:00:00.000Z'
      },
      {
        id: 'event-2',
        timestamp: 1641081600000, // 2022-01-02 00:00:00
        objectId: 'character-1',
        attributeId: 'status',
        newValue: 'injured',
        oldValue: 'healthy',
        description: '受伤',
        createdAt: '2022-01-02T00:00:00.000Z'
      },
      {
        id: 'event-3',
        timestamp: 1641168000000, // 2022-01-03 00:00:00
        objectId: 'character-1',
        attributeId: 'age',
        newValue: 22,
        oldValue: 21,
        description: '又一个生日',
        createdAt: '2022-01-03T00:00:00.000Z'
      },
      {
        id: 'event-4',
        timestamp: 1641254400000, // 2022-01-04 00:00:00
        objectId: 'character-1',
        attributeId: 'status',
        newValue: 'healthy',
        oldValue: 'injured',
        description: '康复',
        createdAt: '2022-01-04T00:00:00.000Z'
      }
    ];
  });

  describe('基本状态计算', () => {
    test('应该正确计算初始状态', () => {
      const timestamp = 1640908800000; // 2021-12-31 00:00:00 (事件之前)
      const state = engine.calculateStateAtTime('character-1', timestamp, mockEvents, mockObject);
      
      expect(state.objectId).toBe('character-1');
      expect(state.timestamp).toBe(timestamp);
      expect(state.attributeValues.age).toBe(20); // 初始值
      expect(state.attributeValues.status).toBe('healthy'); // 初始值
      expect(state.attributeValues.name).toBe('张三'); // 初始值
    });

    test('应该正确计算单个事件后的状态', () => {
      const timestamp = 1641038400000; // 2022-01-01 12:00:00 (event-1之后)
      const state = engine.calculateStateAtTime('character-1', timestamp, mockEvents, mockObject);
      
      expect(state.attributeValues.age).toBe(21); // 更新后的值
      expect(state.attributeValues.status).toBe('healthy'); // 未变化
      expect(state.attributeValues.name).toBe('张三'); // 未变化
    });

    test('应该正确计算多个事件后的状态', () => {
      const timestamp = 1641211200000; // 2022-01-03 12:00:00 (event-3之后，event-4之前)
      const state = engine.calculateStateAtTime('character-1', timestamp, mockEvents, mockObject);
      
      expect(state.attributeValues.age).toBe(22); // event-3更新的值
      expect(state.attributeValues.status).toBe('injured'); // event-2更新的值
      expect(state.attributeValues.name).toBe('张三'); // 未变化
    });

    test('应该正确计算所有事件后的状态', () => {
      const timestamp = 1641340800000; // 2022-01-05 00:00:00 (所有事件之后)
      const state = engine.calculateStateAtTime('character-1', timestamp, mockEvents, mockObject);
      
      expect(state.attributeValues.age).toBe(22); // event-3更新的值
      expect(state.attributeValues.status).toBe('healthy'); // event-4更新的值
      expect(state.attributeValues.name).toBe('张三'); // 未变化
    });
  });

  describe('边界条件', () => {
    test('应该处理空事件列表', () => {
      const timestamp = 1641038400000;
      const state = engine.calculateStateAtTime('character-1', timestamp, [], mockObject);
      
      expect(state.attributeValues.age).toBe(20); // 初始值
      expect(state.attributeValues.status).toBe('healthy'); // 初始值
    });

    test('应该处理不存在的对象', () => {
      const timestamp = 1641038400000;
      const state = engine.calculateStateAtTime('non-existent', timestamp, mockEvents, mockObject);
      
      // 由于传入的是错误的objectId，但对象数据是正确的，应该基于对象数据计算
      expect(state.objectId).toBe('non-existent');
    });

    test('应该处理事件时间戳正好等于查询时间戳', () => {
      const timestamp = 1640995200000; // 正好等于event-1的时间戳
      const state = engine.calculateStateAtTime('character-1', timestamp, mockEvents, mockObject);
      
      expect(state.attributeValues.age).toBe(21); // 应该包含该事件的更新
    });
  });

  describe('性能优化', () => {
    test('应该使用缓存提高性能', () => {
      const timestamp = 1641038400000;
      
      // 第一次计算
      const state1 = engine.calculateStateAtTime('character-1', timestamp, mockEvents, mockObject);
      
      // 第二次计算（应该使用缓存）
      const state2 = engine.calculateStateAtTime('character-1', timestamp, mockEvents, mockObject);
      
      expect(state1).toEqual(state2);
      
      // 验证缓存统计
      const stats = engine.getCacheStats();
      expect(stats.stateCacheSize).toBeGreaterThan(0);
    });

    test('应该正确处理大量事件', () => {
      // 生成1000个事件
      const manyEvents: Event[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `event-${i}`,
        timestamp: 1640995200000 + (i * 3600000), // 每小时一个事件
        objectId: 'character-1',
        attributeId: 'age',
        newValue: 20 + i,
        createdAt: new Date().toISOString()
      }));

      const timestamp = 1640995200000 + (500 * 3600000); // 第500个事件的时间
      const state = engine.calculateStateAtTime('character-1', timestamp, manyEvents, mockObject);
      
      expect(state.attributeValues.age).toBe(520); // 20 + 500
    });
  });

  describe('批量计算', () => {
    test('应该能批量计算多个对象的状态', () => {
      const objects = [mockObject];
      const timestamp = 1641038400000;
      
      const states = engine.calculateMultipleStatesAtTime(
        ['character-1'],
        timestamp,
        mockEvents,
        objects
      );
      
      expect(states.size).toBe(1);
      expect(states.get('character-1')?.attributeValues.age).toBe(21);
    });

    test('应该能计算状态历史', () => {
      const startTime = 1640995200000;
      const endTime = 1641254400000;
      const sampleInterval = 86400000; // 1天
      
      const history = engine.calculateStateHistory(
        'character-1',
        startTime,
        endTime,
        mockEvents,
        mockObject,
        sampleInterval
      );
      
      expect(history.length).toBeGreaterThan(0);
      // 验证历史记录是按时间排序的
      for (let i = 1; i < history.length; i++) {
        expect(history[i].timestamp).toBeGreaterThanOrEqual(history[i-1].timestamp);
      }
    });
  });

  describe('辅助方法', () => {
    test('应该能找到属性的最后一个事件', () => {
      const timestamp = 1641211200000; // 2022-01-03 12:00:00
      const lastEvent = engine.findLastEventForAttribute(
        'character-1',
        'age',
        timestamp,
        mockEvents
      );
      
      expect(lastEvent?.id).toBe('event-3'); // 最后一个影响age的事件
      expect(lastEvent?.newValue).toBe(22);
    });

    test('应该能检查对象在指定时间是否存在', () => {
      const timestamp = 1641038400000;
      const exists = engine.objectExistsAtTime('character-1', timestamp, mockEvents, mockObject);
      
      expect(exists).toBe(true);
    });

    test('应该能统计属性变化次数', () => {
      const startTime = 1640995200000;
      const endTime = 1641254400000;
      
      const changeCount = engine.getAttributeChangeCount(
        'character-1',
        'age',
        startTime,
        endTime,
        mockEvents
      );
      
      expect(changeCount).toBe(2); // event-1 和 event-3
    });
  });

  describe('缓存管理', () => {
    test('应该能清理缓存', () => {
      // 先进行一些计算以填充缓存
      engine.calculateStateAtTime('character-1', 1641038400000, mockEvents, mockObject);
      
      let stats = engine.getCacheStats();
      expect(stats.stateCacheSize).toBeGreaterThan(0);
      
      // 清理缓存
      engine.clearCache();
      
      stats = engine.getCacheStats();
      expect(stats.stateCacheSize).toBe(0);
      expect(stats.eventCacheSize).toBe(0);
    });

    test('应该能预热缓存', () => {
      const objectIds = ['character-1'];
      const timestamps = [1641038400000, 1641124800000, 1641211200000];
      const objects = [mockObject];
      
      engine.warmUpCache(objectIds, timestamps, mockEvents, objects);
      
      const stats = engine.getCacheStats();
      expect(stats.stateCacheSize).toBe(3); // 预热了3个时间点
    });

    test('缓存应该有大小限制', () => {
      // 超过缓存大小限制的计算
      for (let i = 0; i < 1200; i++) {
        engine.calculateStateAtTime('character-1', 1641038400000 + i, mockEvents, mockObject);
      }
      
      const stats = engine.getCacheStats();
      expect(stats.stateCacheSize).toBeLessThanOrEqual(stats.maxCacheSize);
    });
  });

  describe('二分查找优化', () => {
    test('应该正确使用二分查找', () => {
      // 创建大量有序事件来测试二分查找
      const orderedEvents: Event[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `event-${i}`,
        timestamp: 1640995200000 + (i * 1000), // 每秒一个事件
        objectId: 'character-1',
        attributeId: 'age',
        newValue: 20 + i,
        createdAt: new Date().toISOString()
      }));

      const timestamp = 1640995200000 + (500 * 1000); // 第500个事件的时间
      const state = engine.calculateStateAtTime('character-1', timestamp, orderedEvents, mockObject);
      
      expect(state.attributeValues.age).toBe(520); // 20 + 500 (包含第500个事件)
    });
  });
});