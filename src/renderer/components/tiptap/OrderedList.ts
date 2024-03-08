import { wrappingInputRule } from "@tiptap/core";
import { OrderedList as TOrderedList } from "@tiptap/extension-ordered-list";

const inputRegex = /^\s*(\d+)\.\s$/;
export const OrderedList = TOrderedList.extend({
  addAttributes() {
    const parent = this.parent?.();

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
              style: "display: grid",
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
}).configure({ HTMLAttributes: { class: "tiptap" } });
