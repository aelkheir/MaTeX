import { Editor } from "@tiptap/react";
import React from "react";
import { Button, ButtonProps } from "react-aria-components";
import {
  Bold,
  CapitalX,
  ColumnAfter,
  ColumnBefore,
  DeleteColumn,
  DeleteRow,
  DeleteTable,
  Italic,
  List,
  Paragraph,
  RowAfter,
  RowBefore,
  SmallX,
  Table,
} from "./Icon";

interface MenuProps {
  editor: Editor | null;
}

export const Menu: React.FC<MenuProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const isBoldActive = editor.isActive("bold");
  const isItalicActive = editor.isActive("italic");
  const isParagraphActive = editor.isActive("paragraph");
  const isOrderedListActive = editor.isActive("orderedList");
  const isInlineLatexActive = editor.isActive("inlineLatex");
  const isDisplayLatexActive = editor.isActive("displayLatex");
  const isTableActive = editor.isActive("table");

  return (
    <>
      <MenuButton
        onPress={() => editor.chain().focus().toggleBold().run()}
        isDisabled={!editor.can().chain().focus().toggleBold().run()}
        isActive={isBoldActive}
      >
        <Bold />
      </MenuButton>

      <MenuButton
        onPress={() => editor.chain().focus().toggleItalic().run()}
        isDisabled={!editor.can().chain().focus().toggleItalic().run()}
        isActive={isItalicActive}
      >
        <Italic />
      </MenuButton>

      <MenuButton
        onPress={() => editor.chain().focus().setParagraph().run()}
        isActive={isParagraphActive}
      >
        <Paragraph />
      </MenuButton>

      <MenuButton
        onPress={() => editor.chain().focus().toggleOrderedList().run()}
        isDisabled={!editor.can().chain().focus().toggleOrderedList().run()}
        isActive={isOrderedListActive}
      >
        <List />
      </MenuButton>

      <MenuButton
        onPress={() =>
          editor
            ?.chain()
            .insertContent({
              type: "inlineLatex",
              attrs: {
                code: "",
                display: false,
                formOpen: true,
              },
            })
            .run()
        }
        className={`ml-1 border border-outline flex justify-center items-center ${
          isInlineLatexActive ? "bg-primary/[12%]" : ""
        }`}
        isActive={isInlineLatexActive}
      >
        <SmallX />
      </MenuButton>

      <MenuButton
        onPress={() =>
          editor
            ?.chain()
            .insertContent({
              type: "displayLatex",
              attrs: {
                code: "",
                display: true,
                formOpen: true,
              },
            })
            .run()
        }
        isActive={isDisplayLatexActive}
      >
        <CapitalX />
      </MenuButton>

      <MenuButton
        onPress={() => {
          editor
            .chain()
            .focus()
            .insertTable({ rows: 1, cols: 2, withHeaderRow: false })
            .run();
        }}
        isActive={isTableActive}
      >
        <Table />
      </MenuButton>
      {isTableActive ? (
        <>
          <MenuButton
            onPress={() => editor.chain().focus().addColumnBefore().run()}
            className={`ml-1 border border-outline flex justify-center items-center`}
          >
            <ColumnBefore />
          </MenuButton>

          <MenuButton
            onPress={() => editor.chain().focus().deleteColumn().run()}
            className={`ml-1 border border-outline flex justify-center items-center`}
          >
            <DeleteColumn />
          </MenuButton>

          <MenuButton
            onPress={() => editor.chain().focus().addColumnAfter().run()}
            className={`ml-1 border border-outline flex justify-center items-center`}
          >
            <ColumnAfter />
          </MenuButton>

          <MenuButton
            onPress={() => editor.chain().focus().addRowBefore().run()}
            className={`ml-1 border border-outline flex justify-center items-center`}
          >
            <RowBefore />
          </MenuButton>

          <MenuButton
            onPress={() => editor.chain().focus().deleteRow().run()}
            className={`ml-1 border border-outline flex justify-center items-center`}
          >
            <DeleteRow />
          </MenuButton>

          <MenuButton
            onPress={() => editor.chain().focus().addRowAfter().run()}
            className={`ml-1 border border-outline flex justify-center items-center`}
          >
            <RowAfter />
          </MenuButton>

          <MenuButton
            onPress={() => editor.chain().focus().deleteTable().run()}
          >
            <DeleteTable />
          </MenuButton>
        </>
      ) : null}
    </>
  );
};

const MenuButton = ({
  onPress,
  isActive,
  children,
}: ButtonProps & { isActive?: boolean }) => {
  return (
    <Button
      type="button"
      onPress={onPress}
      className={`w-8 aspect-square ml-1 flex justify-center items-center ${
        isActive ? "bg-primary/[12%]" : ""
      }`}
    >
      {children}
    </Button>
  );
};
