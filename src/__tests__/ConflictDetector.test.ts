import { describe, test, expect, beforeEach } from 'vitest';
import { ConflictDetector, ConflictType, ConflictSeverity } from '../services/ConflictDetector';
import { Event, WorldObject, AttributeType } from '../types';

describe('ConflictDetector', () => {
  let detector: ConflictDetector;
  let mockObjects: WorldObject[];

  beforeEach(() => {
    detector = new ConflictDetector();
    
    mockObjects = [
      {
        id: 'character-1',
        name: '测试角色',
        attributes: [
          {
            id: 'age',
            name: '年龄',
            type: AttributeType.NUMBER,
            value: 25,
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
          }
        ],
        createdAt: '2022-01-01T00:00:00.000Z',
        updatedAt: '2022-01-01T00:00:00.000Z'
      }
    ];
  });

  describe('规则管理', () => {
    test('应该包含默认规则', () => {
      const rules = detector.getRules();
      
      expect(rules.length).toBeGreaterThan(0);
      expect(rules.some(rule => rule.id === 'death-resurrection')).toBe(true);
      expect(rules.some(rule => rule.id === 'age-decrease')).toBe(true);
      expect(rules.some(rule => rule.id === 'invalid-state-transition')).toBe(true);
    });

    test('应该能添加自定义规则', () => {
      const customRule = {
        id: 'custom-rule',
        name: '自定义规则',
        description: '测试规则',
        enabled: true,
        severity: ConflictSeverity.MEDIUM,
        check: () => []
      };

      detector.addRule(customRule);
      const rules = detector.getRules();
      
      expect(rules.some(rule => rule.id === 'custom-rule')).toBe(true);
    });

    test('应该能启用/禁用规则', () => {
      detector.toggleRule('death-resurrection', false);
      const rules = detector.getRules();
      const rule = rules.find(r => r.id === 'death-resurrection');
      
      expect(rule?.enabled).toBe(false);
    });
  });

  describe('死后复活检测', () => {
    test('应该检测到死后复活冲突', () => {
      const events: Event[] = [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'status',
          newValue: 'dead',
          description: '角色死亡',
          createdAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'event-2',
          timestamp: 2000,
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 26,
          description: '年龄增长',
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      const conflicts = detector.detectConflicts(events, mockObjects);
      
      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts.some(c => c.type === ConflictType.LOGICAL_INCONSISTENCY)).toBe(true);
      expect(conflicts.some(c => c.title.includes('死后复活'))).toBe(true);
    });

    test('不应该对正常情况报告冲突', () => {
      const events: Event[] = [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 26,
          description: '年龄增长',
          createdAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'event-2',
          timestamp: 2000,
          objectId: 'character-1',
          attributeId: 'status',
          newValue: 'injured',
          description: '受伤',
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      const conflicts = detector.detectConflicts(events, mockObjects);
      
      expect(conflicts.filter(c => c.type === ConflictType.LOGICAL_INCONSISTENCY).length).toBe(0);
    });
  });

  describe('年龄递减检测', () => {
    test('应该检测到异常年龄递减', () => {
      const events: Event[] = [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 30,
          description: '年龄增长',
          createdAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'event-2',
          timestamp: 2000, // 1秒后
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 25,
          description: '年龄递减',
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      const conflicts = detector.detectConflicts(events, mockObjects);
      
      expect(conflicts.some(c => c.title.includes('年龄递减'))).toBe(true);
    });

    test('应该允许合理的年龄变化', () => {
      const events: Event[] = [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 30,
          description: '年龄增长',
          createdAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'event-2',
          timestamp: 365 * 24 * 60 * 60 * 1000 + 1000, // 1年后
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 29, // 轻微递减
          description: '年龄调整',
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      const conflicts = detector.detectConflicts(events, mockObjects);
      
      expect(conflicts.filter(c => c.title.includes('年龄递减')).length).toBe(0);
    });
  });

  describe('状态转换检测', () => {
    test('应该检测到无效状态转换', () => {
      const events: Event[] = [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'status',
          newValue: 'dead',
          description: '角色死亡',
          createdAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'event-2',
          timestamp: 2000,
          objectId: 'character-1',
          attributeId: 'status',
          newValue: 'healthy',
          description: '直接复活',
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      const conflicts = detector.detectConflicts(events, mockObjects);
      
      expect(conflicts.some(c => c.type === ConflictType.STATE_VIOLATION)).toBe(true);
    });

    test('应该允许合理的状态转换', () => {
      const events: Event[] = [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'status',
          newValue: 'injured',
          description: '受伤',
          createdAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'event-2',
          timestamp: 2000,
          objectId: 'character-1',
          attributeId: 'status',
          newValue: 'healthy',
          description: '康复',
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      const conflicts = detector.detectConflicts(events, mockObjects);
      
      expect(conflicts.filter(c => c.type === ConflictType.STATE_VIOLATION).length).toBe(0);
    });
  });

  describe('时间顺序检测', () => {
    test('应该检测到时间悖论', () => {
      const events: Event[] = [
        {
          id: 'event-1',
          timestamp: new Date('2021-12-31T00:00:00.000Z').getTime(), // 对象创建前
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 26,
          description: '在创建前的事件',
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      const conflicts = detector.detectConflicts(events, mockObjects);
      
      expect(conflicts.some(c => c.type === ConflictType.TEMPORAL_PARADOX)).toBe(true);
    });
  });

  describe('单个事件检测', () => {
    test('应该检测新事件是否会引起冲突', () => {
      const existingEvents: Event[] = [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'status',
          newValue: 'dead',
          description: '角色死亡',
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      const newEvent: Event = {
        id: 'event-2',
        timestamp: 2000,
        objectId: 'character-1',
        attributeId: 'age',
        newValue: 26,
        description: '死后年龄增长',
        createdAt: '2022-01-01T00:00:00.000Z'
      };

      const conflicts = detector.checkSingleEvent(newEvent, existingEvents, mockObjects);
      
      expect(conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('冲突统计', () => {
    test('应该正确计算冲突统计信息', () => {
      const events: Event[] = [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'status',
          newValue: 'dead',
          createdAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'event-2',
          timestamp: 2000,
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 26,
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      const conflicts = detector.detectConflicts(events, mockObjects);
      const stats = detector.getConflictStatistics(conflicts);
      
      expect(stats.total).toBe(conflicts.length);
      expect(typeof stats.bySeverity).toBe('object');
      expect(typeof stats.byType).toBe('object');
    });
  });

  describe('冲突去重', () => {
    test('应该去除重复的冲突', () => {
      const events: Event[] = [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'status',
          newValue: 'dead',
          createdAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'event-2',
          timestamp: 2000,
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 26,
          createdAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'event-3',
          timestamp: 3000,
          objectId: 'character-1',
          attributeId: 'status',
          newValue: 'healthy',
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      const conflicts = detector.detectConflicts(events, mockObjects);
      
      // 应该只有一个死后复活冲突，即使有多个违反事件
      const deathConflicts = conflicts.filter(c => c.title.includes('死后复活'));
      expect(deathConflicts.length).toBe(1);
    });
  });

  describe('规则禁用', () => {
    test('禁用的规则不应该检测冲突', () => {
      detector.toggleRule('death-resurrection', false);
      
      const events: Event[] = [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'status',
          newValue: 'dead',
          createdAt: '2022-01-01T00:00:00.000Z'
        },
        {
          id: 'event-2',
          timestamp: 2000,
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 26,
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      const conflicts = detector.detectConflicts(events, mockObjects);
      
      expect(conflicts.filter(c => c.title.includes('死后复活')).length).toBe(0);
    });
  });

  describe('边界条件', () => {
    test('应该处理空事件列表', () => {
      const conflicts = detector.detectConflicts([], mockObjects);
      
      expect(conflicts.length).toBe(0);
    });

    test('应该处理空对象列表', () => {
      const events: Event[] = [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 26,
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      const conflicts = detector.detectConflicts(events, []);
      
      // 可能会有一些冲突（如找不到对象），但不应该崩溃
      expect(Array.isArray(conflicts)).toBe(true);
    });

    test('应该处理规则执行错误', () => {
      const faultyRule = {
        id: 'faulty-rule',
        name: '错误规则',
        description: '会抛出错误的规则',
        enabled: true,
        severity: ConflictSeverity.LOW,
        check: () => {
          throw new Error('规则执行失败');
        }
      };

      detector.addRule(faultyRule);
      
      const events: Event[] = [
        {
          id: 'event-1',
          timestamp: 1000,
          objectId: 'character-1',
          attributeId: 'age',
          newValue: 26,
          createdAt: '2022-01-01T00:00:00.000Z'
        }
      ];

      // 不应该因为单个规则错误而崩溃
      expect(() => {
        detector.detectConflicts(events, mockObjects);
      }).not.toThrow();
    });
  });

  describe('冲突历史', () => {
    test('应该能管理冲突历史', () => {
      expect(detector.getConflictHistory().length).toBe(0);
      
      detector.clearConflictHistory();
      
      expect(detector.getConflictHistory().length).toBe(0);
    });
  });
});