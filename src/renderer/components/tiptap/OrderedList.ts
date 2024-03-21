import { wrappingInputRule, Node } from "@tiptap/core";
import { OrderedList as TOrderedList } from "@tiptap/extension-ordered-list";
import { ListItem as TListItem } from "@tiptap/extension-list-item";
import { Attributes, mergeAttributes } from "@tiptap/react";

const inputRegex = /^\s*(\d+)\.\s$/;
export const OrderedList = TOrderedList.extend({
  addAttributes() {
    const parent: Attributes = this.parent?.();
    return {
      ...parent,
      gridCols: {
        default: 2,
        renderHTML(attributes) {
          return (
            attributes.orientation === "vertical" && {
              style: `grid-template-columns: repeat(${attributes.gridCols}, minmax(0, 1fr))`,
              "data-cols": attributes.gridCols,
            }
          );
        },
      },
      orientation: {
        default: "horizantal",
        renderHTML(attributes) {
          return (
            attributes.orientation === "vertical" && {
              style: "display: grid; gap: 8px; column-gap: 20px",
              "data-orientation": attributes.orientation,
            }
          );
        },
      },
    };
  },
  addInputRules() {
    let inputRule = wrappingInputRule({
      find: inputRegex,
      type: this.type,
    });
    if (this.options.keepMarks || this.options.keepAttributes) {
      inputRule = wrappingInputRule({
        find: inputRegex,
        type: this.type,
        keepMarks: this.options.keepMarks,
        keepAttributes: this.options.keepAttributes,
        getAttributes: () => {
          return this.editor.getAttributes("textStyle");
        },
        editor: this.editor,
      });
    }
    return [inputRule];
  },
}).configure({
  HTMLAttributes: { class: "pl-5 [&_>_p]:-ml-5 [&>p]:text-red-400" },
});

export const ListItem = TListItem.extend({
  content: "listItemIntro? (paragraph block*)",
});

export const ListItemIntro = Node.create({
  name: "listItemIntro",
  group: "block",
  content: "inline*",
  defining: true,
  parseHTML() {
    return [
      {
        tag: "p.intro",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "p",
      mergeAttributes({ ...HTMLAttributes, class: "text-red-500" }),
      0,
    ];
  },

  // @ts-ignore
  addCommands() {
    return {
      toggleIntroParagraph:
        () =>
        // @ts-ignore
        ({ commands, state, tr }) => {
          const { selection } = state;
          const { $from } = selection;
          const listItem = state.schema.nodes.listItem;
          const paragraph = state.schema.nodes.paragraph;
          const introParagraph = state.schema.nodes.introParagraph;
          const pos = $from.before($from.depth);

          // Check if the current position is within a listItem
          if ($from.node($from.depth - 1).type !== listItem) return false;

          // Check if the listItem has at least two children
          let contentCount = 0;
          const listItemNode = $from.node($from.depth - 1);
          listItemNode.forEach(() => {
            contentCount += 1;
          });
          if (contentCount < 2) return false;

          // Check if the current node is the first child of the listItem
          const isFirstChild = $from.index($from.depth - 1) === 0;
          if (!isFirstChild) return false;

          const currentType = $from.node($from.depth).type;
          const targetType =
            currentType === paragraph ? introParagraph : paragraph;

          // Attempt to set node type, ensuring it's within a listItem
          tr.setNodeMarkup(pos, targetType);

          // Dispatch transaction if it's valid
          if (
            !tr.doc
              .resolve(pos)
              .parent.type.validContent(tr.doc.resolve(pos).nodeAfter)
          ) {
            return false; // Abort if the resulting content would be invalid
          }

          commands.run(tr);
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // @ts-ignore
      "Mod-Shift-P": () => this.editor.commands.toggleIntroParagraph(),
    };
  },
});
