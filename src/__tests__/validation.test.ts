import { describe, test, expect } from 'vitest';
import {
  validateId,
  validateTimestamp,
  validateAttributeValue,
  validateAttribute,
  validateWorldObject,
  validateEvent,
  validateTimeline,
  validateProjectData,
  ValidationError
} from '../utils/validation';
import {
  AttributeType,
  Attribute,
  WorldObject,
  Event,
  Timeline,
  ProjectData
} from '../types';

describe('数据验证功能测试', () => {
  
  describe('基础验证函数', () => {
    test('validateId - 有效ID', () => {
      expect(validateId('valid-id_123')).toBe(true);
      expect(validateId('user1')).toBe(true);
      expect(validateId('object-name')).toBe(true);
    });

    test('validateId - 无效ID', () => {
      expect(validateId('')).toBe(false);
      expect(validateId('invalid id')).toBe(false);
      expect(validateId('id@#$')).toBe(false);
    });

    test('validateTimestamp - 有效时间戳', () => {
      const now = Date.now();
      expect(validateTimestamp(now)).toBe(true);
      expect(validateTimestamp(now - 86400000)).toBe(true); // 一天前
    });

    test('validateTimestamp - 无效时间戳', () => {
      expect(validateTimestamp(0)).toBe(false);
      expect(validateTimestamp(-1)).toBe(false);
      expect(validateTimestamp(Date.now() + 400 * 24 * 60 * 60 * 1000)).toBe(false); // 太遥远的未来
    });
  });

  describe('属性值验证', () => {
    test('文本属性值验证', () => {
      const textAttr: Attribute = {
        id: 'text-attr',
        name: '文本属性',
        type: AttributeType.TEXT,
        value: 'test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(validateAttributeValue('hello', textAttr)).toBe(true);
      expect(validateAttributeValue(null, textAttr)).toBe(true);
      expect(validateAttributeValue(123, textAttr)).toBe(false);
    });

    test('数字属性值验证', () => {
      const numberAttr: Attribute = {
        id: 'number-attr',
        name: '数字属性',
        type: AttributeType.NUMBER,
        value: 42,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(validateAttributeValue(123, numberAttr)).toBe(true);
      expect(validateAttributeValue(0, numberAttr)).toBe(true);
      expect(validateAttributeValue(-45.6, numberAttr)).toBe(true);
      expect(validateAttributeValue(null, numberAttr)).toBe(true);
      expect(validateAttributeValue('123', numberAttr)).toBe(false);
      expect(validateAttributeValue(NaN, numberAttr)).toBe(false);
    });

    test('枚举属性值验证', () => {
      const enumAttr: Attribute = {
        id: 'enum-attr',
        name: '枚举属性',
        type: AttributeType.ENUM,
        value: 'healthy',
        enumValues: ['healthy', 'injured', 'dead'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(validateAttributeValue('healthy', enumAttr)).toBe(true);
      expect(validateAttributeValue('injured', enumAttr)).toBe(true);
      expect(validateAttributeValue(null, enumAttr)).toBe(true);
      expect(validateAttributeValue('invalid', enumAttr)).toBe(false);
      expect(validateAttributeValue(123, enumAttr)).toBe(false);
    });
  });

  describe('属性验证', () => {
    test('有效属性', () => {
      const validAttribute: Attribute = {
        id: 'valid-attr',
        name: '有效属性',
        type: AttributeType.TEXT,
        value: 'test value',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(() => validateAttribute(validAttribute)).not.toThrow();
    });

    test('无效属性 - 缺少ID', () => {
      const invalidAttribute: Attribute = {
        id: '',
        name: '属性',
        type: AttributeType.TEXT,
        value: 'test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(() => validateAttribute(invalidAttribute)).toThrow(ValidationError);
    });

    test('枚举属性缺少可选值', () => {
      const enumAttr: Attribute = {
        id: 'enum-attr',
        name: '枚举属性',
        type: AttributeType.ENUM,
        value: 'value1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(() => validateAttribute(enumAttr)).toThrow(ValidationError);
    });
  });

  describe('世界对象验证', () => {
    test('有效世界对象', () => {
      const validObject: WorldObject = {
        id: 'character-1',
        name: '角色A',
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

      expect(() => validateWorldObject(validObject)).not.toThrow();
    });

    test('重复属性ID', () => {
      const invalidObject: WorldObject = {
        id: 'character-1',
        name: '角色A',
        attributes: [
          {
            id: 'duplicate-id',
            name: '属性1',
            type: AttributeType.TEXT,
            value: 'value1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'duplicate-id',
            name: '属性2',
            type: AttributeType.TEXT,
            value: 'value2',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(() => validateWorldObject(invalidObject)).toThrow(ValidationError);
    });
  });

  describe('事件验证', () => {
    const testObjects: WorldObject[] = [
      {
        id: 'character-1',
        name: '角色A',
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
    ];

    test('有效事件', () => {
      const validEvent: Event = {
        id: 'event-1',
        timestamp: Date.now(),
        objectId: 'character-1',
        attributeId: 'age',
        newValue: 26,
        oldValue: 25,
        createdAt: new Date().toISOString()
      };

      expect(() => validateEvent(validEvent, testObjects)).not.toThrow();
    });

    test('引用不存在的对象', () => {
      const invalidEvent: Event = {
        id: 'event-1',
        timestamp: Date.now(),
        objectId: 'non-existent',
        attributeId: 'age',
        newValue: 26,
        createdAt: new Date().toISOString()
      };

      expect(() => validateEvent(invalidEvent, testObjects)).toThrow(ValidationError);
    });

    test('引用不存在的属性', () => {
      const invalidEvent: Event = {
        id: 'event-1',
        timestamp: Date.now(),
        objectId: 'character-1',
        attributeId: 'non-existent',
        newValue: 26,
        createdAt: new Date().toISOString()
      };

      expect(() => validateEvent(invalidEvent, testObjects)).toThrow(ValidationError);
    });
  });

  describe('时间轴验证', () => {
    const testObjects: WorldObject[] = [
      {
        id: 'character-1',
        name: '角色A',
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
    ];

    test('有效时间轴', () => {
      const now = Date.now();
      const validTimeline: Timeline = {
        id: 'timeline-1',
        name: '主时间轴',
        currentTime: now,
        startTime: now - 86400000,
        endTime: now + 86400000,
        events: [
          {
            id: 'event-1',
            timestamp: now,
            objectId: 'character-1',
            attributeId: 'age',
            newValue: 26,
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(() => validateTimeline(validTimeline, testObjects)).not.toThrow();
    });

    test('开始时间晚于结束时间', () => {
      const now = Date.now();
      const invalidTimeline: Timeline = {
        id: 'timeline-1',
        name: '主时间轴',
        currentTime: now,
        startTime: now + 86400000,
        endTime: now - 86400000,
        events: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(() => validateTimeline(invalidTimeline, testObjects)).toThrow(ValidationError);
    });
  });

  describe('项目数据验证', () => {
    test('完整的项目数据验证', () => {
      const now = Date.now();
      const validProject: ProjectData = {
        id: 'project-1',
        name: '测试项目',
        description: '项目描述',
        version: '1.0.0',
        objects: [
          {
            id: 'character-1',
            name: '角色A',
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
          id: 'timeline-1',
          name: '主时间轴',
          currentTime: now,
          startTime: now - 86400000,
          endTime: now + 86400000,
          events: [
            {
              id: 'event-1',
              timestamp: now,
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

      expect(() => validateProjectData(validProject)).not.toThrow();
    });

    test('无效的版本格式', () => {
      const invalidProject: ProjectData = {
        id: 'project-1',
        name: '测试项目',
        version: 'invalid-version',
        objects: [],
        timeline: {
          id: 'timeline-1',
          name: '主时间轴',
          currentTime: Date.now(),
          startTime: Date.now() - 86400000,
          endTime: Date.now() + 86400000,
          events: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(() => validateProjectData(invalidProject)).toThrow(ValidationError);
    });
  });
});