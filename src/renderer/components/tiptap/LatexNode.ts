import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { nodePasteRule, ReactNodeViewRenderer } from "@tiptap/react";
import { LatexNodeView } from "./LatexNodeView";
import Paragraph from "@tiptap/extension-paragraph";

// Must be extended to add the new node type [either Inline or Display]
export const LatexNode = Node.create({
  atom: false,
  selectable: true,

  addAttributes: () => ({
    code: {
      default: "",
    },
    formOpen: {
      default: false,
      parseHTML: (element) => element.dataset.formopen === "true",
    },
    display: {
      default: false,
      parseHTML: (element) => element.dataset.display === "true",
    },
  }),

  parseHTML() {
    return [
      {
        tag: "latex",
      },
    ];
  },

  renderHTML({
    HTMLAttributes: { display, formOpen, ...HTMLAttributes },
    node,
  }) {
    return [
      "latex",
      mergeAttributes(HTMLAttributes, {
        "data-display": node.attrs.display,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LatexNodeView);
  },

  addKeyboardShortcuts() {
    return {
      // ↓ your new keyboard shortcut
      "Alt-x": () =>
        this.editor.commands.insertContent(
          `<latex data-display='false' code='' data-formopen='true'></latex-inline>`
        ),
      "Alt-z": () =>
        this.editor.commands.insertContent(
          `<latex data-display='true' code='' data-formopen='true'></latex-inline>`
        ),
    };
  },
});

const inlineInputRule = /(?:^\$|\s\$)([^\$]+)(?:\$$|\$\s)/gs;
const inlinePastRule = /(\$([^\$]+?)\$)/g;

export const InlineLatex = LatexNode.extend({
  name: "inlineLatex",
  group: "inline",
  inline: true,

  parseHTML() {
    return [
      {
        tag: "latex",
        getAttrs: (node) =>
          (node as HTMLElement).dataset.display === "true" ? false : null,
      },
    ];
  },

  renderText(this, props) {
    return `\\(${props.node.attrs.code}\\)`;
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: (text) => {
          const match = inlineInputRule.exec(text);
          if (!match) return null;
          return {
            match,
            index: match.index,
            text: match[0],
            replaceWith: match[0].trim(),
            data: { code: match[1] },
          };
        },
        type: this.type,
        getAttributes: (match) => {
          return {
            formOpen: false,
            code: match.data?.code,
          };
        },
      }),
    ];
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: inlinePastRule,
        type: this.type,
        getAttributes: (match: any) => {
          return {
            code: match[2],
          };
        },
      }),
    ];
  },
});

const displayInputRule = /(\$\$([^\$]+)\$\$)/g;
const displayPastRule = /(\$\$([^\$]*?)\$\$)/g;

export const DisplayLatex = LatexNode.extend({
  name: "displayLatex",
  group: "block",
  inline: false,

  parseHTML() {
    return [
      {
        tag: "latex",
        getAttrs: (node) =>
          (node as HTMLElement).dataset.display === "true" ? null : false,
      },
    ];
  },

  renderText(this, props) {
    return `\\[\n${props.node.attrs.code}\n\\]\n`;
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: displayInputRule,
        type: this.type,
        getAttributes: (match) => {
          return {
            formOpen: false,
            code: match[2],
            display: true,
          };
        },
      }),
    ];
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: displayPastRule,
        type: this.type,
        getAttributes: (match: any) => {
          return {
            code: match[2],
            formOpen: false,
            display: true,
          };
        },
      }),
    ];
  },
});
