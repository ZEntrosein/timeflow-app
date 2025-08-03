import { 
  WorldObject, 
  Attribute, 
  Event, 
  Timeline, 
  ProjectData, 
  AttributeType 
} from '../types';

/**
 * 数据验证错误类
 */
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 验证字符串是否为有效的ID格式
 */
export function validateId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && /^[a-zA-Z0-9_-]+$/.test(id);
}

/**
 * 验证时间戳是否有效
 */
export function validateTimestamp(timestamp: number): boolean {
  return typeof timestamp === 'number' && 
         timestamp > 0 && 
         timestamp <= Date.now() + 365 * 24 * 60 * 60 * 1000; // 最多未来一年
}

/**
 * 验证属性值是否符合属性类型
 */
export function validateAttributeValue(
  value: string | number | null, 
  attribute: Attribute
): boolean {
  if (value === null) {
    return true; // null值始终有效
  }

  switch (attribute.type) {
    case AttributeType.TEXT:
      return typeof value === 'string';
    
    case AttributeType.NUMBER:
      return typeof value === 'number' && !isNaN(value);
    
    case AttributeType.ENUM:
      return typeof value === 'string' && 
             attribute.enumValues?.includes(value) === true;
    
    default:
      return false;
  }
}

/**
 * 验证属性接口
 */
export function validateAttribute(attribute: Attribute): void {
  if (!validateId(attribute.id)) {
    throw new ValidationError('属性ID格式无效', 'id');
  }

  if (!attribute.name || attribute.name.trim().length === 0) {
    throw new ValidationError('属性名称不能为空', 'name');
  }

  if (!Object.values(AttributeType).includes(attribute.type)) {
    throw new ValidationError('无效的属性类型', 'type');
  }

  if (attribute.type === AttributeType.ENUM) {
    if (!attribute.enumValues || attribute.enumValues.length === 0) {
      throw new ValidationError('枚举类型必须提供可选值列表', 'enumValues');
    }
  }

  if (!validateAttributeValue(attribute.value, attribute)) {
    throw new ValidationError('属性值与属性类型不匹配', 'value');
  }

  try {
    new Date(attribute.createdAt);
    new Date(attribute.updatedAt);
  } catch {
    throw new ValidationError('无效的时间格式', 'createdAt/updatedAt');
  }
}

/**
 * 验证世界对象接口
 */
export function validateWorldObject(obj: WorldObject): void {
  if (!validateId(obj.id)) {
    throw new ValidationError('对象ID格式无效', 'id');
  }

  if (!obj.name || obj.name.trim().length === 0) {
    throw new ValidationError('对象名称不能为空', 'name');
  }

  if (!Array.isArray(obj.attributes)) {
    throw new ValidationError('属性列表必须是数组', 'attributes');
  }

  // 验证每个属性
  obj.attributes.forEach((attr, index) => {
    try {
      validateAttribute(attr);
    } catch (error) {
      throw new ValidationError(
        `属性[${index}]验证失败: ${error.message}`, 
        `attributes[${index}]`
      );
    }
  });

  // 检查属性ID唯一性
  const attributeIds = obj.attributes.map(attr => attr.id);
  const uniqueIds = new Set(attributeIds);
  if (attributeIds.length !== uniqueIds.size) {
    throw new ValidationError('对象中存在重复的属性ID', 'attributes');
  }

  try {
    new Date(obj.createdAt);
    new Date(obj.updatedAt);
  } catch {
    throw new ValidationError('无效的时间格式', 'createdAt/updatedAt');
  }
}

/**
 * 验证事件接口
 */
export function validateEvent(event: Event, objects: WorldObject[]): void {
  if (!validateId(event.id)) {
    throw new ValidationError('事件ID格式无效', 'id');
  }

  if (!validateTimestamp(event.timestamp)) {
    throw new ValidationError('无效的时间戳', 'timestamp');
  }

  // 验证对象是否存在
  const targetObject = objects.find(obj => obj.id === event.objectId);
  if (!targetObject) {
    throw new ValidationError('引用的对象不存在', 'objectId');
  }

  // 验证属性是否存在
  const targetAttribute = targetObject.attributes.find(
    attr => attr.id === event.attributeId
  );
  if (!targetAttribute) {
    throw new ValidationError('引用的属性不存在', 'attributeId');
  }

  // 验证新值是否符合属性类型
  if (!validateAttributeValue(event.newValue, targetAttribute)) {
    throw new ValidationError('事件的新值与属性类型不匹配', 'newValue');
  }

  try {
    new Date(event.createdAt);
  } catch {
    throw new ValidationError('无效的时间格式', 'createdAt');
  }
}

/**
 * 验证时间轴接口
 */
export function validateTimeline(timeline: Timeline, objects: WorldObject[]): void {
  if (!validateId(timeline.id)) {
    throw new ValidationError('时间轴ID格式无效', 'id');
  }

  if (!timeline.name || timeline.name.trim().length === 0) {
    throw new ValidationError('时间轴名称不能为空', 'name');
  }

  if (!validateTimestamp(timeline.currentTime)) {
    throw new ValidationError('无效的当前时间', 'currentTime');
  }

  if (!validateTimestamp(timeline.startTime)) {
    throw new ValidationError('无效的开始时间', 'startTime');
  }

  if (!validateTimestamp(timeline.endTime)) {
    throw new ValidationError('无效的结束时间', 'endTime');
  }

  if (timeline.startTime >= timeline.endTime) {
    throw new ValidationError('开始时间必须早于结束时间', 'startTime/endTime');
  }

  if (timeline.currentTime < timeline.startTime || 
      timeline.currentTime > timeline.endTime) {
    throw new ValidationError('当前时间必须在时间轴范围内', 'currentTime');
  }

  if (!Array.isArray(timeline.events)) {
    throw new ValidationError('事件列表必须是数组', 'events');
  }

  // 验证每个事件
  timeline.events.forEach((event, index) => {
    try {
      validateEvent(event, objects);
    } catch (error) {
      throw new ValidationError(
        `事件[${index}]验证失败: ${error.message}`, 
        `events[${index}]`
      );
    }
  });

  // 检查事件ID唯一性
  const eventIds = timeline.events.map(event => event.id);
  const uniqueIds = new Set(eventIds);
  if (eventIds.length !== uniqueIds.size) {
    throw new ValidationError('时间轴中存在重复的事件ID', 'events');
  }

  // 验证事件是否按时间戳排序
  for (let i = 1; i < timeline.events.length; i++) {
    if (timeline.events[i].timestamp < timeline.events[i - 1].timestamp) {
      throw new ValidationError('事件列表必须按时间戳升序排列', 'events');
    }
  }

  try {
    new Date(timeline.createdAt);
    new Date(timeline.updatedAt);
  } catch {
    throw new ValidationError('无效的时间格式', 'createdAt/updatedAt');
  }
}

/**
 * 验证项目数据接口
 */
export function validateProjectData(project: ProjectData): void {
  if (!validateId(project.id)) {
    throw new ValidationError('项目ID格式无效', 'id');
  }

  if (!project.name || project.name.trim().length === 0) {
    throw new ValidationError('项目名称不能为空', 'name');
  }

  if (!Array.isArray(project.objects)) {
    throw new ValidationError('对象列表必须是数组', 'objects');
  }

  // 验证每个对象
  project.objects.forEach((obj, index) => {
    try {
      validateWorldObject(obj);
    } catch (error) {
      throw new ValidationError(
        `对象[${index}]验证失败: ${error.message}`, 
        `objects[${index}]`
      );
    }
  });

  // 检查对象ID唯一性
  const objectIds = project.objects.map(obj => obj.id);
  const uniqueIds = new Set(objectIds);
  if (objectIds.length !== uniqueIds.size) {
    throw new ValidationError('项目中存在重复的对象ID', 'objects');
  }

  // 验证时间轴
  try {
    validateTimeline(project.timeline, project.objects);
  } catch (error) {
    throw new ValidationError(
      `时间轴验证失败: ${error.message}`, 
      'timeline'
    );
  }

  if (!project.version || !/^\d+\.\d+\.\d+$/.test(project.version)) {
    throw new ValidationError('无效的版本格式，应为 x.y.z', 'version');
  }

  try {
    new Date(project.createdAt);
    new Date(project.updatedAt);
  } catch {
    throw new ValidationError('无效的时间格式', 'createdAt/updatedAt');
  }
}

/**
 * 验证数据完整性
 * 检查项目中所有数据的逻辑一致性
 */
export function validateDataIntegrity(project: ProjectData): void {
  validateProjectData(project);

  // 验证所有事件引用的对象和属性都存在
  for (const event of project.timeline.events) {
    const targetObject = project.objects.find(obj => obj.id === event.objectId);
    if (!targetObject) {
      throw new ValidationError(
        `事件 ${event.id} 引用了不存在的对象 ${event.objectId}`, 
        'timeline.events'
      );
    }

    const targetAttribute = targetObject.attributes.find(
      attr => attr.id === event.attributeId
    );
    if (!targetAttribute) {
      throw new ValidationError(
        `事件 ${event.id} 引用了不存在的属性 ${event.attributeId}`, 
        'timeline.events'
      );
    }
  }
}