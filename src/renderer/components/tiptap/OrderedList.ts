import { wrappingInputRule } from "@tiptap/core";
import { OrderedList as TOrderedList } from "@tiptap/extension-ordered-list";

const inputRegex = /^\s*(\d+)\.\s$/;
export const OrderedList = TOrderedList.extend({
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
