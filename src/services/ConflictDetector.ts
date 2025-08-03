import { Event, WorldObject, AttributeType } from '../types';

/**
 * 冲突类型枚举
 */
export enum ConflictType {
  LOGICAL_INCONSISTENCY = 'logical_inconsistency',     // 逻辑不一致
  TEMPORAL_PARADOX = 'temporal_paradox',               // 时间悖论
  STATE_VIOLATION = 'state_violation',                 // 状态违反
  DEPENDENCY_VIOLATION = 'dependency_violation',       // 依赖违反
  BUSINESS_RULE_VIOLATION = 'business_rule_violation'  // 业务规则违反
}

/**
 * 冲突严重程度
 */
export enum ConflictSeverity {
  LOW = 'low',       // 轻微警告
  MEDIUM = 'medium', // 中等警告
  HIGH = 'high',     // 严重警告
  CRITICAL = 'critical' // 致命错误
}

/**
 * 冲突检测结果
 */
export interface ConflictResult {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  title: string;
  description: string;
  events: Event[];
  objectId: string;
  attributeId?: string;
  suggestions?: string[];
  timestamp: number;
}

/**
 * 冲突检测规则接口
 */
export interface ConflictRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: ConflictSeverity;
  check: (events: Event[], objects: WorldObject[]) => ConflictResult[];
}

/**
 * 冲突检测器类
 * 用于检测事件序列中的逻辑冲突和不一致性
 */
export class ConflictDetector {
  private rules: Map<string, ConflictRule> = new Map();
  private conflictHistory: ConflictResult[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * 初始化默认冲突检测规则
   */
  private initializeDefaultRules(): void {
    // 规则1: 死后复活检测
    this.addRule({
      id: 'death-resurrection',
      name: '死后复活检测',
      description: '检测角色在死亡后是否有其他活动',
      enabled: true,
      severity: ConflictSeverity.HIGH,
      check: this.checkDeathResurrection.bind(this)
    });

    // 规则2: 年龄递减检测
    this.addRule({
      id: 'age-decrease',
      name: '年龄递减检测',
      description: '检测年龄是否出现非正常递减',
      enabled: true,
      severity: ConflictSeverity.MEDIUM,
      check: this.checkAgeDecrease.bind(this)
    });

    // 规则3: 状态转换检测
    this.addRule({
      id: 'invalid-state-transition',
      name: '无效状态转换检测',
      description: '检测不合理的状态转换',
      enabled: true,
      severity: ConflictSeverity.MEDIUM,
      check: this.checkInvalidStateTransition.bind(this)
    });

    // 规则4: 时间顺序检测
    this.addRule({
      id: 'temporal-order',
      name: '时间顺序检测',
      description: '检测事件时间戳的逻辑顺序',
      enabled: true,
      severity: ConflictSeverity.LOW,
      check: this.checkTemporalOrder.bind(this)
    });

    // 规则5: 属性依赖检测
    this.addRule({
      id: 'attribute-dependency',
      name: '属性依赖检测',
      description: '检测属性间的依赖关系违反',
      enabled: true,
      severity: ConflictSeverity.MEDIUM,
      check: this.checkAttributeDependency.bind(this)
    });
  }

  /**
   * 添加冲突检测规则
   */
  addRule(rule: ConflictRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * 移除冲突检测规则
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * 启用/禁用规则
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  /**
   * 获取所有规则
   */
  getRules(): ConflictRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * 检测单个事件是否会引起冲突
   */
  checkSingleEvent(newEvent: Event, existingEvents: Event[], objects: WorldObject[]): ConflictResult[] {
    const allEvents = [...existingEvents, newEvent];
    return this.detectConflicts(allEvents, objects);
  }

  /**
   * 检测事件序列中的所有冲突
   */
  detectConflicts(events: Event[], objects: WorldObject[]): ConflictResult[] {
    const conflicts: ConflictResult[] = [];

    // 按时间排序事件
    const sortedEvents = events.sort((a, b) => a.timestamp - b.timestamp);

    // 应用所有启用的规则
    for (const rule of this.rules.values()) {
      if (rule.enabled) {
        try {
          const ruleConflicts = rule.check(sortedEvents, objects);
          conflicts.push(...ruleConflicts);
        } catch (error) {
          console.warn(`规则 ${rule.id} 执行失败:`, error);
        }
      }
    }

    // 去重和排序
    const uniqueConflicts = this.deduplicateConflicts(conflicts);
    return uniqueConflicts.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 规则1: 检测死后复活
   */
  private checkDeathResurrection(events: Event[], objects: WorldObject[]): ConflictResult[] {
    const conflicts: ConflictResult[] = [];
    const objectDeathMap = new Map<string, Event>();

    for (const event of events) {
      const objectId = event.objectId;

      // 记录死亡事件
      if (event.newValue === 'dead' || event.newValue === 'died') {
        objectDeathMap.set(objectId, event);
        continue;
      }

      // 检查是否在死亡后有其他活动
      const deathEvent = objectDeathMap.get(objectId);
      if (deathEvent && event.timestamp > deathEvent.timestamp) {
        conflicts.push({
          id: `death-resurrection-${event.id}`,
          type: ConflictType.LOGICAL_INCONSISTENCY,
          severity: ConflictSeverity.HIGH,
          title: '死后复活冲突',
          description: `对象 ${objectId} 在死亡后仍有活动`,
          events: [deathEvent, event],
          objectId,
          attributeId: event.attributeId,
          suggestions: [
            '检查死亡时间是否正确',
            '考虑添加复活事件',
            '修改后续事件的时间戳'
          ],
          timestamp: event.timestamp
        });
      }
    }

    return conflicts;
  }

  /**
   * 规则2: 检测年龄递减
   */
  private checkAgeDecrease(events: Event[], objects: WorldObject[]): ConflictResult[] {
    const conflicts: ConflictResult[] = [];
    const ageTracker = new Map<string, { value: number; event: Event }>();

    for (const event of events) {
      if (event.attributeId === 'age' && typeof event.newValue === 'number') {
        const objectId = event.objectId;
        const previousAge = ageTracker.get(objectId);

        if (previousAge && event.newValue < previousAge.value) {
          // 允许合理的年龄重置（如重生、时间倒流等特殊情况）
          const timeDiff = event.timestamp - previousAge.event.timestamp;
          const ageDiff = previousAge.value - event.newValue;

          // 如果年龄减少超过1年且时间间隔小于1年，则认为是冲突
          if (ageDiff > 1 && timeDiff < 365 * 24 * 60 * 60 * 1000) {
            conflicts.push({
              id: `age-decrease-${event.id}`,
              type: ConflictType.LOGICAL_INCONSISTENCY,
              severity: ConflictSeverity.MEDIUM,
              title: '年龄递减冲突',
              description: `对象 ${objectId} 的年龄从 ${previousAge.value} 减少到 ${event.newValue}`,
              events: [previousAge.event, event],
              objectId,
              attributeId: 'age',
              suggestions: [
                '检查年龄值是否输入正确',
                '考虑是否需要添加特殊事件说明',
                '验证时间戳的正确性'
              ],
              timestamp: event.timestamp
            });
          }
        }

        ageTracker.set(objectId, { value: event.newValue, event });
      }
    }

    return conflicts;
  }

  /**
   * 规则3: 检测无效状态转换
   */
  private checkInvalidStateTransition(events: Event[], objects: WorldObject[]): ConflictResult[] {
    const conflicts: ConflictResult[] = [];
    const invalidTransitions = new Map<string, string[]>([
      ['dead', ['healthy', 'injured']], // 死亡后不能直接变为健康或受伤
      ['deleted', ['active', 'inactive']], // 删除后不能变为活跃状态
    ]);

    const statusTracker = new Map<string, { value: string; event: Event }>();

    for (const event of events) {
      if (event.attributeId === 'status' && typeof event.newValue === 'string') {
        const objectId = event.objectId;
        const previousStatus = statusTracker.get(objectId);

        if (previousStatus) {
          const invalidTargets = invalidTransitions.get(previousStatus.value);
          if (invalidTargets && invalidTargets.includes(event.newValue)) {
            conflicts.push({
              id: `invalid-transition-${event.id}`,
              type: ConflictType.STATE_VIOLATION,
              severity: ConflictSeverity.MEDIUM,
              title: '无效状态转换',
              description: `对象 ${objectId} 从 ${previousStatus.value} 状态转换到 ${event.newValue} 状态不合理`,
              events: [previousStatus.event, event],
              objectId,
              attributeId: 'status',
              suggestions: [
                '添加中间状态过渡',
                '检查状态转换逻辑',
                '考虑添加特殊事件说明原因'
              ],
              timestamp: event.timestamp
            });
          }
        }

        statusTracker.set(objectId, { value: event.newValue, event });
      }
    }

    return conflicts;
  }

  /**
   * 规则4: 检测时间顺序
   */
  private checkTemporalOrder(events: Event[], objects: WorldObject[]): ConflictResult[] {
    const conflicts: ConflictResult[] = [];
    
    // 检查创建时间是否早于事件时间
    for (const event of events) {
      const obj = objects.find(o => o.id === event.objectId);
      if (obj) {
        const objectCreatedTime = new Date(obj.createdAt).getTime();
        if (event.timestamp < objectCreatedTime) {
          conflicts.push({
            id: `temporal-order-${event.id}`,
            type: ConflictType.TEMPORAL_PARADOX,
            severity: ConflictSeverity.LOW,
            title: '时间顺序异常',
            description: `事件发生在对象 ${event.objectId} 创建之前`,
            events: [event],
            objectId: event.objectId,
            suggestions: [
              '检查对象创建时间',
              '修正事件时间戳',
              '确认时间线的逻辑正确性'
            ],
            timestamp: event.timestamp
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * 规则5: 检测属性依赖
   */
  private checkAttributeDependency(events: Event[], objects: WorldObject[]): ConflictResult[] {
    const conflicts: ConflictResult[] = [];
    
    // 定义属性依赖关系
    const dependencies = new Map<string, { requires: string; value: any; message: string }>([
      ['level', { requires: 'status', value: 'alive', message: '角色必须活着才能有等级' }],
      ['experience', { requires: 'status', value: 'alive', message: '死亡角色不能获得经验' }]
    ]);

    // 按对象分组事件
    const eventsByObject = new Map<string, Event[]>();
    for (const event of events) {
      if (!eventsByObject.has(event.objectId)) {
        eventsByObject.set(event.objectId, []);
      }
      eventsByObject.get(event.objectId)!.push(event);
    }

    // 检查每个对象的属性依赖
    for (const [objectId, objectEvents] of eventsByObject) {
      const latestValues = new Map<string, any>();
      
      for (const event of objectEvents.sort((a, b) => a.timestamp - b.timestamp)) {
        latestValues.set(event.attributeId, event.newValue);
        
        const dependency = dependencies.get(event.attributeId);
        if (dependency) {
          const requiredValue = latestValues.get(dependency.requires);
          if (requiredValue !== undefined && requiredValue !== dependency.value) {
            conflicts.push({
              id: `dependency-${event.id}`,
              type: ConflictType.DEPENDENCY_VIOLATION,
              severity: ConflictSeverity.MEDIUM,
              title: '属性依赖冲突',
              description: dependency.message,
              events: [event],
              objectId,
              attributeId: event.attributeId,
              suggestions: [
                '检查前置条件',
                '调整事件顺序',
                '修改属性值'
              ],
              timestamp: event.timestamp
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * 去重冲突结果
   */
  private deduplicateConflicts(conflicts: ConflictResult[]): ConflictResult[] {
    const seen = new Set<string>();
    return conflicts.filter(conflict => {
      const key = `${conflict.type}-${conflict.objectId}-${conflict.attributeId}-${conflict.timestamp}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * 获取冲突历史
   */
  getConflictHistory(): ConflictResult[] {
    return [...this.conflictHistory];
  }

  /**
   * 清除冲突历史
   */
  clearConflictHistory(): void {
    this.conflictHistory = [];
  }

  /**
   * 获取冲突统计信息
   */
  getConflictStatistics(conflicts: ConflictResult[]): {
    total: number;
    bySeverity: Record<ConflictSeverity, number>;
    byType: Record<ConflictType, number>;
  } {
    const stats = {
      total: conflicts.length,
      bySeverity: {
        [ConflictSeverity.LOW]: 0,
        [ConflictSeverity.MEDIUM]: 0,
        [ConflictSeverity.HIGH]: 0,
        [ConflictSeverity.CRITICAL]: 0
      },
      byType: {
        [ConflictType.LOGICAL_INCONSISTENCY]: 0,
        [ConflictType.TEMPORAL_PARADOX]: 0,
        [ConflictType.STATE_VIOLATION]: 0,
        [ConflictType.DEPENDENCY_VIOLATION]: 0,
        [ConflictType.BUSINESS_RULE_VIOLATION]: 0
      }
    };

    for (const conflict of conflicts) {
      stats.bySeverity[conflict.severity]++;
      stats.byType[conflict.type]++;
    }

    return stats;
  }
}