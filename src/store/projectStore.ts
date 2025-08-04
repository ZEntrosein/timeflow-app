import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  ProjectData,
  WorldObject,
  TimelineEvent,
  Timeline,
  DisplayState,
  ObjectState,
  TimelineQueryOptions,
  AttributeType
} from '../types';

// 创建默认的时间轴
const createDefaultTimeline = (): Timeline => ({
  id: 'default-timeline',
  name: '主时间轴',
  description: '项目的主要时间轴',
  currentTime: 0,
  startTime: 0,
  endTime: 1000,
  events: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// 创建默认的项目数据
const createDefaultProject = (): ProjectData => ({
  id: 'default-project',
  name: 'TimeFlow 项目',
  description: '一个新的时间流项目',
  version: '1.0.0',
  objects: [],
  timeline: createDefaultTimeline(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export interface ProjectStore {
  // 项目数据
  project: ProjectData | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  
  // 项目管理
  createProject: (name: string, description?: string) => void;
  loadProject: (projectData: ProjectData) => void;
  updateProject: (updates: Partial<Omit<ProjectData, 'id' | 'createdAt'>>) => void;
  saveProject: () => Promise<void>;
  resetProject: () => void;
  createSampleData: () => void;
  
  // 对象管理
  addObject: (object: Omit<WorldObject, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateObject: (objectId: string, updates: Partial<WorldObject>) => void;
  removeObject: (objectId: string) => void;
  getObject: (objectId: string) => WorldObject | undefined;
  getObjects: () => WorldObject[];
  
  // 事件管理
  addEvent: (event: Omit<TimelineEvent, 'id' | 'createdAt'>) => string;
  updateEvent: (eventId: string, updates: Partial<TimelineEvent>) => void;
  removeEvent: (eventId: string) => void;
  getEvent: (eventId: string) => TimelineEvent | undefined;
  getEvents: (options?: TimelineQueryOptions) => TimelineEvent[];
  
  // 时间轴管理
  updateTimeline: (updates: Partial<Timeline>) => void;
  setCurrentTime: (time: number) => void;
  
  // 查询功能
  getObjectStateAt: (objectId: string, timestamp: number) => ObjectState | null;
  getObjectStatesInRange: (objectId: string, startTime: number, endTime: number) => ObjectState[];
  getEventsForObject: (objectId: string, options?: TimelineQueryOptions) => TimelineEvent[];
  
  // 工具函数
  markUnsaved: () => void;
  markSaved: () => void;
  generateId: () => string;
}

export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        project: createDefaultProject(), // 立即创建默认项目而不是null
        isLoading: false,
        hasUnsavedChanges: false,
        
        // 项目管理
        createProject: (name, description) => {
          const newProject = createDefaultProject();
          newProject.name = name;
          if (description) newProject.description = description;
          newProject.updatedAt = new Date().toISOString();
          
          set({ 
            project: newProject, 
            hasUnsavedChanges: true 
          });
        },
        
        loadProject: (projectData) => {
          set({ 
            project: projectData, 
            hasUnsavedChanges: false,
            isLoading: false 
          });
        },
        
        updateProject: (updates) => {
          const state = get();
          if (!state.project) return;
          
          const updatedProject = {
            ...state.project,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          
          set({ 
            project: updatedProject, 
            hasUnsavedChanges: true 
          });
        },
        
        saveProject: async () => {
          // 这里可以添加实际的保存逻辑（API调用、文件保存等）
          set({ hasUnsavedChanges: false });
        },
        
        resetProject: () => {
          set({ 
            project: createDefaultProject(), 
            hasUnsavedChanges: false 
          });
        },

        // 创建示例数据
        createSampleData: () => {
          const sampleProject = createDefaultProject();
          
          // 添加示例对象
          const sampleObjects: WorldObject[] = [
            {
              id: 'person-1',
              name: '张三',
              description: '项目负责人',
              category: 'person',
              attributes: [
                { 
                  id: 'attr-1',
                  name: 'startTime', 
                  value: '100', 
                  type: AttributeType.NUMBER,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                { 
                  id: 'attr-2',
                  name: 'role', 
                  value: '项目经理', 
                  type: AttributeType.TEXT,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                { 
                  id: 'attr-3',
                  name: 'department', 
                  value: '技术部', 
                  type: AttributeType.TEXT,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
              ],
              tags: ['人物', '管理'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              state: { visible: true, locked: false }
            },
            {
              id: 'place-1',
              name: '会议室A',
              description: '主要项目讨论场所',
              category: 'place',
              attributes: [
                { 
                  id: 'attr-4',
                  name: 'startTime', 
                  value: '50', 
                  type: AttributeType.NUMBER,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                { 
                  id: 'attr-5',
                  name: 'capacity', 
                  value: '20', 
                  type: AttributeType.NUMBER,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                { 
                  id: 'attr-6',
                  name: 'location', 
                  value: '二楼东侧', 
                  type: AttributeType.TEXT,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
              ],
              tags: ['地点', '会议'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              state: { visible: true, locked: false }
            },
            {
              id: 'project-1',
              name: 'TimeFlow开发',
              description: '时间轴可视化项目',
              category: 'project',
              attributes: [
                { 
                  id: 'attr-7',
                  name: 'startTime', 
                  value: '0', 
                  type: AttributeType.NUMBER,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                { 
                  id: 'attr-8',
                  name: 'priority', 
                  value: '高', 
                  type: AttributeType.TEXT,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                { 
                  id: 'attr-9',
                  name: 'status', 
                  value: '进行中', 
                  type: AttributeType.TEXT,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
              ],
              tags: ['项目', '开发'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              state: { visible: true, locked: false }
            }
          ];

          // 添加示例事件
          const sampleEvents: TimelineEvent[] = [
            {
              id: 'event-1',
              title: '项目启动会议',
              description: '确定项目目标和里程碑',
              startTime: 50,
              endTime: 100,
              category: 'meeting',
              participants: ['person-1'],
              location: 'place-1',
              tags: ['会议', '启动'],
              attributes: [
                { 
                  id: 'event-attr-1',
                  name: 'attendees', 
                  value: 5, 
                  type: AttributeType.NUMBER,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                { 
                  id: 'event-attr-2',
                  name: 'outcome', 
                  value: '项目计划确认', 
                  type: AttributeType.TEXT,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              state: { visible: true, locked: false }
            },
            {
              id: 'event-2',
              title: '需求分析',
              description: '详细分析用户需求',
              startTime: 120,
              endTime: 200,
              category: 'task',
              participants: ['person-1'],
              tags: ['分析', '需求'],
              attributes: [
                { 
                  id: 'event-attr-3',
                  name: 'complexity', 
                  value: '中等', 
                  type: AttributeType.TEXT,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                { 
                  id: 'event-attr-4',
                  name: 'progress', 
                  value: 80, 
                  type: AttributeType.NUMBER,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              state: { visible: true, locked: false }
            },
            {
              id: 'event-3',
              title: '原型设计',
              description: '创建交互原型',
              startTime: 180,
              endTime: 280,
              category: 'design',
              participants: ['person-1'],
              tags: ['设计', '原型'],
              attributes: [
                { 
                  id: 'event-attr-5',
                  name: 'tool', 
                  value: 'Figma', 
                  type: AttributeType.TEXT,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                { 
                  id: 'event-attr-6',
                  name: 'iterations', 
                  value: 3, 
                  type: AttributeType.NUMBER,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              state: { visible: true, locked: false }
            },
            {
              id: 'event-4',
              title: '开发冲刺1',
              description: '实现基础功能',
              startTime: 300,
              endTime: 450,
              category: 'development',
              participants: ['person-1'],
              tags: ['开发', '冲刺'],
              attributes: [
                { 
                  id: 'event-attr-7',
                  name: 'sprint', 
                  value: 1, 
                  type: AttributeType.NUMBER,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                { 
                  id: 'event-attr-8',
                  name: 'features', 
                  value: '基础UI+状态管理', 
                  type: AttributeType.TEXT,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              state: { visible: true, locked: false }
            },
            {
              id: 'event-5',
              title: '测试和优化',
              description: '功能测试和性能优化',
              startTime: 500,
              endTime: 600,
              category: 'testing',
              participants: ['person-1'],
              tags: ['测试', '优化'],
              attributes: [
                { 
                  id: 'event-attr-9',
                  name: 'test_cases', 
                  value: 25, 
                  type: AttributeType.NUMBER,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                { 
                  id: 'event-attr-10',
                  name: 'bugs_found', 
                  value: 3, 
                  type: AttributeType.NUMBER,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              state: { visible: true, locked: false }
            }
          ];

          // 更新项目数据
          sampleProject.objects = sampleObjects;
          sampleProject.timeline.events = sampleEvents;
          sampleProject.timeline.updatedAt = new Date().toISOString();

          set({
            project: sampleProject,
            hasUnsavedChanges: true,
          });
        },
        
        // 对象管理
        addObject: (objectData) => {
          const state = get();
          if (!state.project) return '';
          
          const id = state.generateId();
          const newObject: WorldObject = {
            ...objectData,
            id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          const updatedProject = {
            ...state.project,
            objects: [...state.project.objects, newObject],
            updatedAt: new Date().toISOString(),
          };
          
          set({ 
            project: updatedProject, 
            hasUnsavedChanges: true 
          });
          
          return id;
        },
        
        updateObject: (objectId, updates) => {
          const state = get();
          if (!state.project) return;
          
          const updatedObjects = state.project.objects.map(obj =>
            obj.id === objectId
              ? { ...obj, ...updates, updatedAt: new Date().toISOString() }
              : obj
          );
          
          const updatedProject = {
            ...state.project,
            objects: updatedObjects,
            updatedAt: new Date().toISOString(),
          };
          
          set({ 
            project: updatedProject, 
            hasUnsavedChanges: true 
          });
        },
        
        removeObject: (objectId: string) => {
          const state = get();
          if (!state.project) return;
          
          // 同时删除相关的事件（从参与者列表中移除该对象）
          const filteredEvents = state.project.timeline.events.filter(
            event => !event.participants?.includes(objectId)
          );
          
          const updatedProject = {
            ...state.project,
            objects: state.project.objects.filter(obj => obj.id !== objectId),
            timeline: {
              ...state.project.timeline,
              events: filteredEvents,
              updatedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
          
          set({ 
            project: updatedProject, 
            hasUnsavedChanges: true 
          });
        },
        
        getObject: (objectId) => {
          const state = get();
          return state.project?.objects.find(obj => obj.id === objectId);
        },
        
        getObjects: () => {
          const state = get();
          return state.project?.objects || [];
        },
        
        // 事件管理
        addEvent: (eventData: Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
          const state = get();
          if (!state.project) return '';

          const id = state.generateId();
          const newEvent: TimelineEvent = {
            ...eventData,
            id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const updatedEvents = [...state.project.timeline.events, newEvent]
            .sort((a, b) => a.startTime - b.startTime);

          set({
            project: {
              ...state.project,
              timeline: {
                ...state.project.timeline,
                events: updatedEvents,
                updatedAt: new Date().toISOString(),
              },
            },
            hasUnsavedChanges: true,
          });

          return id;
        },

        updateEvent: (eventId: string, updates: Partial<TimelineEvent>) => {
          const state = get();
          if (!state.project) return;

          const eventIndex = state.project.timeline.events.findIndex(e => e.id === eventId);
          if (eventIndex === -1) return;

          const updatedEvent = {
            ...state.project.timeline.events[eventIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          };

          const updatedEvents = [...state.project.timeline.events];
          updatedEvents[eventIndex] = updatedEvent;
          
          // 如果更新了开始时间，重新排序
          if (updates.startTime !== undefined) {
            updatedEvents.sort((a, b) => a.startTime - b.startTime);
          }

          set({
            project: {
              ...state.project,
              timeline: {
                ...state.project.timeline,
                events: updatedEvents,
                updatedAt: new Date().toISOString(),
              },
            },
            hasUnsavedChanges: true,
          });
        },

        removeEvent: (eventId: string) => {
          const state = get();
          if (!state.project) return;

          const updatedEvents = state.project.timeline.events.filter(e => e.id !== eventId);

          set({
            project: {
              ...state.project,
              timeline: {
                ...state.project.timeline,
                events: updatedEvents,
                updatedAt: new Date().toISOString(),
              },
            },
            hasUnsavedChanges: true,
          });
        },

        getEvent: (eventId: string) => {
          const state = get();
          if (!state.project) return undefined;
          return state.project.timeline.events.find(e => e.id === eventId);
        },

        getEvents: (options?: TimelineQueryOptions) => {
          const state = get();
          if (!state.project) return [];

          let events = [...state.project.timeline.events];

          if (options?.startTime !== undefined) {
            events = events.filter(e => e.startTime >= options.startTime!);
          }

          if (options?.endTime !== undefined) {
            events = events.filter(e => 
              e.startTime <= options.endTime! || 
              (e.endTime && e.endTime <= options.endTime!)
            );
          }

          if (options?.sortOrder === 'desc') {
            events.reverse();
          }

          return events;
        },
        
        // 时间轴管理
        updateTimeline: (updates) => {
          const state = get();
          if (!state.project) return;
          
          const updatedProject = {
            ...state.project,
            timeline: {
              ...state.project.timeline,
              ...updates,
              updatedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
          
          set({ 
            project: updatedProject, 
            hasUnsavedChanges: true 
          });
        },
        
        setCurrentTime: (time) => {
          const state = get();
          if (!state.project) return;
          
          const updatedProject = {
            ...state.project,
            timeline: {
              ...state.project.timeline,
              currentTime: time,
              updatedAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
          
          set({ 
            project: updatedProject, 
            hasUnsavedChanges: true 
          });
        },
        
        // 查询功能
        getObjectStateAt: (objectId: string, timestamp: number) => {
          const state = get();
          if (!state.project) return null;

          const object = state.project.objects.find(obj => obj.id === objectId);
          if (!object) return null;

          // 构建当前属性值映射（基于对象的当前属性值）
          const attributeValues: Record<string, string | number | null> = {};
          object.attributes.forEach(attr => {
            attributeValues[attr.id] = attr.value;
          });

          return {
            objectId,
            timestamp,
            attributeValues,
          };
        },

        getObjectStatesInRange: (objectId: string, startTime: number, endTime: number) => {
          const state = get();
          if (!state.project) return [];

          // 简化实现：只返回开始和结束时间点的状态
          const startState = state.getObjectStateAt(objectId, startTime);
          const endState = state.getObjectStateAt(objectId, endTime);

          return [startState, endState].filter(Boolean) as ObjectState[];
        },
        
        getEventsForObject: (objectId: string, options?: TimelineQueryOptions) => {
          const state = get();
          if (!state.project) return [];

          // 获取与指定对象相关的事件（参与者中包含该对象ID）
          let events = state.project.timeline.events.filter(event => 
            event.participants?.includes(objectId)
          );

          if (options?.startTime !== undefined) {
            events = events.filter(e => e.startTime >= options.startTime!);
          }

          if (options?.endTime !== undefined) {
            events = events.filter(e => 
              e.startTime <= options.endTime! || 
              (e.endTime && e.endTime <= options.endTime!)
            );
          }

          if (options?.sortOrder === 'desc') {
            events.reverse();
          }

          return events;
        },
        
        // 工具函数
        markUnsaved: () => set({ hasUnsavedChanges: true }),
        markSaved: () => set({ hasUnsavedChanges: false }),
        
        generateId: () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }),
      {
        name: 'project-store',
        // 只持久化项目数据，不持久化加载状态
        partialize: (state) => ({
          project: state.project,
          hasUnsavedChanges: state.hasUnsavedChanges,
        }),
      }
    ),
    {
      name: 'project-store',
    }
  )
); 