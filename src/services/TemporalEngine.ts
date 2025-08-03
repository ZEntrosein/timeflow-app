import { Event, WorldObject, ObjectState, Attribute } from '../types';

/**
 * 时间数据计算引擎
 * 用于计算对象在任意时间点的状态
 */
export class TemporalEngine {
  private eventCache: Map<string, Event[]> = new Map();
  private stateCache: Map<string, ObjectState> = new Map();
  private readonly cacheSize: number = 1000;

  constructor() {
    this.eventCache = new Map();
    this.stateCache = new Map();
  }

  /**
   * 计算对象在指定时间点的状态
   * @param objectId 对象ID
   * @param timestamp 目标时间戳
   * @param events 所有相关事件
   * @param objectData 对象基础数据
   * @returns 对象在指定时间点的状态
   */
  calculateStateAtTime(
    objectId: string,
    timestamp: number,
    events: Event[],
    objectData: WorldObject
  ): ObjectState {
    // 生成缓存键
    const cacheKey = `${objectId}-${timestamp}`;
    
    // 检查缓存
    if (this.stateCache.has(cacheKey)) {
      return this.stateCache.get(cacheKey)!;
    }

    // 获取对象相关的事件
    const objectEvents = this.getObjectEvents(objectId, events);
    
    // 获取时间点之前的所有事件
    const relevantEvents = this.getEventsBeforeTime(objectEvents, timestamp);
    
    // 计算状态
    const state = this.computeObjectState(objectId, timestamp, relevantEvents, objectData);
    
    // 缓存结果
    this.cacheState(cacheKey, state);
    
    return state;
  }

  /**
   * 批量计算多个对象在指定时间点的状态
   * @param objectIds 对象ID列表
   * @param timestamp 目标时间戳
   * @param events 所有事件
   * @param objects 所有对象数据
   * @returns 所有对象的状态映射
   */
  calculateMultipleStatesAtTime(
    objectIds: string[],
    timestamp: number,
    events: Event[],
    objects: WorldObject[]
  ): Map<string, ObjectState> {
    const results = new Map<string, ObjectState>();
    
    for (const objectId of objectIds) {
      const objectData = objects.find(obj => obj.id === objectId);
      if (objectData) {
        const state = this.calculateStateAtTime(objectId, timestamp, events, objectData);
        results.set(objectId, state);
      }
    }
    
    return results;
  }

  /**
   * 计算对象在时间范围内的状态历史
   * @param objectId 对象ID
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param events 所有事件
   * @param objectData 对象基础数据
   * @param sampleInterval 采样间隔（毫秒）
   * @returns 时间范围内的状态历史
   */
  calculateStateHistory(
    objectId: string,
    startTime: number,
    endTime: number,
    events: Event[],
    objectData: WorldObject,
    sampleInterval: number = 3600000 // 默认1小时
  ): ObjectState[] {
    const history: ObjectState[] = [];
    const objectEvents = this.getObjectEvents(objectId, events);
    
    // 获取所有事件时间点
    const eventTimes = objectEvents
      .filter(event => event.timestamp >= startTime && event.timestamp <= endTime)
      .map(event => event.timestamp)
      .sort((a, b) => a - b);
    
    // 合并采样点和事件时间点
    const sampleTimes = new Set<number>();
    
    // 添加采样点
    for (let time = startTime; time <= endTime; time += sampleInterval) {
      sampleTimes.add(time);
    }
    
    // 添加事件时间点
    eventTimes.forEach(time => sampleTimes.add(time));
    
    // 添加结束时间
    sampleTimes.add(endTime);
    
    // 计算每个时间点的状态
    const sortedTimes = Array.from(sampleTimes).sort((a, b) => a - b);
    
    for (const time of sortedTimes) {
      const state = this.calculateStateAtTime(objectId, time, events, objectData);
      history.push(state);
    }
    
    return history;
  }

  /**
   * 获取对象相关的事件
   * @param objectId 对象ID
   * @param events 所有事件
   * @returns 对象相关的事件列表
   */
  private getObjectEvents(objectId: string, events: Event[]): Event[] {
    const cacheKey = `events-${objectId}`;
    
    if (this.eventCache.has(cacheKey)) {
      return this.eventCache.get(cacheKey)!;
    }
    
    const objectEvents = events
      .filter(event => event.objectId === objectId)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // 缓存事件
    this.eventCache.set(cacheKey, objectEvents);
    
    return objectEvents;
  }

  /**
   * 获取指定时间之前的所有事件
   * @param events 事件列表（已排序）
   * @param timestamp 目标时间戳
   * @returns 时间点之前的事件
   */
  private getEventsBeforeTime(events: Event[], timestamp: number): Event[] {
    // 使用二分查找优化性能
    let left = 0;
    let right = events.length - 1;
    let lastValidIndex = -1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      
      if (events[mid].timestamp <= timestamp) {
        lastValidIndex = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return lastValidIndex >= 0 ? events.slice(0, lastValidIndex + 1) : [];
  }

  /**
   * 计算对象状态
   * @param objectId 对象ID
   * @param timestamp 时间戳
   * @param events 相关事件
   * @param objectData 对象基础数据
   * @returns 计算后的对象状态
   */
  private computeObjectState(
    objectId: string,
    timestamp: number,
    events: Event[],
    objectData: WorldObject
  ): ObjectState {
    // 初始化属性值
    const attributeValues: Record<string, string | number | null> = {};
    
    // 设置初始值
    objectData.attributes.forEach(attr => {
      attributeValues[attr.id] = attr.value;
    });
    
    // 应用事件更新
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
   * 缓存状态结果
   * @param key 缓存键
   * @param state 状态对象
   */
  private cacheState(key: string, state: ObjectState): void {
    // 如果缓存已满，清理最老的条目
    if (this.stateCache.size >= this.cacheSize) {
      const firstKey = this.stateCache.keys().next().value;
      this.stateCache.delete(firstKey);
    }
    
    this.stateCache.set(key, state);
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.eventCache.clear();
    this.stateCache.clear();
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  getCacheStats(): {
    eventCacheSize: number;
    stateCacheSize: number;
    maxCacheSize: number;
  } {
    return {
      eventCacheSize: this.eventCache.size,
      stateCacheSize: this.stateCache.size,
      maxCacheSize: this.cacheSize
    };
  }

  /**
   * 找到影响指定属性的最近事件
   * @param objectId 对象ID
   * @param attributeId 属性ID
   * @param timestamp 目标时间戳
   * @param events 所有事件
   * @returns 最近的影响事件，如果没有则返回null
   */
  findLastEventForAttribute(
    objectId: string,
    attributeId: string,
    timestamp: number,
    events: Event[]
  ): Event | null {
    const objectEvents = this.getObjectEvents(objectId, events);
    const attributeEvents = objectEvents.filter(event => 
      event.attributeId === attributeId && event.timestamp <= timestamp
    );
    
    if (attributeEvents.length === 0) {
      return null;
    }
    
    // 返回最后一个事件
    return attributeEvents[attributeEvents.length - 1];
  }

  /**
   * 检查对象在指定时间点是否存在
   * @param objectId 对象ID
   * @param timestamp 时间戳
   * @param events 所有事件
   * @param objectData 对象基础数据
   * @returns 对象是否存在
   */
  objectExistsAtTime(
    objectId: string,
    timestamp: number,
    events: Event[],
    objectData: WorldObject
  ): boolean {
    // 如果时间早于对象创建时间，对象不存在
    const createdAt = new Date(objectData.createdAt).getTime();
    if (timestamp < createdAt) {
      return false;
    }
    
    // 检查是否有"删除"或"死亡"等终止事件
    const objectEvents = this.getObjectEvents(objectId, events);
    const terminationEvents = objectEvents.filter(event => 
      event.timestamp <= timestamp && 
      (event.newValue === 'deleted' || event.newValue === 'dead')
    );
    
    return terminationEvents.length === 0;
  }

  /**
   * 获取属性在时间范围内的变化次数
   * @param objectId 对象ID
   * @param attributeId 属性ID
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param events 所有事件
   * @returns 变化次数
   */
  getAttributeChangeCount(
    objectId: string,
    attributeId: string,
    startTime: number,
    endTime: number,
    events: Event[]
  ): number {
    const objectEvents = this.getObjectEvents(objectId, events);
    return objectEvents.filter(event => 
      event.attributeId === attributeId &&
      event.timestamp >= startTime &&
      event.timestamp <= endTime
    ).length;
  }

  /**
   * 预热缓存 - 为常用的时间点预计算状态
   * @param objectIds 对象ID列表
   * @param timestamps 时间戳列表
   * @param events 所有事件
   * @param objects 所有对象
   */
  warmUpCache(
    objectIds: string[],
    timestamps: number[],
    events: Event[],
    objects: WorldObject[]
  ): void {
    for (const objectId of objectIds) {
      const objectData = objects.find(obj => obj.id === objectId);
      if (objectData) {
        for (const timestamp of timestamps) {
          this.calculateStateAtTime(objectId, timestamp, events, objectData);
        }
      }
    }
  }
}