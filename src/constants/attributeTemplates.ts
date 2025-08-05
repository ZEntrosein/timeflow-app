import { AttributeTemplate, AttributeType } from '../types';

/**
 * 预定义的属性模板
 * 提供常用的属性组合，方便快速创建对象
 */

// 人物模板
export const PersonTemplate: AttributeTemplate = {
  id: 'person',
  name: '人物',
  description: '用于创建人物角色的属性模板',
  icon: '👤',
  attributes: [
    {
      name: '出生日期',
      type: AttributeType.DATE,
      options: {
        dateFormat: 'date'
      },
      validation: {
        required: false
      },
      description: '人物的出生日期',
      showInTable: true,
      searchable: false,
      sortOrder: 1,
      group: '基本信息'
    },
    {
      name: '职业',
      type: AttributeType.MULTI_SELECT,
      options: {
        choices: ['艺术家', '科学家', '作家', '政治家', '商人', '军人', '教师', '医生', '工程师', '其他'],
        allowCustom: true
      },
      validation: {
        required: false
      },
      description: '人物的职业或身份',
      showInTable: true,
      searchable: true,
      sortOrder: 2,
      group: '身份信息'
    },
    {
      name: '国籍',
      type: AttributeType.TEXT,
      validation: {
        required: false,
        maxLength: 50
      },
      description: '人物的国籍',
      showInTable: true,
      searchable: true,
      sortOrder: 3,
      group: '身份信息'
    },
    {
      name: '重要程度',
      type: AttributeType.RATING,
      options: {
        maxRating: 5
      },
      validation: {
        required: false,
        min: 1,
        max: 5
      },
      description: '人物在故事中的重要程度',
      showInTable: true,
      searchable: false,
      sortOrder: 4,
      group: '评估'
    },
    {
      name: '联系方式',
      type: AttributeType.EMAIL,
      validation: {
        required: false,
        pattern: '^[^@]+@[^@]+\\.[^@]+$'
      },
      description: '人物的联系邮箱',
      showInTable: false,
      searchable: true,
      sortOrder: 5,
      group: '联系信息'
    },
    {
      name: '个人网站',
      type: AttributeType.URL,
      validation: {
        required: false
      },
      description: '人物的个人网站或社交媒体',
      showInTable: false,
      searchable: false,
      sortOrder: 6,
      group: '联系信息'
    }
  ],
  appliesTo: ['person'],
  isSystem: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 地点模板
export const LocationTemplate: AttributeTemplate = {
  id: 'location',
  name: '地点',
  description: '用于创建地理位置的属性模板',
  icon: '📍',
  attributes: [
    {
      name: '地理坐标',
      type: AttributeType.LOCATION,
      validation: {
        required: false
      },
      description: '地点的地理坐标或地址',
      showInTable: true,
      searchable: true,
      sortOrder: 1,
      group: '位置信息'
    },
    {
      name: '类型',
      type: AttributeType.MULTI_SELECT,
      options: {
        choices: ['城市', '国家', '建筑', '自然景观', '历史遗迹', '商业场所', '居住区', '其他'],
        allowCustom: true
      },
      validation: {
        required: false
      },
      description: '地点的类型分类',
      showInTable: true,
      searchable: true,
      sortOrder: 2,
      group: '分类'
    },
    {
      name: '建立时间',
      type: AttributeType.DATE,
      options: {
        dateFormat: 'date'
      },
      validation: {
        required: false
      },
      description: '地点的建立或发现时间',
      showInTable: true,
      searchable: false,
      sortOrder: 3,
      group: '历史信息'
    },
    {
      name: '人口',
      type: AttributeType.NUMBER,
      options: {
        step: 1
      },
      validation: {
        required: false,
        min: 0
      },
      description: '地点的人口数量',
      showInTable: true,
      searchable: false,
      sortOrder: 4,
      group: '统计信息'
    },
    {
      name: '面积',
      type: AttributeType.TEXT,
      validation: {
        required: false,
        maxLength: 100
      },
      description: '地点的面积（如：100平方公里）',
      showInTable: false,
      searchable: false,
      sortOrder: 5,
      group: '统计信息'
    },
    {
      name: '重要程度',
      type: AttributeType.RATING,
      options: {
        maxRating: 5
      },
      validation: {
        required: false,
        min: 1,
        max: 5
      },
      description: '地点在故事中的重要程度',
      showInTable: true,
      searchable: false,
      sortOrder: 6,
      group: '评估'
    }
  ],
  appliesTo: ['place'],
  isSystem: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 项目模板
export const ProjectTemplate: AttributeTemplate = {
  id: 'project',
  name: '项目',
  description: '用于创建项目或任务的属性模板',
  icon: '📁',
  attributes: [
    {
      name: '开始日期',
      type: AttributeType.DATE,
      options: {
        dateFormat: 'date'
      },
      validation: {
        required: true
      },
      description: '项目的开始日期',
      showInTable: true,
      searchable: false,
      sortOrder: 1,
      group: '时间信息'
    },
    {
      name: '结束日期',
      type: AttributeType.DATE,
      options: {
        dateFormat: 'date'
      },
      validation: {
        required: false
      },
      description: '项目的结束日期',
      showInTable: true,
      searchable: false,
      sortOrder: 2,
      group: '时间信息'
    },
    {
      name: '状态',
      type: AttributeType.MULTI_SELECT,
      options: {
        choices: ['计划中', '进行中', '暂停', '已完成', '已取消'],
        allowCustom: false
      },
      validation: {
        required: true
      },
      description: '项目的当前状态',
      showInTable: true,
      searchable: true,
      sortOrder: 3,
      group: '状态信息'
    },
    {
      name: '进度',
      type: AttributeType.PROGRESS,
      options: {
        progressUnit: '%'
      },
      validation: {
        required: false,
        min: 0,
        max: 100
      },
      description: '项目的完成进度',
      showInTable: true,
      searchable: false,
      sortOrder: 4,
      group: '状态信息'
    },
    {
      name: '预算',
      type: AttributeType.CURRENCY,
      options: {
        currency: '¥'
      },
      validation: {
        required: false,
        min: 0
      },
      description: '项目的预算金额',
      showInTable: true,
      searchable: false,
      sortOrder: 5,
      group: '财务信息'
    },
    {
      name: '负责人',
      type: AttributeType.RELATION,
      options: {
        relationTarget: 'person'
      },
      validation: {
        required: false
      },
      description: '项目的负责人',
      showInTable: true,
      searchable: true,
      sortOrder: 6,
      group: '人员信息'
    },
    {
      name: '优先级',
      type: AttributeType.RATING,
      options: {
        maxRating: 5
      },
      validation: {
        required: false,
        min: 1,
        max: 5
      },
      description: '项目的优先级',
      showInTable: true,
      searchable: false,
      sortOrder: 7,
      group: '评估'
    },
    {
      name: '标签',
      type: AttributeType.LIST,
      validation: {
        required: false,
        maxLength: 10
      },
      description: '项目的标签列表',
      showInTable: false,
      searchable: true,
      sortOrder: 8,
      group: '分类'
    }
  ],
  appliesTo: ['project'],
  isSystem: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 事件模板
export const EventTemplate: AttributeTemplate = {
  id: 'event',
  name: '事件',
  description: '用于创建历史事件的属性模板',
  icon: '⚡',
  attributes: [
    {
      name: '事件类型',
      type: AttributeType.MULTI_SELECT,
      options: {
        choices: ['政治', '军事', '经济', '文化', '科技', '自然灾害', '社会', '其他'],
        allowCustom: true
      },
      validation: {
        required: true
      },
      description: '事件的类型分类',
      showInTable: true,
      searchable: true,
      sortOrder: 1,
      group: '分类信息'
    },
    {
      name: '影响范围',
      type: AttributeType.MULTI_SELECT,
      options: {
        choices: ['本地', '区域', '国家', '国际', '全球'],
        allowCustom: false
      },
      validation: {
        required: false
      },
      description: '事件的影响范围',
      showInTable: true,
      searchable: true,
      sortOrder: 2,
      group: '影响评估'
    },
    {
      name: '重要程度',
      type: AttributeType.RATING,
      options: {
        maxRating: 5
      },
      validation: {
        required: false,
        min: 1,
        max: 5
      },
      description: '事件的历史重要程度',
      showInTable: true,
      searchable: false,
      sortOrder: 3,
      group: '影响评估'
    },
    {
      name: '持续时间',
      type: AttributeType.DURATION,
      validation: {
        required: false
      },
      description: '事件的持续时间',
      showInTable: true,
      searchable: false,
      sortOrder: 4,
      group: '时间信息'
    },
    {
      name: '相关人物',
      type: AttributeType.LIST,
      validation: {
        required: false
      },
      description: '与事件相关的重要人物',
      showInTable: false,
      searchable: true,
      sortOrder: 5,
      group: '关联信息'
    },
    {
      name: '相关地点',
      type: AttributeType.LIST,
      validation: {
        required: false
      },
      description: '事件发生的相关地点',
      showInTable: false,
      searchable: true,
      sortOrder: 6,
      group: '关联信息'
    },
    {
      name: '资料来源',
      type: AttributeType.URL,
      validation: {
        required: false
      },
      description: '事件信息的资料来源链接',
      showInTable: false,
      searchable: false,
      sortOrder: 7,
      group: '参考信息'
    }
  ],
  appliesTo: ['event'],
  isSystem: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 组织机构模板
export const OrganizationTemplate: AttributeTemplate = {
  id: 'organization',
  name: '组织机构',
  description: '用于创建组织、公司或机构的属性模板',
  icon: '🏢',
  attributes: [
    {
      name: '成立日期',
      type: AttributeType.DATE,
      options: {
        dateFormat: 'date'
      },
      validation: {
        required: false
      },
      description: '组织的成立日期',
      showInTable: true,
      searchable: false,
      sortOrder: 1,
      group: '基本信息'
    },
    {
      name: '组织类型',
      type: AttributeType.MULTI_SELECT,
      options: {
        choices: ['公司', '政府机构', '非营利组织', '教育机构', '宗教组织', '军事组织', '国际组织', '其他'],
        allowCustom: true
      },
      validation: {
        required: true
      },
      description: '组织的类型分类',
      showInTable: true,
      searchable: true,
      sortOrder: 2,
      group: '分类信息'
    },
    {
      name: '规模',
      type: AttributeType.MULTI_SELECT,
      options: {
        choices: ['小型（<50人）', '中型（50-500人）', '大型（500-5000人）', '超大型（>5000人）'],
        allowCustom: false
      },
      validation: {
        required: false
      },
      description: '组织的规模大小',
      showInTable: true,
      searchable: true,
      sortOrder: 3,
      group: '规模信息'
    },
    {
      name: '员工数量',
      type: AttributeType.NUMBER,
      options: {
        step: 1
      },
      validation: {
        required: false,
        min: 1
      },
      description: '组织的员工数量',
      showInTable: true,
      searchable: false,
      sortOrder: 4,
      group: '规模信息'
    },
    {
      name: '总部地址',
      type: AttributeType.LOCATION,
      validation: {
        required: false
      },
      description: '组织总部的地理位置',
      showInTable: true,
      searchable: true,
      sortOrder: 5,
      group: '位置信息'
    },
    {
      name: '官方网站',
      type: AttributeType.URL,
      validation: {
        required: false
      },
      description: '组织的官方网站',
      showInTable: false,
      searchable: false,
      sortOrder: 6,
      group: '联系信息'
    },
    {
      name: '联系邮箱',
      type: AttributeType.EMAIL,
      validation: {
        required: false,
        pattern: '^[^@]+@[^@]+\\.[^@]+$'
      },
      description: '组织的联系邮箱',
      showInTable: false,
      searchable: true,
      sortOrder: 7,
      group: '联系信息'
    }
  ],
  appliesTo: ['object'],
  isSystem: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

/**
 * 所有预定义模板的集合
 */
export const SYSTEM_TEMPLATES: AttributeTemplate[] = [
  PersonTemplate,
  LocationTemplate,
  ProjectTemplate,
  EventTemplate,
  OrganizationTemplate
];

/**
 * 根据对象类型获取适用的模板
 */
import { ObjectType } from '../types';

export function getTemplatesForObjectType(objectType: ObjectType): AttributeTemplate[] {
  return SYSTEM_TEMPLATES.filter(template => 
    template.appliesTo === 'all' || 
    (Array.isArray(template.appliesTo) && template.appliesTo.includes(objectType))
  );
}

/**
 * 根据模板ID获取模板
 */
export function getTemplateById(templateId: string): AttributeTemplate | undefined {
  return SYSTEM_TEMPLATES.find(template => template.id === templateId);
}

/**
 * 创建自定义模板
 */
export function createCustomTemplate(
  name: string,
  description: string,
  attributes: AttributeTemplate['attributes'],
  appliesTo: AttributeTemplate['appliesTo'],
  icon?: string
): AttributeTemplate {
  return {
    id: `custom_${Date.now()}`,
    name,
    description,
    icon: icon || '📝',
    attributes,
    appliesTo,
    isSystem: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
} 