import { 
  WorldObject, 
  TimelineEvent, 
  AttributeFilter, 
  AttributeSearchConfig, 
  AttributeValue,
  Attribute,
  AttributeStats
} from '../types';

/**
 * 属性搜索和过滤工具函数
 * 提供强大的属性搜索、过滤和统计功能
 */

/**
 * 执行属性搜索
 */
export function searchByAttributes(
  data: (WorldObject | TimelineEvent)[],
  config: AttributeSearchConfig
): (WorldObject | TimelineEvent)[] {
  let results = data;

  // 应用文本搜索
  if (config.query && config.query.trim()) {
    results = applyTextSearch(results, config.query, config.searchAttributes);
  }

  // 应用过滤器
  if (config.filters.length > 0) {
    results = applyFilters(results, config.filters);
  }

  // 应用排序
  if (config.sort.length > 0) {
    results = applySorting(results, config.sort);
  }

  // 应用分页
  if (config.limit || config.offset) {
    const offset = config.offset || 0;
    const limit = config.limit || results.length;
    results = results.slice(offset, offset + limit);
  }

  return results;
}

/**
 * 应用文本搜索
 */
function applyTextSearch(
  data: (WorldObject | TimelineEvent)[],
  query: string,
  searchAttributes: string[]
): (WorldObject | TimelineEvent)[] {
  const searchTerm = query.toLowerCase().trim();
  
  return data.filter(item => {
    // 搜索基本字段
    const name = 'name' in item ? item.name : 'title' in item ? item.title : '';
    const description = item.description || '';
    
    if (name.toLowerCase().includes(searchTerm) || 
        description.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // 搜索标签
    if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
      return true;
    }

    // 搜索指定属性
    if ('attributes' in item && item.attributes) {
      return item.attributes.some(attr => {
        if (searchAttributes.length > 0 && !searchAttributes.includes(attr.id)) {
          return false;
        }
        
        if (!attr.searchable) {
          return false;
        }

        return searchInAttributeValue(attr.value, searchTerm);
      });
    }

    return false;
  });
}

/**
 * 在属性值中搜索
 */
function searchInAttributeValue(value: AttributeValue, searchTerm: string): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.toLowerCase().includes(searchTerm);
  }

  if (typeof value === 'number') {
    return value.toString().includes(searchTerm);
  }

  if (Array.isArray(value)) {
    return value.some(v => 
      typeof v === 'string' && v.toLowerCase().includes(searchTerm)
    );
  }

  if (value instanceof Date) {
    return value.toLocaleDateString().toLowerCase().includes(searchTerm);
  }

  return String(value).toLowerCase().includes(searchTerm);
}

/**
 * 应用过滤器
 */
function applyFilters(
  data: (WorldObject | TimelineEvent)[],
  filters: AttributeFilter[]
): (WorldObject | TimelineEvent)[] {
  const activeFilters = filters.filter(f => f.enabled);
  
  if (activeFilters.length === 0) {
    return data;
  }

  return data.filter(item => {
    return activeFilters.every(filter => {
      const value = getAttributeValue(item, filter.attribute);
      return applyFilter(value, filter);
    });
  });
}

/**
 * 获取属性值
 */
function getAttributeValue(item: WorldObject | TimelineEvent, attributeId: string): AttributeValue {
  if ('attributes' in item && item.attributes) {
    const attr = item.attributes.find(a => a.id === attributeId);
    return attr?.value || null;
  }
  return null;
}

/**
 * 应用单个过滤器
 */
function applyFilter(value: AttributeValue, filter: AttributeFilter): boolean {
  const { operator, value: filterValue } = filter;

  switch (operator) {
    case 'equals':
      return value === filterValue;
      
    case 'not_equals':
      return value !== filterValue;
      
    case 'contains':
      return typeof value === 'string' && typeof filterValue === 'string'
        ? value.toLowerCase().includes(filterValue.toLowerCase())
        : false;
        
    case 'not_contains':
      return typeof value === 'string' && typeof filterValue === 'string'
        ? !value.toLowerCase().includes(filterValue.toLowerCase())
        : true;
        
    case 'starts_with':
      return typeof value === 'string' && typeof filterValue === 'string'
        ? value.toLowerCase().startsWith(filterValue.toLowerCase())
        : false;
        
    case 'ends_with':
      return typeof value === 'string' && typeof filterValue === 'string'
        ? value.toLowerCase().endsWith(filterValue.toLowerCase())
        : false;
        
    case 'greater_than':
      if (typeof value === 'number' && typeof filterValue === 'number') {
        return value > filterValue;
      }
      if (value instanceof Date && filterValue instanceof Date) {
        return value.getTime() > filterValue.getTime();
      }
      return false;
      
    case 'less_than':
      if (typeof value === 'number' && typeof filterValue === 'number') {
        return value < filterValue;
      }
      if (value instanceof Date && filterValue instanceof Date) {
        return value.getTime() < filterValue.getTime();
      }
      return false;
      
    case 'greater_equal':
      if (typeof value === 'number' && typeof filterValue === 'number') {
        return value >= filterValue;
      }
      if (value instanceof Date && filterValue instanceof Date) {
        return value.getTime() >= filterValue.getTime();
      }
      return false;
      
    case 'less_equal':
      if (typeof value === 'number' && typeof filterValue === 'number') {
        return value <= filterValue;
      }
      if (value instanceof Date && filterValue instanceof Date) {
        return value.getTime() <= filterValue.getTime();
      }
      return false;
      
    case 'between':
      if (Array.isArray(filterValue) && filterValue.length === 2) {
        const [min, max] = filterValue;
        if (typeof value === 'number' && typeof min === 'number' && typeof max === 'number') {
          return value >= min && value <= max;
        }
        if (value instanceof Date && min instanceof Date && max instanceof Date) {
          const time = value.getTime();
          return time >= min.getTime() && time <= max.getTime();
        }
      }
      return false;
      
         case 'in':
       if (Array.isArray(filterValue)) {
         return filterValue.some(fv => fv === value);
       }
       return false;
       
     case 'not_in':
       if (Array.isArray(filterValue)) {
         return !filterValue.some(fv => fv === value);
       }
       return true;
      
    case 'is_empty':
      return value === null || value === undefined || value === '' || 
             (Array.isArray(value) && value.length === 0);
             
    case 'is_not_empty':
      return value !== null && value !== undefined && value !== '' && 
             (!Array.isArray(value) || value.length > 0);
             
    case 'is_true':
      return value === true;
      
    case 'is_false':
      return value === false;
      
    default:
      return true;
  }
}

/**
 * 应用排序
 */
function applySorting(
  data: (WorldObject | TimelineEvent)[],
  sortConfig: { attribute: string; order: 'asc' | 'desc' }[]
): (WorldObject | TimelineEvent)[] {
  return [...data].sort((a, b) => {
    for (const sort of sortConfig) {
      const aValue = getAttributeValue(a, sort.attribute);
      const bValue = getAttributeValue(b, sort.attribute);
      
      const comparison = compareValues(aValue, bValue);
      
      if (comparison !== 0) {
        return sort.order === 'desc' ? -comparison : comparison;
      }
    }
    return 0;
  });
}

/**
 * 比较两个值
 */
function compareValues(a: AttributeValue, b: AttributeValue): number {
  // 处理 null/undefined
  if (a === null || a === undefined) {
    return b === null || b === undefined ? 0 : -1;
  }
  if (b === null || b === undefined) {
    return 1;
  }

  // 数字比较
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // 日期比较
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  // 布尔值比较
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1;
  }

  // 字符串比较
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }

  // 数组比较（按长度）
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length - b.length;
  }

  // 其他情况转为字符串比较
  return String(a).localeCompare(String(b));
}

/**
 * 计算属性统计信息
 */
export function calculateAttributeStats(
  data: (WorldObject | TimelineEvent)[],
  attributeId: string
): AttributeStats {
  const values: AttributeValue[] = data
    .map(item => getAttributeValue(item, attributeId))
    .filter(value => value !== null && value !== undefined);

  const nonEmptyValues = values.filter(value => 
    value !== '' && (!Array.isArray(value) || value.length > 0)
  );

  const stats: AttributeStats = {
    attributeId,
    total: data.length,
    nonEmpty: nonEmptyValues.length,
    unique: 0,
    distribution: {}
  };

  // 计算唯一值和分布
  const uniqueValues = new Set();
  const distribution: Record<string, number> = {};

  nonEmptyValues.forEach(value => {
    const strValue = String(value);
    uniqueValues.add(strValue);
    distribution[strValue] = (distribution[strValue] || 0) + 1;
  });

  stats.unique = uniqueValues.size;
  stats.distribution = distribution;

  // 计算数字统计
  const numericValues = nonEmptyValues
    .filter(value => typeof value === 'number')
    .map(value => value as number);

  if (numericValues.length > 0) {
    stats.min = Math.min(...numericValues);
    stats.max = Math.max(...numericValues);
    stats.average = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
  }

  // 计算日期统计
  const dateValues = nonEmptyValues
    .filter(value => value instanceof Date)
    .map(value => value as Date);

  if (dateValues.length > 0) {
    const timestamps = dateValues.map(date => date.getTime());
    stats.min = new Date(Math.min(...timestamps));
    stats.max = new Date(Math.max(...timestamps));
  }

  return stats;
}

/**
 * 创建过滤器构建器
 */
export class FilterBuilder {
  private filters: AttributeFilter[] = [];

  equals(attribute: string, value: AttributeValue): FilterBuilder {
    this.filters.push({
      id: `filter_${Date.now()}_${Math.random()}`,
      attribute,
      operator: 'equals',
      value,
      enabled: true
    });
    return this;
  }

  contains(attribute: string, value: string): FilterBuilder {
    this.filters.push({
      id: `filter_${Date.now()}_${Math.random()}`,
      attribute,
      operator: 'contains',
      value,
      enabled: true
    });
    return this;
  }

  greaterThan(attribute: string, value: number | Date): FilterBuilder {
    this.filters.push({
      id: `filter_${Date.now()}_${Math.random()}`,
      attribute,
      operator: 'greater_than',
      value,
      enabled: true
    });
    return this;
  }

  lessThan(attribute: string, value: number | Date): FilterBuilder {
    this.filters.push({
      id: `filter_${Date.now()}_${Math.random()}`,
      attribute,
      operator: 'less_than',
      value,
      enabled: true
    });
    return this;
  }

  between(attribute: string, min: number | Date, max: number | Date): FilterBuilder {
    this.filters.push({
      id: `filter_${Date.now()}_${Math.random()}`,
      attribute,
      operator: 'between',
      value: [min, max],
      enabled: true
    });
    return this;
  }

  isEmpty(attribute: string): FilterBuilder {
    this.filters.push({
      id: `filter_${Date.now()}_${Math.random()}`,
      attribute,
      operator: 'is_empty',
      value: null,
      enabled: true
    });
    return this;
  }

  isNotEmpty(attribute: string): FilterBuilder {
    this.filters.push({
      id: `filter_${Date.now()}_${Math.random()}`,
      attribute,
      operator: 'is_not_empty',
      value: null,
      enabled: true
    });
    return this;
  }

  build(): AttributeFilter[] {
    return this.filters;
  }
}

/**
 * 创建搜索配置构建器
 */
export class SearchConfigBuilder {
  private config: AttributeSearchConfig = {
    query: '',
    searchAttributes: [],
    filters: [],
    sort: []
  };

  query(text: string): SearchConfigBuilder {
    this.config.query = text;
    return this;
  }

  searchIn(attributes: string[]): SearchConfigBuilder {
    this.config.searchAttributes = attributes;
    return this;
  }

  filter(filters: AttributeFilter[]): SearchConfigBuilder {
    this.config.filters = filters;
    return this;
  }

  sortBy(attribute: string, order: 'asc' | 'desc' = 'asc'): SearchConfigBuilder {
    this.config.sort.push({ attribute, order });
    return this;
  }

  groupBy(attribute: string): SearchConfigBuilder {
    this.config.groupBy = attribute;
    return this;
  }

  limit(count: number): SearchConfigBuilder {
    this.config.limit = count;
    return this;
  }

  offset(count: number): SearchConfigBuilder {
    this.config.offset = count;
    return this;
  }

  build(): AttributeSearchConfig {
    return this.config;
  }
} 