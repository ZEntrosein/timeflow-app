# TimeFlow - 时间轴管理系统

一个基于React的现代化时间轴管理应用，专注于事件管理和对象关系可视化。现已集成强大的属性系统，提供类似 Obsidian 的数据管理体验。

## 🚀 项目特色

### 🎯 核心功能
- **多视图显示**: 时间轴视图、数据表格视图等多种展示方式
- **智能对象管理**: 分类管理人物、地点、项目等对象
- **交互式检查器**: 实时编辑事件和对象属性
- **多选操作**: 支持批量选择和操作
- **响应式设计**: 适配各种屏幕尺寸

### ✨ v2.2 最新功能 - 完整属性系统集成
- **📊 表格视图**: 全新的数据表格视图，支持实时搜索和过滤
- **🎨 专用编辑器**: 为每种属性类型提供专门的编辑界面
- **🔍 智能搜索**: 基于属性内容的全文搜索功能
- **📋 增强模板**: 改进的模板选择器，显示属性数量和描述
- **⚡ 实时过滤**: 动态显示搜索结果统计

### 🆕 智能属性系统 (v2.1)
- **18种数据类型**: 文本、数字、日期、布尔值、多选、列表、URL、邮箱、电话、颜色、评分、进度、货币、时长、位置、文件、关系、枚举
- **属性模板**: 预定义的人物、地点、项目、事件、组织模板
- **属性验证**: 支持必填、长度限制、数值范围等验证规则
- **属性配置**: 可配置显示顺序、分组、搜索性等

## 🏗️ 技术架构

### 前端技术栈
```typescript
React 18+         // 核心框架
TypeScript        // 类型安全
Vite             // 构建工具
Tailwind CSS     // 样式框架
Zustand          // 状态管理
Konva.js         // 2D 画布渲染
```

### 项目结构
```
timeflow-app/
├── src/
│   ├── components/        # React组件
│   │   ├── Dialogs/      # 弹窗组件
│   │   ├── Layout/       # 布局组件
│   │   ├── UI/           # 通用UI组件
│   │   │   └── AttributeEditor/  # 属性编辑器组件
│   │   │       └── editors/      # 专用编辑器组件 (18种类型)
│   │   └── Views/        # 视图组件
│   │       ├── TimelineView/     # 时间轴视图
│   │       └── AttributeViews/   # 属性视图组件
│   ├── store/            # 状态管理
│   ├── types/            # TypeScript类型定义
│   ├── constants/        # 常量配置
│   │   └── attributeTemplates.ts # 属性模板定义
│   ├── utils/            # 工具函数
│   │   └── attributeSearch.ts    # 属性搜索和过滤工具
│   └── services/         # 服务层
├── public/               # 静态资源
└── docs/                 # 文档
```

## 🛠️ 安装与启动

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐) 或 npm

### 快速开始
```bash
# 克隆项目
git clone <repository-url>
cd timeflow-app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 📖 使用指南

### 基本操作

#### 🎬 事件管理
1. **创建事件**: 点击顶部状态栏的"+ 事件"按钮
2. **编辑事件**: 
   - 双击时间轴上的事件
   - 或在检查器中点击"编辑"按钮
3. **移动事件**: 直接拖拽事件到新的时间位置
4. **选择事件**: 单击选择，Ctrl+单击多选

#### 👥 对象管理
1. **查看对象**: 左侧边栏显示按类别分组的对象
2. **选择对象**: 点击对象类别 → 选择具体对象
3. **编辑对象**: 在检查器中点击"编辑"按钮
4. **创建对象**: 点击侧边栏底部的"创建新对象"按钮

#### 🔍 检查器编辑
1. **选择目标**: 选择事件或对象
2. **进入编辑模式**: 点击检查器面板中的"编辑"按钮
3. **修改属性**: 直接编辑表单字段
4. **保存更改**: 点击"保存"按钮确认修改

### 🆕 属性系统

#### 📝 支持的属性类型
TimeFlow 支持 18 种丰富的属性类型，满足各种数据管理需求：

| 类型 | 描述 | 示例 |
|------|------|------|
| **文本** | 单行或多行文本 | 姓名、描述 |
| **数字** | 整数或小数 | 年龄、价格 |
| **日期** | 日期和时间 | 出生日期、创建时间 |
| **布尔值** | 是/否选择 | 是否完成、是否激活 |
| **列表** | 文本项目列表 | 技能列表、标签 |
| **多选** | 预定义选项多选 | 职业、类别 |
| **关系** | 关联其他对象 | 负责人、相关项目 |
| **链接** | URL 地址 | 官网、参考资料 |
| **文件** | 文件附件 | 文档、图片 |
| **邮箱** | 电子邮件地址 | 联系邮箱 |
| **电话** | 电话号码 | 联系电话 |
| **颜色** | 颜色值 | 主题色、标记色 |
| **评分** | 星级评分 | 重要程度、满意度 |
| **进度** | 百分比进度 | 完成进度、达成率 |
| **货币** | 金额 | 预算、成本 |
| **时长** | 持续时间 | 工作时长、项目周期 |
| **位置** | 地理位置 | 地址、坐标 |
| **枚举** | 单选选项 | 状态、优先级 |

#### 🎨 智能编辑器
每种属性类型都配备专门的编辑器：
- **文本编辑器**: 自动切换单行/多行模式
- **日期选择器**: 支持日期和日期时间格式
- **多选下拉**: 支持搜索和自定义选项
- **评分控件**: 可视化星级评分
- **进度条**: 实时显示进度百分比
- **颜色选择器**: 颜色预览和十六进制输入
- **关系选择器**: 智能关联对象选择

#### 📋 属性模板系统
内置 5 种预定义模板，快速创建结构化对象：

**👤 人物模板**
- 出生日期、职业、国籍
- 重要程度评分、联系方式
- 个人网站链接

**📍 地点模板**
- 地理坐标、类型分类
- 建立时间、人口统计
- 面积信息、重要程度

**📁 项目模板**
- 开始/结束日期、状态管理
- 进度跟踪、预算管理
- 负责人关联、优先级评分

**⚡ 事件模板**
- 事件类型、影响范围
- 重要程度、持续时间
- 相关人物和地点关联

**🏢 组织机构模板**
- 成立日期、组织类型
- 规模信息、员工数量
- 总部地址、联系信息

#### 🔍 数据视图系统

**表格视图**
- 类似 Excel 的数据表格
- 支持内联编辑
- 多列排序和过滤
- 批量选择和操作

**看板视图** (开发中)
- 按状态分组的卡片视图
- 拖拽式状态更新
- 可自定义泳道

**图表视图** (开发中)
- 数据可视化图表
- 统计分析功能
- 多种图表类型

#### ⚡ 高级搜索功能

**全文搜索**
- 搜索对象名称、描述
- 搜索属性值内容
- 支持模糊匹配

**属性过滤器**
- 18 种操作符支持
- 多条件组合过滤
- 实时过滤结果

**过滤操作符**
```typescript
equals          // 等于
not_equals      // 不等于
contains        // 包含
not_contains    // 不包含
starts_with     // 开头是
ends_with       // 结尾是
greater_than    // 大于
less_than       // 小于
greater_equal   // 大于等于
less_equal      // 小于等于
between         // 介于之间
in              // 在列表中
not_in          // 不在列表中
is_empty        // 为空
is_not_empty    // 不为空
is_true         // 为真
is_false        // 为假
```

**搜索构建器**
```typescript
// 使用搜索构建器创建复杂查询
const searchConfig = new SearchConfigBuilder()
  .query('重要项目')
  .searchIn(['name', 'description'])
  .filter(
    new FilterBuilder()
      .equals('status', '进行中')
      .greaterThan('priority', 3)
      .build()
  )
  .sortBy('createdAt', 'desc')
  .limit(20)
  .build();

const results = searchByAttributes(data, searchConfig);
```

### 高级功能

#### ⌨️ 键盘快捷键
- `Escape`: 清除选择
- `Delete` / `Backspace`: 删除选中项目
- `Ctrl + 单击`: 多选模式
- `滚轮 + Ctrl`: 精细缩放

#### 🖱️ 鼠标操作
- **单击**: 选择项目
- **双击**: 编辑项目
- **拖拽**: 移动事件时间
- **右键**: 打开上下文菜单
- **滚轮**: 时间轴缩放

## 🎨 界面布局

### 主要区域
```
┌─────────────────────────────────────────────────┐
│                   工具栏                         │
├──────────┬─────────────────────┬─────────────────┤
│          │                     │                 │
│  侧边栏   │      时间轴视图      │    检查器面板    │
│ (对象管理) │    (事件显示)       │   (属性编辑)     │
│          │                     │                 │
├──────────┴─────────────────────┴─────────────────┤
│                  状态栏                          │
└─────────────────────────────────────────────────┘
```

### 检查器面板
- **📅 时间**: 编辑事件/对象的时间属性
- **📋 属性**: 编辑基本信息（名称、描述、类型等）
- **🔗 关系**: 管理对象间关系
- **⚡ 依赖**: 管理依赖关系
- **📎 附件**: 文件附件管理

## 🗃️ 数据模型

### 事件 (TimelineEvent)
```typescript
interface TimelineEvent {
  id: string;              // 唯一标识
  title: string;           // 事件标题
  description?: string;    // 事件描述
  startTime: number;       // 开始时间
  endTime?: number;        // 结束时间（可选）
  category?: string;       // 事件类型
  location?: string;       // 发生地点
  tags?: string[];         // 标签列表
  participants?: string[]; // 参与者ID列表
  attributes?: Attribute[]; // 自定义属性
}
```

### 对象 (WorldObject)
```typescript
interface WorldObject {
  id: string;              // 唯一标识
  name: string;            // 对象名称
  description?: string;    // 对象描述
  category: string;        // 对象类型
  tags?: string[];         // 标签列表
  attributes: Attribute[]; // 自定义属性
  state?: DisplayState;    // 显示状态
}
```

### 增强属性 (Attribute)
```typescript
interface Attribute {
  id: string;              // 属性ID
  name: string;            // 属性名称
  type: AttributeType;     // 属性类型（18种）
  value: AttributeValue;   // 属性值
  options?: AttributeOptions;      // 属性选项配置
  validation?: AttributeValidation; // 验证规则
  description?: string;    // 属性描述
  showInTable?: boolean;   // 是否在表格中显示
  searchable?: boolean;    // 是否可搜索
  sortOrder?: number;      // 排序权重
  group?: string;          // 属性分组
  createdAt: string;       // 创建时间
  updatedAt: string;       // 更新时间
}
```

### 属性模板 (AttributeTemplate)
```typescript
interface AttributeTemplate {
  id: string;              // 模板ID
  name: string;            // 模板名称
  description?: string;    // 模板描述
  icon?: string;           // 模板图标
  attributes: Attribute[]; // 预定义属性列表
  appliesTo: ObjectType[] | 'all'; // 适用对象类型
  isSystem?: boolean;      // 是否为系统模板
  createdAt: string;       // 创建时间
  updatedAt: string;       // 更新时间
}
```

## 🔧 开发指南

### 状态管理
项目使用 Zustand 进行状态管理，主要 Store 包括：

- **UIStore**: 界面状态管理
- **ProjectStore**: 项目数据管理
- **ViewStore**: 视图配置管理
- **SelectionStore**: 选择状态管理

### 添加新功能
1. 在 `types/index.ts` 中定义相关类型
2. 在对应的 Store 中添加状态和操作方法
3. 创建对应的组件文件
4. 在父组件中集成新功能

### 扩展属性系统
1. **添加新属性类型**:
   - 在 `AttributeType` 枚举中添加新类型
   - 创建对应的编辑器组件
   - 在 `AttributeEditor` 中注册新编辑器

2. **创建自定义模板**:
   ```typescript
   import { createCustomTemplate } from './constants/attributeTemplates';
   
   const customTemplate = createCustomTemplate(
     '自定义模板',
     '模板描述',
     [/* 属性定义 */],
     ['object'], // 适用类型
     '🎯' // 图标
   );
   ```

3. **使用搜索功能**:
   ```typescript
   import { searchByAttributes, FilterBuilder } from './utils/attributeSearch';
   
   // 创建过滤器
   const filters = new FilterBuilder()
     .equals('status', '完成')
     .greaterThan('priority', 3)
     .build();
   
   // 执行搜索
   const results = searchByAttributes(data, {
     query: '搜索关键词',
     searchAttributes: ['name', 'description'],
     filters,
     sort: [{ attribute: 'createdAt', order: 'desc' }]
   });
   ```

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 React Hooks 规范
- 组件文件使用 PascalCase 命名
- 工具函数使用 camelCase 命名

## 🚧 开发中功能

### 即将推出
- [ ] 关系图谱可视化
- [ ] 数据导入/导出（CSV、JSON、Excel）
- [ ] 协作编辑
- [ ] 版本历史
- [ ] 主题自定义
- [ ] 插件系统
- [ ] 看板视图
- [ ] 图表视图
- [ ] 甘特图视图

### 性能优化
- [ ] 虚拟滚动
- [ ] 事件分片渲染
- [ ] 状态持久化
- [ ] 离线支持
- [ ] 增量搜索
- [ ] 缓存优化

## 🐛 已知问题

### 当前限制
1. 大量事件渲染可能影响性能（>1000个）
2. 关系图谱功能仍在开发中
3. 导入导出功能待完善
4. 属性验证功能需要进一步优化

### 解决方案
1. 计划实现虚拟滚动优化
2. 关系功能将在下个版本发布
3. 支持多种数据格式的导入导出
4. 完善属性验证和错误提示

## 📝 更新日志

### v2.2.0 (2024-01-XX) - 完整属性系统集成
- ✨ **新增**: 数据表格视图，支持实时搜索和过滤
- ✨ **新增**: 18种专用属性编辑器组件
- ✨ **新增**: 基于属性内容的全文搜索功能
- ✨ **新增**: 增强的模板选择器，显示属性数量和描述
- ✨ **新增**: 实时搜索结果统计和过滤
- 🔄 **重构**: AttributeEditor 使用专用编辑器替换 SimpleEditor
- 🎨 **优化**: 视图切换和数据展示用户体验
- 🐛 **修复**: 多选属性选项保存和显示问题
- 📊 **集成**: 属性搜索工具完全集成到主界面

### v2.1.0 (2024-01-XX) - 属性系统大更新
- ✨ **新增**: 18种属性类型支持
- ✨ **新增**: 智能属性编辑器系统
- ✨ **新增**: 5种预定义属性模板
- ✨ **新增**: 表格视图和数据展示组件
- ✨ **新增**: 高级搜索和过滤功能
- ✨ **新增**: 属性验证和统计功能
- 🔄 **重构**: 属性数据模型完全重构
- 🎨 **优化**: 属性编辑界面用户体验
- 📚 **文档**: 完善属性系统使用文档

### v2.0.0 (2024-01-XX)
- ✨ 新增：检查器实时编辑功能
- 🔄 重构：对象管理从时间轴移至侧边栏
- 🎨 优化：全新的对象列表弹窗设计
- 🐛 修复：选择状态同步问题
- 📱 改进：响应式布局优化

### v1.0.0 (2024-01-XX)
- 🎉 初始版本发布
- ⚡ 基础时间轴功能
- 👥 对象管理系统
- 🎨 现代化UI设计

## 🤝 贡献指南

### 参与开发
1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 报告问题
- 使用 GitHub Issues 报告 Bug
- 提供详细的复现步骤
- 包含系统环境信息

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为此项目做出贡献的开发者和社区成员！

特别感谢 [Obsidian](https://obsidian.md/) 团队，本项目的属性系统设计深受 Obsidian 优秀属性管理功能的启发。

---

**开发团队** | **文档更新时间**: 2024-01-XX | **版本**: v2.1.0