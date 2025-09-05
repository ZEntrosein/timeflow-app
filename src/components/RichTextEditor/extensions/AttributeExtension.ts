/**
 * AttributeExtension - TimeFlow属性系统的Tiptap扩展
 * 支持在文档中嵌入和编辑属性
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { AttributeNodeView } from './AttributeNodeView';

export interface AttributeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    attribute: {
      /**
       * 插入属性块
       */
      insertAttributeBlock: (attributes: any[]) => ReturnType;
      /**
       * 更新属性块
       */
      updateAttributeBlock: (nodeId: string, attributes: any[]) => ReturnType;
    };
  }
}

export const AttributeExtension = Node.create<AttributeOptions>({
  name: 'attributeBlock',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }

          return {
            'data-id': attributes.id,
          };
        },
      },
      attributes: {
        default: [],
        parseHTML: element => {
          const data = element.getAttribute('data-attributes');
          try {
            return data ? JSON.parse(data) : [];
          } catch {
            return [];
          }
        },
        renderHTML: attributes => {
          return {
            'data-attributes': JSON.stringify(attributes.attributes || []),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="attribute-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        {
          'data-type': 'attribute-block',
        },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AttributeNodeView);
  },

  addCommands() {
    return {
      insertAttributeBlock:
        (attributes: any[]) =>
        ({ commands, state }) => {
          const nodeId = `attr-${Date.now()}`;
          return commands.insertContent({
            type: this.name,
            attrs: {
              id: nodeId,
              attributes,
            },
          });
        },

      updateAttributeBlock:
        (nodeId: string, attributes: any[]) =>
        ({ tr, state }) => {
          let nodePos = null;
          
          state.doc.descendants((node, pos) => {
            if (node.type.name === this.name && node.attrs.id === nodeId) {
              nodePos = pos;
              return false;
            }
          });

          if (nodePos !== null) {
            tr.setNodeMarkup(nodePos, undefined, {
              id: nodeId,
              attributes,
            });
            return true;
          }

          return false;
        },
    };
  },
}); 