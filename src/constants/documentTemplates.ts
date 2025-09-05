/**
 * 富文本文档模板定义
 * 扩展现有的属性模板系统，支持结构化文档创建
 */

import { DocumentTemplate, DocumentBlock, AttributeType } from '../types';

/**
 * 创建默认内容块的辅助函数
 */
const createContentBlock = (
  type: DocumentBlock['type'],
  content: string,
  properties?: Record<string, any>
): DocumentBlock => ({
  id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type,
  content,
  properties: properties || {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * 角色/人物文档模板
 */
export const CHARACTER_TEMPLATE: DocumentTemplate = {
  id: 'character-template',
  name: '角色档案',
  description: '创建详细的角色档案，包含基本信息、外貌描述、性格特征等',
  category: 'person',
  icon: '👤',
  attributes: [
    { name: '全名', type: 'text' as AttributeType, required: true },
    { name: '年龄', type: 'number' as AttributeType },
    { name: '出生日期', type: 'date' as AttributeType },
    { name: '性别', type: 'enum' as AttributeType, options: ['男', '女', '其他'] },
    { name: '职业', type: 'text' as AttributeType },
    { name: '阵营', type: 'enum' as AttributeType, options: ['正派', '反派', '中立', '复杂'] },
    { name: '重要性', type: 'rating' as AttributeType, options: { max: 5 } },
    { name: '首次登场', type: 'relation' as AttributeType, options: { relationObjectTypes: ['event'] } },
    { name: '关联角色', type: 'relation' as AttributeType, options: { relationObjectTypes: ['person'], multiple: true } },
    { name: '标签', type: 'multi-select' as AttributeType, options: ['主角', '配角', '反派', '导师', '爱情线'] },
  ],
  defaultContent: [
    createContentBlock('heading', '# 角色概览', { level: 1 }),
    createContentBlock('metadata', '---\n全名: \n年龄: \n性别: \n职业: \n阵营: \n---'),
    
    createContentBlock('heading', '## 外貌描述', { level: 2 }),
    createContentBlock('paragraph', '描述角色的外貌特征、着装风格等...'),
    
    createContentBlock('heading', '## 性格特征', { level: 2 }),
    createContentBlock('list', '- 主要性格特点\n- 行为习惯\n- 说话方式', { type: 'unordered' }),
    
    createContentBlock('heading', '## 背景故事', { level: 2 }),
    createContentBlock('paragraph', '角色的成长经历、重要事件、动机目标...'),
    
    createContentBlock('heading', '## 人际关系', { level: 2 }),
    createContentBlock('paragraph', '与其他角色的关系、情感纠葛...'),
    
    createContentBlock('heading', '## 角色弧光', { level: 2 }),
    createContentBlock('paragraph', '角色在故事中的成长变化轨迹...'),
  ],
  tags: ['角色', '人物', '档案'],
  isSystem: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 地点文档模板
 */
export const LOCATION_TEMPLATE: DocumentTemplate = {
  id: 'location-template',
  name: '地点设定',
  description: '创建详细的地点设定，包含地理、历史、文化等信息',
  category: 'place',
  icon: '🏛️',
  attributes: [
    { name: '地点名称', type: 'text' as AttributeType, required: true },
    { name: '地点类型', type: 'enum' as AttributeType, options: ['城市', '村庄', '建筑', '自然景观', '虚构地点'] },
    { name: '所属区域', type: 'relation' as AttributeType, options: { relationObjectTypes: ['place'] } },
    { name: '地理坐标', type: 'location' as AttributeType },
    { name: '建立时间', type: 'date' as AttributeType },
    { name: '人口规模', type: 'number' as AttributeType },
    { name: '重要程度', type: 'rating' as AttributeType, options: { max: 5 } },
    { name: '气候', type: 'text' as AttributeType },
    { name: '主要事件', type: 'relation' as AttributeType, options: { relationObjectTypes: ['event'], multiple: true } },
    { name: '特色标签', type: 'multi-select' as AttributeType, options: ['政治中心', '商业重镇', '军事要塞', '文化圣地', '神秘场所'] },
  ],
  defaultContent: [
    createContentBlock('heading', '# 地点概览', { level: 1 }),
    createContentBlock('metadata', '---\n地点名称: \n地点类型: \n所属区域: \n---'),
    
    createContentBlock('heading', '## 地理环境', { level: 2 }),
    createContentBlock('paragraph', '描述地理位置、地形地貌、气候条件...'),
    
    createContentBlock('heading', '## 历史沿革', { level: 2 }),
    createContentBlock('paragraph', '地点的建立历史、重要历史事件...'),
    
    createContentBlock('heading', '## 政治结构', { level: 2 }),
    createContentBlock('paragraph', '统治制度、权力结构、重要人物...'),
    
    createContentBlock('heading', '## 经济文化', { level: 2 }),
    createContentBlock('paragraph', '经济支柱、贸易往来、文化特色...'),
    
    createContentBlock('heading', '## 重要建筑', { level: 2 }),
    createContentBlock('list', '- 标志性建筑物\n- 政府机构\n- 宗教场所', { type: 'unordered' }),
    
    createContentBlock('heading', '## 相关事件', { level: 2 }),
    createContentBlock('paragraph', '在此地发生的重要剧情事件...'),
  ],
  tags: ['地点', '设定', '世界观'],
  isSystem: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 事件文档模板
 */
export const EVENT_TEMPLATE: DocumentTemplate = {
  id: 'event-template',
  name: '事件记录',
  description: '记录重要事件的详细信息和影响',
  category: 'event',
  icon: '📅',
  attributes: [
    { name: '事件名称', type: 'text' as AttributeType, required: true },
    { name: '事件类型', type: 'enum' as AttributeType, options: ['政治', '军事', '社会', '自然', '超自然', '个人'] },
    { name: '发生时间', type: 'date' as AttributeType, required: true },
    { name: '持续时长', type: 'duration' as AttributeType },
    { name: '发生地点', type: 'relation' as AttributeType, options: { relationObjectTypes: ['place'] } },
    { name: '关键人物', type: 'relation' as AttributeType, options: { relationObjectTypes: ['person'], multiple: true } },
    { name: '影响程度', type: 'rating' as AttributeType, options: { max: 5 } },
    { name: '事件状态', type: 'enum' as AttributeType, options: ['计划中', '进行中', '已完成', '被取消'] },
    { name: '前置事件', type: 'relation' as AttributeType, options: { relationObjectTypes: ['event'], multiple: true } },
    { name: '后续事件', type: 'relation' as AttributeType, options: { relationObjectTypes: ['event'], multiple: true } },
  ],
  defaultContent: [
    createContentBlock('heading', '# 事件概览', { level: 1 }),
    createContentBlock('metadata', '---\n事件名称: \n事件类型: \n发生时间: \n发生地点: \n---'),
    
    createContentBlock('heading', '## 事件背景', { level: 2 }),
    createContentBlock('paragraph', '事件发生的背景原因、社会环境...'),
    
    createContentBlock('heading', '## 事件经过', { level: 2 }),
    createContentBlock('paragraph', '详细的事件发展过程、关键节点...'),
    
    createContentBlock('heading', '## 参与人物', { level: 2 }),
    createContentBlock('list', '- 主要参与者及其角色\n- 重要决策者\n- 受影响的人群', { type: 'unordered' }),
    
    createContentBlock('heading', '## 事件影响', { level: 2 }),
    createContentBlock('paragraph', '对后续剧情、角色发展、世界观的影响...'),
    
    createContentBlock('heading', '## 相关文档', { level: 2 }),
    createContentBlock('paragraph', '链接到相关的角色、地点、物品等文档...'),
  ],
  tags: ['事件', '剧情', '记录'],
  isSystem: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 物品/道具文档模板
 */
export const ITEM_TEMPLATE: DocumentTemplate = {
  id: 'item-template',
  name: '物品设定',
  description: '创建物品、武器、魔法道具等的详细设定',
  category: 'object',
  icon: '⚔️',
  attributes: [
    { name: '物品名称', type: 'text' as AttributeType, required: true },
    { name: '物品类型', type: 'enum' as AttributeType, options: ['武器', '防具', '工具', '饰品', '消耗品', '特殊道具'] },
    { name: '稀有度', type: 'enum' as AttributeType, options: ['普通', '稀有', '史诗', '传说', '神器'] },
    { name: '制作材料', type: 'text' as AttributeType },
    { name: '制作者', type: 'relation' as AttributeType, options: { relationObjectTypes: ['person'] } },
    { name: '当前持有者', type: 'relation' as AttributeType, options: { relationObjectTypes: ['person'] } },
    { name: '价值评估', type: 'currency' as AttributeType },
    { name: '重量', type: 'number' as AttributeType },
    { name: '获得方式', type: 'text' as AttributeType },
    { name: '相关事件', type: 'relation' as AttributeType, options: { relationObjectTypes: ['event'], multiple: true } },
  ],
  defaultContent: [
    createContentBlock('heading', '# 物品概览', { level: 1 }),
    createContentBlock('metadata', '---\n物品名称: \n物品类型: \n稀有度: \n当前持有者: \n---'),
    
    createContentBlock('heading', '## 外观描述', { level: 2 }),
    createContentBlock('paragraph', '物品的外观、材质、工艺细节...'),
    
    createContentBlock('heading', '## 功能特性', { level: 2 }),
    createContentBlock('list', '- 主要功能\n- 特殊能力\n- 使用限制', { type: 'unordered' }),
    
    createContentBlock('heading', '## 历史来源', { level: 2 }),
    createContentBlock('paragraph', '物品的制作历史、传承过程...'),
    
    createContentBlock('heading', '## 使用说明', { level: 2 }),
    createContentBlock('paragraph', '如何使用、注意事项、副作用...'),
    
    createContentBlock('heading', '## 相关传说', { level: 2 }),
    createContentBlock('paragraph', '与物品相关的传说、故事...'),
  ],
  tags: ['物品', '道具', '设定'],
  isSystem: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 组织/势力文档模板
 */
export const ORGANIZATION_TEMPLATE: DocumentTemplate = {
  id: 'organization-template',
  name: '组织设定',
  description: '创建政治组织、商会、教派等组织的详细设定',
  category: 'organization',
  icon: '🏛️',
  attributes: [
    { name: '组织名称', type: 'text' as AttributeType, required: true },
    { name: '组织类型', type: 'enum' as AttributeType, options: ['政府', '军队', '商会', '教派', '学院', '秘密组织'] },
    { name: '成立时间', type: 'date' as AttributeType },
    { name: '总部地点', type: 'relation' as AttributeType, options: { relationObjectTypes: ['place'] } },
    { name: '领导者', type: 'relation' as AttributeType, options: { relationObjectTypes: ['person'] } },
    { name: '成员数量', type: 'number' as AttributeType },
    { name: '影响力', type: 'rating' as AttributeType, options: { max: 5 } },
    { name: '组织状态', type: 'enum' as AttributeType, options: ['活跃', '衰落', '重组', '解散'] },
    { name: '盟友组织', type: 'relation' as AttributeType, options: { relationObjectTypes: ['organization'], multiple: true } },
    { name: '敌对组织', type: 'relation' as AttributeType, options: { relationObjectTypes: ['organization'], multiple: true } },
  ],
  defaultContent: [
    createContentBlock('heading', '# 组织概览', { level: 1 }),
    createContentBlock('metadata', '---\n组织名称: \n组织类型: \n成立时间: \n领导者: \n---'),
    
    createContentBlock('heading', '## 组织宗旨', { level: 2 }),
    createContentBlock('paragraph', '组织的成立目标、核心理念、价值观...'),
    
    createContentBlock('heading', '## 组织架构', { level: 2 }),
    createContentBlock('list', '- 领导层\n- 管理层\n- 执行层\n- 各部门职能', { type: 'unordered' }),
    
    createContentBlock('heading', '## 发展历史', { level: 2 }),
    createContentBlock('paragraph', '组织的成立背景、重要发展阶段...'),
    
    createContentBlock('heading', '## 重要成员', { level: 2 }),
    createContentBlock('paragraph', '关键人物、他们的角色和贡献...'),
    
    createContentBlock('heading', '## 影响力范围', { level: 2 }),
    createContentBlock('paragraph', '组织的势力范围、主要活动区域...'),
    
    createContentBlock('heading', '## 对外关系', { level: 2 }),
    createContentBlock('paragraph', '与其他组织的关系、合作或冲突...'),
  ],
  tags: ['组织', '势力', '政治'],
  isSystem: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 空白文档模板
 */
export const BLANK_TEMPLATE: DocumentTemplate = {
  id: 'blank-template',
  name: '空白文档',
  description: '创建一个空白的富文本文档',
  category: 'custom',
  icon: '📄',
  attributes: [
    { name: '标题', type: 'text' as AttributeType, required: true },
    { name: '分类', type: 'text' as AttributeType },
    { name: '标签', type: 'multi-select' as AttributeType },
  ],
  defaultContent: [
    createContentBlock('heading', '# 新文档', { level: 1 }),
    createContentBlock('paragraph', '开始编写您的内容...'),
  ],
  tags: ['通用', '空白'],
  isSystem: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * 所有系统模板
 */
export const DOCUMENT_TEMPLATES: Record<string, DocumentTemplate> = {
  character: CHARACTER_TEMPLATE,
  location: LOCATION_TEMPLATE,
  event: EVENT_TEMPLATE,
  item: ITEM_TEMPLATE,
  organization: ORGANIZATION_TEMPLATE,
  blank: BLANK_TEMPLATE,
};

/**
 * 根据分类获取模板
 */
export function getTemplatesByCategory(category: string): DocumentTemplate[] {
  return Object.values(DOCUMENT_TEMPLATES).filter(template => 
    template.category === category || category === 'all'
  );
}

/**
 * 根据ID获取模板
 */
export function getTemplateById(id: string): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES[id.replace('-template', '')];
}

/**
 * 创建文档实例
 */
export function createDocumentFromTemplate(
  templateId: string, 
  title: string,
  customAttributes?: Record<string, any>
): Partial<import('../types').RichTextDocument> {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const now = new Date().toISOString();
  const attributes = template.attributes.map(attr => ({
    id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: attr.name,
    type: attr.type,
    value: customAttributes?.[attr.name] || attr.defaultValue || null,
    options: attr.options || {},
    validation: attr.required ? { required: true } : {},
    description: '',
    createdAt: now,
    updatedAt: now,
  }));

  return {
    title,
    category: template.category,
    metadata: {
      attributes,
      tags: [...template.tags],
      aliases: [],
      templateId: template.id,
      custom: {},
      links: {
        internal: [],
        external: [],
        backlinks: [],
      },
    },
    content: JSON.parse(JSON.stringify(template.defaultContent)), // 深拷贝
    plainText: template.defaultContent.map(block => block.content).join('\n'),
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
} 